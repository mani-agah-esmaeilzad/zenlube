import { config } from "../config";
import { logger } from "../logger";

const DEFAULT_ENDPOINT = "https://console.melipayamak.com/api/send/otp";

type SendOtpArgs = {
  phone: string;
  code: string;
  expiresAt: Date;
  templateId?: string;
};

type MelipayamakResponse = {
  status?: string;
  messageId?: string;
  MessageId?: string;
  error?: string;
  ErrorMessage?: string;
};

export async function sendMelipayamakOtp({ phone, code, expiresAt, templateId }: SendOtpArgs) {
  const endpoint = process.env.MELIPAYAMAK_ENDPOINT ?? DEFAULT_ENDPOINT;
  const payload = {
    username: config.MELIPAYAMAK_USERNAME,
    password: config.MELIPAYAMAK_PASSWORD,
    to: [phone],
    text: code,
    from: config.MELIPAYAMAK_FROM,
    templateId,
    expireTime: Math.max(30, Math.round((expiresAt.getTime() - Date.now()) / 1000)),
  };

  const MAX_ATTEMPTS = 3;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`ارسال پیامک با وضعیت ${response.status} شکست خورد: ${body}`);
      }

      const data = (await response.json().catch(() => ({}))) as MelipayamakResponse;

      if (data.error || data.ErrorMessage) {
        throw new Error(data.error ?? data.ErrorMessage ?? "پاسخ نامعتبر از سرویس پیامک دریافت شد.");
      }

      return {
        messageId: data.messageId ?? data.MessageId ?? null,
      } as const;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("ارسال پیامک با خطای ناشناخته شکست خورد.");
      logger.warn("Melipayamak OTP send failed", { attempt, phone, error: lastError.message });
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  logger.error("Melipayamak OTP delivery failed permanently", {
    phone,
    error: lastError?.message,
  });

  throw lastError ?? new Error("ارسال پیامک با مشکل مواجه شد.");
}
