import { Smsir } from "sms-typescript/lib";

import { config } from "../config";
import { logger } from "../logger";

type SendOtpArgs = {
  phone: string;
  code: string;
  expiresAt: Date;
  templateId?: number;
};

type SendTextArgs = {
  phone: string;
  message: string;
};

type SmsIrResponse = {
  status?: number | string;
  message?: string;
  data?: {
    verificationCodeId?: string | number;
    messageId?: string | number;
    messageIds?: Array<string | number>;
  } | null;
  [key: string]: unknown;
};

const SMS_REQUEST_TIMEOUT_MS = 8_000;

/** A response proving the provider did not accept a text message. */
export class SmsIrSendRejectedError extends Error {}

function createClient() {
  const apiKey = config.SMSIR_API_KEY ?? config.SMS_API_KEY;
  const lineNumber = config.SMSIR_LINE_NUMBER ?? Number(config.SMS_SENDER_NUMBER);

  if (!apiKey || !lineNumber || !Number.isFinite(lineNumber)) {
    throw new SmsIrSendRejectedError("تنظیمات sms.ir کامل نیست.");
  }

  return new Smsir(apiKey, lineNumber);
}

function buildParameters(code: string, ttlSeconds: number) {
  const parameters = [{ name: config.SMSIR_TEMPLATE_CODE_PARAM, value: code }];

  if (config.SMSIR_TEMPLATE_EXPIRY_PARAM) {
    const ttlMinutes = Math.max(1, Math.ceil(ttlSeconds / 60));
    parameters.push({ name: config.SMSIR_TEMPLATE_EXPIRY_PARAM, value: ttlMinutes.toString() });
  }

  return parameters;
}

function isErrorStatus(status?: number | string) {
  if (typeof status === "number") return status !== 1 && status !== 200;
  if (typeof status === "string") {
    const parsed = Number(status);
    return Number.isFinite(parsed) && parsed !== 1 && parsed !== 200;
  }
  return false;
}

export async function sendSmsIrOtp({ phone, code, expiresAt, templateId }: SendOtpArgs) {
  const targetTemplateId = templateId ?? config.SMSIR_TEMPLATE_ID;
  if (!targetTemplateId) throw new Error("قالب پیامک تایید sms.ir تنظیم نشده است.");

  const ttlSeconds = Math.max(30, Math.round((expiresAt.getTime() - Date.now()) / 1000));
  const parameters = buildParameters(code, ttlSeconds);
  const client = createClient();

  const response = await client.SendVerifyCode(phone, targetTemplateId, parameters);
  const data = (response?.data ?? {}) as SmsIrResponse;

  if (isErrorStatus(data.status)) {
    throw new Error(data.message ?? "ارسال پیامک تایید توسط sms.ir پذیرفته نشد.");
  }

  const messageId = data.data?.verificationCodeId ?? data.data?.messageId ?? null;
  return { messageId, raw: data } as const;
}

export async function sendSmsIrText({ phone, message }: SendTextArgs) {
  const apiKey = config.SMSIR_API_KEY ?? config.SMS_API_KEY;
  const lineNumber = config.SMSIR_LINE_NUMBER ?? Number(config.SMS_SENDER_NUMBER);

  if (!apiKey || !lineNumber || !Number.isFinite(lineNumber)) {
    throw new SmsIrSendRejectedError("تنظیمات sms.ir کامل نیست.");
  }

  const response = await fetch("https://api.sms.ir/v1/send/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      lineNumber,
      messageText: message,
      mobiles: [phone],
      sendDateTime: null,
    }),
    signal: AbortSignal.timeout(SMS_REQUEST_TIMEOUT_MS),
  });

  const data = (await response.json().catch(() => ({}))) as SmsIrResponse;

  if (!response.ok || isErrorStatus(data.status)) {
    logger.warn("sms.ir text send failed", { status: response.status, data });
    const messageText = data.message ?? "ارسال پیامک توسط sms.ir ناموفق بود.";
    // A timeout or server error may happen after acceptance. Retrying it could
    // send the same customer notification twice.
    if ((response.status >= 400 && response.status < 500 && response.status !== 408) || response.ok) {
      throw new SmsIrSendRejectedError(messageText);
    }
    throw new Error(messageText);
  }

  const messageId = data.data?.messageId ?? data.data?.messageIds?.[0] ?? null;
  if (Number(data.status) !== 1 && Number(data.status) !== 200 && !messageId) {
    throw new Error("پاسخ تایید ارسال sms.ir معتبر نیست؛ وضعیت پیامک باید بررسی شود.");
  }

  return { messageId, raw: data } as const;
}
