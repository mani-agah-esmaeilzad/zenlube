import { randomUUID } from "node:crypto";

import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { config } from "@/lib/config";
import { normalizeIranPhone, validateIranPhone } from "@/lib/phone";
import { logger } from "@/lib/logger";
import { MelipayamakSendRejectedError, sendMelipayamakOtp, sendMelipayamakText } from "./melipayamak";
import {
  SmsIrSendRejectedError,
  sendSmsIrOtp,
  sendSmsIrTemplate,
  sendSmsIrText,
  type SmsIrTemplateParameter,
} from "./smsir";

type SmsTokens = Record<string, string | number | null | undefined>;
type RuntimeSmsProvider = "smsir" | "melipayamak" | "console" | "disabled";

type SendSmsArgs = {
  phone: string;
  message: string;
  eventType?: string;
  templateName?: string;
  dedupeKey?: string;
  forceResend?: boolean;
  smsIrTemplate?: {
    templateId: number;
    parameters: SmsIrTemplateParameter[];
  };
};

const templates: Record<string, string> = {
  otp: "کد تایید اویل‌بار: {code}",
  order_created: "سفارش شما در اویل‌بار ثبت شد. شماره سفارش: {orderNumber}",
  merchant_order_created: "سفارش جدید اویل‌بار {orderNumber}\nاقلام: {items}\nبرای بررسی وارد پنل مدیریت شوید.",
  payment_started: "درخواست پرداخت سفارش {orderNumber} در اویل‌بار ایجاد شد.",
  payment_success: "پرداخت سفارش {orderNumber} با موفقیت تأیید شد. سفارش شما وارد صف آماده‌سازی اویل‌بار شد.",
  payment_failed: "پرداخت سفارش {orderNumber} ناموفق بود. لطفا دوباره تلاش کنید.",
  status_paid: "پرداخت سفارش {orderNumber} تأیید شد و سفارش شما در صف بررسی اویل‌بار قرار گرفت.",
  status_preparing: "سفارش {orderNumber} در حال آماده‌سازی و بسته‌بندی است. به‌محض تحویل به شرکت حمل، کد پیگیری برایتان ارسال می‌شود.",
  status_shipped: "سفارش {orderNumber} تحویل شرکت حمل شد. کد پیگیری: {trackingCode}",
  status_shipped_pending_tracking: "سفارش {orderNumber} تحویل شرکت حمل شد. کد پیگیری پس از ثبت برای شما پیامک می‌شود.",
  tracking_code_added: "کد پیگیری سفارش {orderNumber}: {trackingCode}. برای پیگیری مرسوله از همین کد استفاده کنید.",
  status_delivered: "سفارش {orderNumber} تحویل داده شد. ممنونیم که اویل‌بار را انتخاب کردید.",
  status_cancelled: "سفارش {orderNumber} لغو شد. اگر سوالی دارید با پشتیبانی اویل‌بار تماس بگیرید.",
};

export function renderSmsTemplate(templateName: string, tokens: SmsTokens = {}) {
  const template = templates[templateName] ?? templateName;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(tokens[key] ?? ""));
}

function orderNumber(orderId: string) {
  return orderId.slice(0, 10).toUpperCase();
}

function hasSmsIrCredentials({ requireTemplate = false } = {}) {
  const hasApiKey = Boolean(config.SMSIR_API_KEY || config.SMS_API_KEY);
  const hasLine = Boolean(config.SMSIR_LINE_NUMBER || config.SMS_SENDER_NUMBER);
  const hasTemplate = Boolean(config.SMSIR_TEMPLATE_ID);
  return hasApiKey && hasLine && (!requireTemplate || hasTemplate);
}

function hasMelipayamakCredentials() {
  return Boolean(config.MELIPAYAMAK_USERNAME && config.MELIPAYAMAK_PASSWORD && config.MELIPAYAMAK_FROM);
}

function resolveSmsRuntime({ requireOtpTemplate = false } = {}) {
  let provider = config.SMS_PROVIDER as RuntimeSmsProvider;
  let inferred = false;

  if ((provider === "console" || provider === "disabled") && hasSmsIrCredentials({ requireTemplate: requireOtpTemplate })) {
    provider = "smsir";
    inferred = true;
  } else if ((provider === "console" || provider === "disabled") && hasMelipayamakCredentials()) {
    provider = "melipayamak";
    inferred = true;
  }

  const sandboxWasExplicitlyEnabled = process.env.SMS_SANDBOX_MODE === "true";
  const enabled = config.SMS_ENABLED || inferred;
  const sandbox = sandboxWasExplicitlyEnabled || (!inferred && config.SMS_SANDBOX_MODE);

  return { provider, enabled, sandbox };
}

type SmsLogDetails = {
  phone: string;
  eventType: string;
  templateName?: string;
  message: string;
  status: string;
  provider?: string;
  providerResponse?: unknown;
  dedupeKey?: string;
  errorMessage?: string;
};

function smsLogData(args: SmsLogDetails) {
  const storedMessage = args.eventType === "otp"
    ? "کد تایید اویل‌بار: [محافظت‌شده]"
    : args.eventType === "purchase_feedback_invite"
      ? "لینک اختصاصی نظرسنجی خرید اویل‌بار: [محافظت‌شده]"
      : args.message;

  return {
    phone: args.phone,
    eventType: args.eventType,
    templateName: args.templateName,
    message: storedMessage,
    status: args.status,
    provider: args.provider,
    providerResponse: args.providerResponse == null ? Prisma.JsonNull : (args.providerResponse as Prisma.InputJsonValue),
    dedupeKey: args.dedupeKey,
    errorMessage: args.errorMessage ?? null,
  };
}

async function logSms(args: SmsLogDetails) {
  try {
    await prisma.smsLog.create({
      data: smsLogData(args),
    });
  } catch (error) {
    logger.warn("SMS log failed", { error: error instanceof Error ? error.message : error, dedupeKey: args.dedupeKey });
  }
}

type SmsClaim =
  | { state: "claimed"; id: string; token: string }
  | { state: "completed" }
  | { state: "in-flight" }
  | { state: "uncertain" };

/**
 * Reserve a deduplicated notification before calling the provider. The unique
 * key makes the reservation atomic across concurrent serverless instances.
 * Only attempts known not to have sent a message can be retried. An abandoned
 * in-flight claim may already have reached the provider, so it never expires.
 * The token also prevents a late completion from overwriting a newer attempt.
 */
async function claimSms(args: SmsLogDetails, forceResend = false): Promise<SmsClaim> {
  if (!args.dedupeKey) return { state: "claimed", id: "", token: "" };

  const now = new Date();
  const token = randomUUID();
  const claimData = smsLogData({ ...args, status: "sending", providerResponse: { claimToken: token } });
  try {
    const created = await prisma.smsLog.create({
      data: {
        id: randomUUID(),
        ...claimData,
      },
      select: { id: true },
    });
    return { state: "claimed", id: created.id, token };
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const existing = await prisma.smsLog.findUnique({
      where: { dedupeKey: args.dedupeKey },
      select: { id: true, status: true },
    });
    if (!existing) throw new Error("ارسال پیامک قابل رزرو نیست.");
    if (existing.status === "sent" && !forceResend) return { state: "completed" };
    if (existing.status === "uncertain") return { state: "uncertain" };

    const retryableStatuses = forceResend
      ? ["failed", "disabled", "sandbox", "sent"]
      : ["failed", "disabled", "sandbox"];
    const retryable = retryableStatuses.includes(existing.status);
    if (!retryable) return { state: "in-flight" };

    const updated = await prisma.smsLog.updateMany({
      where: {
        id: existing.id,
        status: { in: retryableStatuses },
      },
      data: {
        ...claimData,
        createdAt: now,
      },
    });
    return updated.count === 1 ? { state: "claimed", id: existing.id, token } : { state: "in-flight" };
  }
}

async function finishSms(claim: Extract<SmsClaim, { state: "claimed" }>, args: SmsLogDetails) {
  if (!claim.id) {
    await logSms(args);
    return;
  }
  try {
    await prisma.smsLog.updateMany({
      where: {
        id: claim.id,
        status: "sending",
        providerResponse: { path: ["claimToken"], equals: claim.token },
      },
      data: smsLogData(args),
    });
  } catch (error) {
    logger.warn("SMS log update failed", { error: error instanceof Error ? error.message : error, dedupeKey: args.dedupeKey });
  }
}

export async function sendSms({ phone, message, eventType = "manual", templateName, dedupeKey, forceResend = false, smsIrTemplate }: SendSmsArgs) {
  const runtime = resolveSmsRuntime();
  const normalizedPhone = normalizeIranPhone(phone);

  const claim = await claimSms({
    phone: validateIranPhone(normalizedPhone) ? normalizedPhone : phone,
    eventType,
    templateName,
    message,
    status: "sending",
    dedupeKey,
  }, forceResend);
  if (claim.state === "completed" || claim.state === "in-flight") {
    logger.info("Duplicate or in-flight SMS skipped", { eventType, dedupeKey, state: claim.state });
    return { success: true, skipped: true } as const;
  }
  if (claim.state === "uncertain") {
    return { success: false, skipped: true, error: "نتیجه ارسال قبلی مشخص نیست؛ وضعیت پیامک باید در پنل ارائه‌دهنده بررسی شود." } as const;
  }

  if (!validateIranPhone(normalizedPhone)) {
    await finishSms(claim, { phone, eventType, templateName, message, status: "failed", dedupeKey, errorMessage: "شماره موبایل معتبر نیست." });
    return { success: false, skipped: true, error: "شماره موبایل معتبر نیست." } as const;
  }

  if (!runtime.enabled || runtime.provider === "disabled") {
    await finishSms(claim, { phone: normalizedPhone, eventType, templateName, message, status: "disabled", provider: runtime.provider, dedupeKey });
    return { success: true, skipped: true } as const;
  }

  if (runtime.sandbox || runtime.provider === "console") {
    logger.info("SMS sandbox", { phone: normalizedPhone, eventType, message });
    await finishSms(claim, { phone: normalizedPhone, eventType, templateName, message, status: "sandbox", provider: runtime.provider, dedupeKey });
    return { success: true, sandbox: true } as const;
  }

  try {
    const result = runtime.provider === "melipayamak"
      ? await sendMelipayamakText({ phone: normalizedPhone, message })
      : smsIrTemplate
        ? await sendSmsIrTemplate({ phone: normalizedPhone, ...smsIrTemplate })
        : await sendSmsIrText({ phone: normalizedPhone, message });

    await finishSms(claim, {
      phone: normalizedPhone,
      eventType,
      templateName,
      message,
      status: "sent",
      provider: runtime.provider,
      providerResponse: result.raw,
      dedupeKey,
    });
    return { success: true, result } as const;
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "ارسال پیامک ناموفق بود.";
    logger.warn("SMS send failed", { phone: normalizedPhone, eventType, error: messageText });
    const definitelyNotSent = error instanceof SmsIrSendRejectedError || error instanceof MelipayamakSendRejectedError;
    await finishSms(claim, {
      phone: normalizedPhone,
      eventType,
      templateName,
      message,
      status: definitelyNotSent ? "failed" : "uncertain",
      provider: runtime.provider,
      dedupeKey,
      errorMessage: messageText,
    });
    return { success: false, error: messageText } as const;
  }
}

export async function sendTemplateSms(
  phone: string,
  templateName: string,
  tokens: SmsTokens = {},
  options?: { eventType?: string; dedupeKey?: string; forceResend?: boolean },
) {
  return sendSms({
    phone,
    templateName,
    eventType: options?.eventType ?? templateName,
    dedupeKey: options?.dedupeKey,
    forceResend: options?.forceResend,
    message: renderSmsTemplate(templateName, tokens),
  });
}

export async function sendOtpSms(phone: string, code: string, expiresAt: Date) {
  const runtime = resolveSmsRuntime({ requireOtpTemplate: true });
  const normalizedPhone = normalizeIranPhone(phone);

  if (!runtime.enabled || runtime.provider === "disabled") {
    await sendTemplateSms(normalizedPhone, "otp", { code }, { eventType: "otp" });
    return { success: false, skipped: true, error: "سامانه پیامک فعال نیست." } as const;
  }

  if (runtime.sandbox || runtime.provider === "console") {
    await sendTemplateSms(normalizedPhone, "otp", { code }, { eventType: "otp" });
    return { success: false, sandbox: true, error: "سامانه پیامک در حالت تست است." } as const;
  }

  try {
    const result =
      runtime.provider === "melipayamak"
        ? await sendMelipayamakOtp({ phone: normalizedPhone, code, expiresAt })
        : await sendSmsIrOtp({ phone: normalizedPhone, code, expiresAt });

    await logSms({
      phone: normalizedPhone,
      eventType: "otp",
      templateName: "otp",
      message: renderSmsTemplate("otp", { code }),
      status: "sent",
      provider: runtime.provider,
      providerResponse: result.raw,
    });
    return { success: true, result } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "ارسال پیامک تایید ناموفق بود.";
    await logSms({
      phone: normalizedPhone,
      eventType: "otp",
      templateName: "otp",
      message: renderSmsTemplate("otp", { code }),
      status: "failed",
      provider: runtime.provider,
      errorMessage: message,
    });
    throw error;
  }
}

export const smsOrderNumber = orderNumber;
