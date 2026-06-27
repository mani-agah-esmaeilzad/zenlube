import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { config } from "@/lib/config";
import { normalizeIranPhone, validateIranPhone } from "@/lib/phone";
import { logger } from "@/lib/logger";
import { sendMelipayamakOtp, sendMelipayamakText } from "./melipayamak";
import { sendSmsIrOtp, sendSmsIrText } from "./smsir";

type SmsTokens = Record<string, string | number | null | undefined>;

type SendSmsArgs = {
  phone: string;
  message: string;
  eventType?: string;
  templateName?: string;
  dedupeKey?: string;
};

const templates: Record<string, string> = {
  otp: "کد تایید اویل‌بار: {code}",
  order_created: "سفارش شما در اویل‌بار ثبت شد. شماره سفارش: {orderNumber}",
  payment_started: "درخواست پرداخت سفارش {orderNumber} در اویل‌بار ایجاد شد.",
  payment_success: "پرداخت سفارش {orderNumber} با موفقیت انجام شد.",
  payment_failed: "پرداخت سفارش {orderNumber} ناموفق بود. لطفا دوباره تلاش کنید.",
  status_processing: "سفارش {orderNumber} در اویل‌بار در حال پردازش است.",
  status_ready: "سفارش {orderNumber} آماده ارسال شد.",
  status_shipped: "سفارش {orderNumber} ارسال شد. کد پیگیری: {trackingCode}",
  status_delivered: "سفارش {orderNumber} با موفقیت تحویل شد. ممنون از خرید شما از اویل‌بار.",
  status_cancelled: "سفارش {orderNumber} لغو شد. برای اطلاعات بیشتر با پشتیبانی اویل‌بار تماس بگیرید.",
};

export function renderSmsTemplate(templateName: string, tokens: SmsTokens = {}) {
  const template = templates[templateName] ?? templateName;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(tokens[key] ?? ""));
}

function orderNumber(orderId: string) {
  return orderId.slice(0, 10).toUpperCase();
}

async function logSms(args: {
  phone: string;
  eventType: string;
  templateName?: string;
  message: string;
  status: string;
  provider?: string;
  providerResponse?: unknown;
  dedupeKey?: string;
  errorMessage?: string;
}) {
  try {
    await prisma.smsLog.create({
      data: {
        phone: args.phone,
        eventType: args.eventType,
        templateName: args.templateName,
        message: args.message,
        status: args.status,
        provider: args.provider,
        providerResponse: args.providerResponse == null ? Prisma.JsonNull : (args.providerResponse as Prisma.InputJsonValue),
        dedupeKey: args.dedupeKey,
        errorMessage: args.errorMessage,
      },
    });
  } catch (error) {
    logger.warn("SMS log failed", { error: error instanceof Error ? error.message : error, dedupeKey: args.dedupeKey });
  }
}

async function alreadySent(dedupeKey?: string) {
  if (!dedupeKey) return false;
  const count = await prisma.smsLog.count({ where: { dedupeKey, status: { in: ["sent", "sandbox"] } } });
  return count > 0;
}

export async function sendSms({ phone, message, eventType = "manual", templateName, dedupeKey }: SendSmsArgs) {
  const normalizedPhone = normalizeIranPhone(phone);
  if (!validateIranPhone(normalizedPhone)) {
    await logSms({ phone, eventType, templateName, message, status: "failed", dedupeKey, errorMessage: "شماره موبایل معتبر نیست." });
    return { success: false, skipped: true, error: "شماره موبایل معتبر نیست." } as const;
  }

  if (await alreadySent(dedupeKey)) {
    logger.info("Duplicate SMS skipped", { eventType, dedupeKey });
    return { success: true, skipped: true } as const;
  }

  if (!config.SMS_ENABLED || config.SMS_PROVIDER === "disabled") {
    await logSms({ phone: normalizedPhone, eventType, templateName, message, status: "disabled", provider: config.SMS_PROVIDER, dedupeKey });
    return { success: true, skipped: true } as const;
  }

  if (config.SMS_SANDBOX_MODE || config.SMS_PROVIDER === "console") {
    logger.info("SMS sandbox", { phone: normalizedPhone, eventType, message });
    await logSms({ phone: normalizedPhone, eventType, templateName, message, status: "sandbox", provider: config.SMS_PROVIDER, dedupeKey });
    return { success: true, sandbox: true } as const;
  }

  try {
    const result =
      config.SMS_PROVIDER === "melipayamak"
        ? await sendMelipayamakText({ phone: normalizedPhone, message })
        : await sendSmsIrText({ phone: normalizedPhone, message });

    await logSms({
      phone: normalizedPhone,
      eventType,
      templateName,
      message,
      status: "sent",
      provider: config.SMS_PROVIDER,
      providerResponse: result.raw,
      dedupeKey,
    });
    return { success: true, result } as const;
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "ارسال پیامک ناموفق بود.";
    logger.warn("SMS send failed", { phone: normalizedPhone, eventType, error: messageText });
    await logSms({
      phone: normalizedPhone,
      eventType,
      templateName,
      message,
      status: "failed",
      provider: config.SMS_PROVIDER,
      dedupeKey,
      errorMessage: messageText,
    });
    return { success: false, error: messageText } as const;
  }
}

export async function sendTemplateSms(phone: string, templateName: string, tokens: SmsTokens = {}, options?: { eventType?: string; dedupeKey?: string }) {
  return sendSms({
    phone,
    templateName,
    eventType: options?.eventType ?? templateName,
    dedupeKey: options?.dedupeKey,
    message: renderSmsTemplate(templateName, tokens),
  });
}

export async function sendOtpSms(phone: string, code: string, expiresAt: Date) {
  const normalizedPhone = normalizeIranPhone(phone);
  if (!config.SMS_ENABLED || config.SMS_PROVIDER === "disabled" || config.SMS_SANDBOX_MODE || config.SMS_PROVIDER === "console") {
    return sendTemplateSms(normalizedPhone, "otp", { code }, { eventType: "otp" });
  }

  try {
    const result =
      config.SMS_PROVIDER === "melipayamak"
        ? await sendMelipayamakOtp({ phone: normalizedPhone, code, expiresAt })
        : await sendSmsIrOtp({ phone: normalizedPhone, code, expiresAt });

    await logSms({
      phone: normalizedPhone,
      eventType: "otp",
      templateName: "otp",
      message: renderSmsTemplate("otp", { code }),
      status: "sent",
      provider: config.SMS_PROVIDER,
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
      provider: config.SMS_PROVIDER,
      errorMessage: message,
    });
    throw error;
  }
}

export const smsOrderNumber = orderNumber;
