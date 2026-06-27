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

function ensureCredentials() {
  if (!config.MELIPAYAMAK_USERNAME || !config.MELIPAYAMAK_PASSWORD || !config.MELIPAYAMAK_FROM) {
    throw new Error("تنظیمات ملی‌پیامک کامل نیست.");
  }
}

async function postToMelipayamak(payload: Record<string, unknown>) {
  ensureCredentials();
  const response = await fetch(config.MELIPAYAMAK_ENDPOINT ?? DEFAULT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as MelipayamakResponse;
  if (!response.ok || data.error || data.ErrorMessage) {
    throw new Error(data.error ?? data.ErrorMessage ?? `ارسال پیامک با وضعیت ${response.status} ناموفق بود.`);
  }

  return { messageId: data.messageId ?? data.MessageId ?? null, raw: data } as const;
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
  });
}
