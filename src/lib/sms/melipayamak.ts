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
  const username = process.env.MELIPAYAMAK_USERNAME;
  const password = process.env.MELIPAYAMAK_PASSWORD;
  const from = process.env.MELIPAYAMAK_ORIGINATOR;
  const endpoint = process.env.MELIPAYAMAK_ENDPOINT ?? DEFAULT_ENDPOINT;

  if (!username || !password || !from) {
    throw new Error("اطلاعات اتصال به ملی پیامک در تنظیمات محیطی تکمیل نشده است.");
  }

  const payload = {
    username,
    password,
    to: [phone],
    text: code,
    from,
    templateId,
    expireTime: Math.round((expiresAt.getTime() - Date.now()) / 1000),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("ارسال پیامک با مشکل مواجه شد.");
  }

  const data = (await response.json().catch(() => ({}))) as MelipayamakResponse;

  if (data.error || data.ErrorMessage) {
    throw new Error(data.error ?? data.ErrorMessage ?? "پاسخ نامعتبر از سرویس پیامک دریافت شد.");
  }

  return {
    messageId: data.messageId ?? data.MessageId ?? null,
  } as const;
}
