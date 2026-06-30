const parseBoolean = (value: string | undefined, defaultValue: boolean) => {
  if (value == null) return defaultValue;
  return value === "true";
};

const parseNumber = (value: string | undefined, defaultValue: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

export const config = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/zenlube",
  DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "dev-secret",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID,
  ZARINPAL_BASE_URL: process.env.ZARINPAL_BASE_URL ?? "https://payment.zarinpal.com/pg/v4",
  ZARINPAL_STARTPAY_URL: process.env.ZARINPAL_STARTPAY_URL ?? "https://payment.zarinpal.com/pg/StartPay",
  ZARINPAL_CALLBACK_URL: process.env.ZARINPAL_CALLBACK_URL,
  ZARINPAL_PROXY_URL: process.env.ZARINPAL_PROXY_URL,
  ZARINPAL_PROXY_SECRET: process.env.ZARINPAL_PROXY_SECRET,
  ZARINPAL_AMOUNT_UNIT: (process.env.ZARINPAL_AMOUNT_UNIT as "toman" | "rial" | undefined) ?? "toman",
  PAYMENT_API_BASE_URL: process.env.PAYMENT_API_BASE_URL ?? process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL,
  PAYMENT_SERVICE_SECRET: process.env.PAYMENT_SERVICE_SECRET,

  SMS_PROVIDER: (process.env.SMS_PROVIDER as "smsir" | "melipayamak" | "console" | "disabled" | undefined) ?? "console",
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER_NUMBER: process.env.SMS_SENDER_NUMBER,
  SMS_ENABLED: parseBoolean(process.env.SMS_ENABLED, false),
  SMS_SANDBOX_MODE: parseBoolean(process.env.SMS_SANDBOX_MODE, true),

  MELIPAYAMAK_USERNAME: process.env.MELIPAYAMAK_USERNAME,
  MELIPAYAMAK_PASSWORD: process.env.MELIPAYAMAK_PASSWORD,
  MELIPAYAMAK_FROM: process.env.MELIPAYAMAK_FROM,
  MELIPAYAMAK_ENDPOINT: process.env.MELIPAYAMAK_ENDPOINT,

  SMSIR_API_KEY: process.env.SMSIR_API_KEY,
  SMSIR_LINE_NUMBER: process.env.SMSIR_LINE_NUMBER ? Number(process.env.SMSIR_LINE_NUMBER) : undefined,
  SMSIR_TEMPLATE_ID: process.env.SMSIR_TEMPLATE_ID ? Number(process.env.SMSIR_TEMPLATE_ID) : undefined,
  SMSIR_TEMPLATE_CODE_PARAM: process.env.SMSIR_TEMPLATE_CODE_PARAM ?? "CODE",
  SMSIR_TEMPLATE_EXPIRY_PARAM: process.env.SMSIR_TEMPLATE_EXPIRY_PARAM,

  STORAGE_DRIVER: (process.env.STORAGE_DRIVER as "local" | "s3" | undefined) ?? "local",
  STORAGE_BUCKET: process.env.STORAGE_BUCKET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,

  CRON_SECRET: process.env.CRON_SECRET,
  HCAPTCHA_SECRET: process.env.HCAPTCHA_SECRET,
  OTP_RATE_LIMIT_WINDOW: parseNumber(process.env.OTP_RATE_LIMIT_WINDOW, 300),
  OTP_RATE_LIMIT_MAX: parseNumber(process.env.OTP_RATE_LIMIT_MAX, 5),
  OTP_RESEND_WINDOW_SECONDS: parseNumber(process.env.OTP_RESEND_WINDOW_SECONDS, 20),
  QUESTION_RATE_LIMIT_WINDOW: parseNumber(process.env.QUESTION_RATE_LIMIT_WINDOW, 900),
  QUESTION_RATE_LIMIT_MAX: parseNumber(process.env.QUESTION_RATE_LIMIT_MAX, 3),
} as const;

export function isProduction() {
  return config.NODE_ENV === "production";
}

export function isDevelopment() {
  return config.NODE_ENV === "development";
}

export function isTest() {
  return config.NODE_ENV === "test";
}
