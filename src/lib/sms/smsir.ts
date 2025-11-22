import { Smsir } from "sms-typescript/lib";

import { config } from "../config";
import { logger } from "../logger";

type SendOtpArgs = {
  phone: string;
  code: string;
  expiresAt: Date;
  templateId?: number;
};

type SmsIrResponse = {
  status?: number | string;
  message?: string;
  data?: {
    verificationCodeId?: string | number;
    messageId?: string | number;
  } | null;
  [key: string]: unknown;
};

const smsIrClient = new Smsir(config.SMSIR_API_KEY, config.SMSIR_LINE_NUMBER);

function buildParameters(code: string, ttlSeconds: number) {
  const parameters = [
    {
      name: config.SMSIR_TEMPLATE_CODE_PARAM,
      value: code,
    },
  ];

  if (config.SMSIR_TEMPLATE_EXPIRY_PARAM) {
    const ttlMinutes = Math.max(1, Math.ceil(ttlSeconds / 60));
    parameters.push({
      name: config.SMSIR_TEMPLATE_EXPIRY_PARAM,
      value: ttlMinutes.toString(),
    });
  }

  return parameters;
}

function isErrorStatus(status?: number | string) {
  if (typeof status === "number") {
    return status !== 1 && status !== 200;
  }
  if (typeof status === "string") {
    const parsed = Number(status);
    return Number.isFinite(parsed) && parsed !== 1 && parsed !== 200;
  }
  return false;
}

export async function sendSmsIrOtp({ phone, code, expiresAt, templateId }: SendOtpArgs) {
  const ttlSeconds = Math.max(30, Math.round((expiresAt.getTime() - Date.now()) / 1000));
  const parameters = buildParameters(code, ttlSeconds);
  const targetTemplateId = templateId ?? config.SMSIR_TEMPLATE_ID;

  const MAX_ATTEMPTS = 3;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await smsIrClient.SendVerifyCode(phone, targetTemplateId, parameters);
      const data = (response?.data ?? {}) as SmsIrResponse;

      if (isErrorStatus(data.status)) {
        throw new Error(data.message ?? "ارسال پیامک تایید توسط sms.ir پذیرفته نشد.");
      }

      const messageId = data.data?.verificationCodeId ?? data.data?.messageId ?? null;

      return { messageId } as const;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("ارسال پیامک با خطای ناشناخته شکست خورد.");
      logger.warn("sms.ir OTP send failed", { attempt, phone, error: lastError.message });
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  logger.error("sms.ir OTP delivery failed permanently", {
    phone,
    error: lastError?.message,
  });

  throw lastError ?? new Error("ارسال پیامک با مشکل مواجه شد.");
}
