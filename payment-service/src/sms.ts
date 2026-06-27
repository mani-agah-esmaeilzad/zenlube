import { PrismaClient } from "../../src/generated/prisma";

type SmsArgs = {
  prisma: PrismaClient;
  phone: string;
  orderId: string;
  amount: string;
  refId: string;
};

function smsEnabled() {
  return process.env.SMS_ENABLED === "true" && process.env.SMS_PROVIDER !== "disabled";
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0098")) return `+98${digits.slice(4)}`;
  if (digits.startsWith("98")) return `+${digits}`;
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  return phone;
}

async function createSmsLog(args: {
  prisma: PrismaClient;
  phone: string;
  message: string;
  status: string;
  provider?: string;
  providerResponse?: unknown;
  errorMessage?: string;
  dedupeKey: string;
}) {
  await args.prisma.smsLog
    .create({
      data: {
        phone: args.phone,
        eventType: "payment_success",
        templateName: "payment_success",
        message: args.message,
        status: args.status,
        provider: args.provider,
        providerResponse: args.providerResponse === undefined ? undefined : (args.providerResponse as object),
        errorMessage: args.errorMessage,
        dedupeKey: args.dedupeKey,
      },
    })
    .catch(() => undefined);
}

async function sendSmsIr(phone: string, message: string) {
  const apiKey = process.env.SMSIR_API_KEY ?? process.env.SMS_API_KEY;
  const lineNumber = process.env.SMSIR_LINE_NUMBER ?? process.env.SMS_SENDER_NUMBER ?? process.env.SMS_SENDER;
  if (!apiKey || !lineNumber) {
    throw new Error("SMSIR_API_KEY/SMSIR_LINE_NUMBER تنظیم نشده است.");
  }

  const response = await fetch("https://api.sms.ir/v1/send/bulk", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      lineNumber,
      messageText: message,
      mobiles: [phone.replace(/^\+98/, "0")],
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`sms.ir HTTP ${response.status}`);
  }
  return data;
}

export async function sendPaymentSuccessSms(args: SmsArgs) {
  const phone = normalizePhone(args.phone);
  const orderNumber = args.orderId.slice(-8).toUpperCase();
  const message = `پرداخت سفارش ${orderNumber} در اویل‌بار با موفقیت انجام شد. کد پیگیری: ${args.refId}`;
  const dedupeKey = `payment_success:${args.orderId}:${args.refId}`;

  if (!smsEnabled()) {
    await createSmsLog({
      prisma: args.prisma,
      phone,
      message,
      status: "skipped",
      provider: process.env.SMS_PROVIDER ?? "disabled",
      dedupeKey,
    });
    return;
  }

  try {
    const provider = process.env.SMS_PROVIDER ?? "smsir";
    const providerResponse = provider === "smsir" ? await sendSmsIr(phone, message) : { skipped: "provider-not-implemented" };
    await createSmsLog({ prisma: args.prisma, phone, message, status: "sent", provider, providerResponse, dedupeKey });
  } catch (error) {
    await createSmsLog({
      prisma: args.prisma,
      phone,
      message,
      status: "failed",
      provider: process.env.SMS_PROVIDER,
      errorMessage: error instanceof Error ? error.message : "unknown",
      dedupeKey,
    });
  }
}
