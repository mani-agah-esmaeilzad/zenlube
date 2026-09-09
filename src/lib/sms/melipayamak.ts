import { config } from "../config";

const DEFAULT_ENDPOINT = "https://console.melipayamak.com/api/send/otp";

type SendOtpArgs = {
  phone: string;
  code: string;
  expiresAt: Date;
  templateId?: string;
};

type SendTextArgs = {
  phone: string;
  message: string;
};

type MelipayamakResponse = {
  status?: string;
  messageId?: string;
  MessageId?: string;
  error?: string;
  ErrorMessage?: string;
  [key: string]: unknown;
};

const SMS_REQUEST_TIMEOUT_MS = 8_000;

/** A response proving the provider did not accept a message. */
export class MelipayamakSendRejectedError extends Error {}

function ensureCredentials() {
  if (!config.MELIPAYAMAK_USERNAME || !config.MELIPAYAMAK_PASSWORD || !config.MELIPAYAMAK_FROM) {
    throw new MelipayamakSendRejectedError("تنظیمات ملی‌پیامک کامل نیست.");
  }
}

async function postToMelipayamak(payload: Record<string, unknown>, requireAcceptanceConfirmation = false) {
  ensureCredentials();
  const response = await fetch(config.MELIPAYAMAK_ENDPOINT ?? DEFAULT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(SMS_REQUEST_TIMEOUT_MS),
  });

  const data = (await response.json().catch(() => ({}))) as MelipayamakResponse;
  if (!response.ok || data.error || data.ErrorMessage) {
    const message = data.error ?? data.ErrorMessage ?? `ارسال پیامک با وضعیت ${response.status} ناموفق بود.`;
    if ((response.status >= 400 && response.status < 500 && response.status !== 408) || response.ok) {
      throw new MelipayamakSendRejectedError(message);
    }
    throw new Error(message);
  }

  const messageId = data.messageId ?? data.MessageId ?? null;
  const acceptedStatus = ["success", "sent", "ok", "1", "200"].includes(String(data.status ?? "").toLowerCase());
  if (requireAcceptanceConfirmation && !messageId && !acceptedStatus) {
    throw new Error("پاسخ تایید ارسال ملی‌پیامک معتبر نیست؛ وضعیت پیامک باید بررسی شود.");
  }

  return { messageId, raw: data } as const;
}

export async function sendMelipayamakOtp({ phone, code, expiresAt, templateId }: SendOtpArgs) {
  return postToMelipayamak({
    username: config.MELIPAYAMAK_USERNAME,
    password: config.MELIPAYAMAK_PASSWORD,
    to: [phone],
    text: code,
    from: config.MELIPAYAMAK_FROM,
    templateId,
    expireTime: Math.max(30, Math.round((expiresAt.getTime() - Date.now()) / 1000)),
  });
}

export async function sendMelipayamakText({ phone, message }: SendTextArgs) {
  return postToMelipayamak({
    username: config.MELIPAYAMAK_USERNAME,
    password: config.MELIPAYAMAK_PASSWORD,
    to: [phone],
    text: message,
    from: config.MELIPAYAMAK_FROM,
  }, true);
}
