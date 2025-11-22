import { z } from "zod";

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z
      .string()
      .refine((value) => /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value), {
        message: "DATABASE_URL باید مقدار معتبر باشد.",
      }),
    DATABASE_DIRECT_URL: z
      .string()
      .refine((value) => /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value), {
        message: "DATABASE_DIRECT_URL باید مقدار معتبر باشد.",
      })
      .optional(),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().max(1000).optional(),
    NEXTAUTH_SECRET: z.string({ error: "NEXTAUTH_SECRET الزامی است." }),
    NEXTAUTH_URL: z
      .string()
      .url({ message: "NEXTAUTH_URL باید مقدار معتبر باشد." })
      .optional(),
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url({ message: "NEXT_PUBLIC_APP_URL باید مقدار معتبر باشد." }),
    ZARINPAL_MERCHANT_ID: z.string({ error: "شناسه پذیرنده زرین‌پال الزامی است." }),
    ZARINPAL_BASE_URL: z
      .string()
      .url({ message: "ZARINPAL_BASE_URL باید آدرس معتبر باشد." })
      .default("https://api.zarinpal.com/pg/v4"),
    ZARINPAL_STARTPAY_URL: z
      .string()
      .url({ message: "ZARINPAL_STARTPAY_URL باید آدرس معتبر باشد." })
      .default("https://www.zarinpal.com/pg/StartPay"),
    ZARINPAL_CALLBACK_URL: z
      .string()
      .url({ message: "ZARINPAL_CALLBACK_URL باید آدرس معتبر باشد." })
      .optional(),
    SMSIR_API_KEY: z.string({ error: "کلید دسترسی سرویس پیامک sms.ir الزامی است." }),
    SMSIR_LINE_NUMBER: z
      .coerce.number({
        invalid_type_error: "شماره خط ارسال sms.ir باید عدد معتبر باشد.",
      })
      .int()
      .positive({ message: "شماره خط ارسال sms.ir باید عدد مثبت باشد." }),
    SMSIR_TEMPLATE_ID: z
      .coerce.number({
        invalid_type_error: "شناسه قالب تایید sms.ir باید عدد معتبر باشد.",
      })
      .int()
      .positive({ message: "شناسه قالب تایید sms.ir باید عدد مثبت باشد." }),
    SMSIR_TEMPLATE_CODE_PARAM: z.string().default("code"),
    SMSIR_TEMPLATE_EXPIRY_PARAM: z.string().optional(),
    STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
    STORAGE_BUCKET: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    HCAPTCHA_SECRET: z.string().optional(),
    OTP_RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(300),
    OTP_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
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
          message: "برای ذخیره‌سازی S3 باید کلید‌های AWS تنظیم شوند.",
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
  QUESTION_RATE_LIMIT_WINDOW: process.env.QUESTION_RATE_LIMIT_WINDOW,
  QUESTION_RATE_LIMIT_MAX: process.env.QUESTION_RATE_LIMIT_MAX,
});

export type AppConfig = typeof parsedEnv;

export const config: AppConfig = parsedEnv;

export function isProduction() {
  return config.NODE_ENV === "production";
}
