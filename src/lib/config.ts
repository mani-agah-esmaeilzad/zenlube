import { z } from "zod";

const urlLike = (name: string) =>
  z.string().refine((value) => /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value), {
    message: `${name} باید یک آدرس معتبر باشد.`,
  });

const booleanEnv = (defaultValue: "true" | "false") =>
  z
    .enum(["true", "false"])
    .default(defaultValue)
    .transform((value) => value === "true");

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: urlLike("DATABASE_URL"),
    DATABASE_DIRECT_URL: urlLike("DATABASE_DIRECT_URL").optional(),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().max(1000).optional(),
    NEXTAUTH_SECRET: z.string().min(1, { message: "NEXTAUTH_SECRET الزامی است." }),
    NEXTAUTH_URL: z.string().url({ message: "NEXTAUTH_URL باید معتبر باشد." }).optional(),
    NEXT_PUBLIC_APP_URL: z.string().url({ message: "NEXT_PUBLIC_APP_URL باید معتبر باشد." }),

    ZARINPAL_MERCHANT_ID: z.string().min(1, { message: "شناسه پذیرنده زرین‌پال الزامی است." }),
    ZARINPAL_BASE_URL: z.string().url().default("https://payment.zarinpal.com/pg/v4"),
    ZARINPAL_STARTPAY_URL: z.string().url().default("https://payment.zarinpal.com/pg/StartPay"),
    ZARINPAL_CALLBACK_URL: z.string().url().optional(),
    ZARINPAL_PROXY_URL: z.string().url().optional(),
    ZARINPAL_PROXY_SECRET: z.string().optional(),
    ZARINPAL_AMOUNT_UNIT: z.enum(["toman", "rial"]).default("toman"),

    SMS_PROVIDER: z.enum(["smsir", "melipayamak", "console", "disabled"]).default("console"),
    SMS_API_KEY: z.string().optional(),
    SMS_SENDER_NUMBER: z.string().optional(),
    SMS_ENABLED: booleanEnv("false"),
    SMS_SANDBOX_MODE: booleanEnv("true"),

    MELIPAYAMAK_USERNAME: z.string().min(1).optional(),
    MELIPAYAMAK_PASSWORD: z.string().min(1).optional(),
    MELIPAYAMAK_FROM: z.string().min(1).optional(),
    MELIPAYAMAK_ENDPOINT: z.string().url().optional(),

    SMSIR_API_KEY: z.string().min(1).optional(),
    SMSIR_LINE_NUMBER: z.coerce.number().int().positive().optional(),
    SMSIR_TEMPLATE_ID: z.coerce.number().int().positive().optional(),
    SMSIR_TEMPLATE_CODE_PARAM: z.string().min(1).default("CODE"),
    SMSIR_TEMPLATE_EXPIRY_PARAM: z.string().min(1).optional(),

    STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
    STORAGE_BUCKET: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),

    CRON_SECRET: z.string().optional(),
    HCAPTCHA_SECRET: z.string().optional(),
    OTP_RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(300),
    OTP_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
    OTP_RESEND_WINDOW_SECONDS: z.coerce.number().int().positive().default(20),
    QUESTION_RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(900),
    QUESTION_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(3),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER === "s3") {
      if (!env.STORAGE_BUCKET) {
        ctx.addIssue({
          path: ["STORAGE_BUCKET"],
          code: z.ZodIssueCode.custom,
          message: "برای استفاده از ذخیره‌سازی S3 مقدار STORAGE_BUCKET الزامی است.",
        });
      }
      if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_REGION) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["AWS_ACCESS_KEY_ID"],
          message: "برای ذخیره‌سازی S3 باید کلیدهای AWS تنظیم شوند.",
        });
      }
    }

    if (env.SMS_ENABLED && env.SMS_PROVIDER === "smsir") {
      if (!env.SMSIR_API_KEY && !env.SMS_API_KEY) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMSIR_API_KEY"], message: "برای sms.ir کلید API لازم است." });
      }
      if (!env.SMSIR_LINE_NUMBER && !env.SMS_SENDER_NUMBER) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMSIR_LINE_NUMBER"], message: "برای sms.ir شماره خط لازم است." });
      }
    }

    if (env.SMS_ENABLED && env.SMS_PROVIDER === "melipayamak") {
      if (!env.MELIPAYAMAK_USERNAME || !env.MELIPAYAMAK_PASSWORD || !env.MELIPAYAMAK_FROM) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["MELIPAYAMAK_USERNAME"],
          message: "برای ملی‌پیامک نام کاربری، رمز و شماره فرستنده لازم است.",
        });
      }
    }
  });

const parsedEnv = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,
  DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID,
  ZARINPAL_BASE_URL: process.env.ZARINPAL_BASE_URL,
  ZARINPAL_STARTPAY_URL: process.env.ZARINPAL_STARTPAY_URL,
  ZARINPAL_CALLBACK_URL: process.env.ZARINPAL_CALLBACK_URL,
  ZARINPAL_PROXY_URL: process.env.ZARINPAL_PROXY_URL,
  ZARINPAL_PROXY_SECRET: process.env.ZARINPAL_PROXY_SECRET,
  ZARINPAL_AMOUNT_UNIT: process.env.ZARINPAL_AMOUNT_UNIT,
  SMS_PROVIDER: process.env.SMS_PROVIDER,
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER_NUMBER: process.env.SMS_SENDER_NUMBER,
  SMS_ENABLED: process.env.SMS_ENABLED,
  SMS_SANDBOX_MODE: process.env.SMS_SANDBOX_MODE,
  MELIPAYAMAK_USERNAME: process.env.MELIPAYAMAK_USERNAME,
  MELIPAYAMAK_PASSWORD: process.env.MELIPAYAMAK_PASSWORD,
  MELIPAYAMAK_FROM: process.env.MELIPAYAMAK_FROM,
  MELIPAYAMAK_ENDPOINT: process.env.MELIPAYAMAK_ENDPOINT,
  SMSIR_API_KEY: process.env.SMSIR_API_KEY,
  SMSIR_LINE_NUMBER: process.env.SMSIR_LINE_NUMBER,
  SMSIR_TEMPLATE_ID: process.env.SMSIR_TEMPLATE_ID,
  SMSIR_TEMPLATE_CODE_PARAM: process.env.SMSIR_TEMPLATE_CODE_PARAM,
  SMSIR_TEMPLATE_EXPIRY_PARAM: process.env.SMSIR_TEMPLATE_EXPIRY_PARAM,
  STORAGE_DRIVER: process.env.STORAGE_DRIVER,
  STORAGE_BUCKET: process.env.STORAGE_BUCKET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  CRON_SECRET: process.env.CRON_SECRET,
  HCAPTCHA_SECRET: process.env.HCAPTCHA_SECRET,
  OTP_RATE_LIMIT_WINDOW: process.env.OTP_RATE_LIMIT_WINDOW,
  OTP_RATE_LIMIT_MAX: process.env.OTP_RATE_LIMIT_MAX,
  OTP_RESEND_WINDOW_SECONDS: process.env.OTP_RESEND_WINDOW_SECONDS,
  QUESTION_RATE_LIMIT_WINDOW: process.env.QUESTION_RATE_LIMIT_WINDOW,
  QUESTION_RATE_LIMIT_MAX: process.env.QUESTION_RATE_LIMIT_MAX,
});

export type AppConfig = typeof parsedEnv;

export const config: AppConfig = parsedEnv;

export function isProduction() {
  return config.NODE_ENV === "production";
}
