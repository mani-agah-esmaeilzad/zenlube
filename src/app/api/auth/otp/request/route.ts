import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizeIranPhone } from "@/lib/phone";
import { createOtpRequest, discardOtpRequest, assertOtpWindowAvailability, OtpRequestWindowError } from "@/services/otp";
import { sendOtpSms } from "@/lib/sms/service";
import { logger } from "@/lib/logger";
import { consumeRateLimit } from "@/lib/rate-limit";
import { config } from "@/lib/config";

export const runtime = "nodejs";

const bodySchema = z.object({
  phone: z.string().min(10, "شماره موبایل را صحیح وارد کنید."),
  purpose: z.enum(["checkout", "account"]).default("checkout"),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const normalizedPhone = normalizeIranPhone(parsed.data.phone);
    if (!/^\+989\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json({ success: false, message: "شماره موبایل معتبر نیست." }, { status: 400 });
    }

    let windowCheckedAt: Date;
    try {
      windowCheckedAt = await assertOtpWindowAvailability(normalizedPhone, parsed.data.purpose);
    } catch (windowError) {
      if (windowError instanceof OtpRequestWindowError) {
        return NextResponse.json({ success: false, message: windowError.message }, { status: 429, headers: { "Retry-After": config.OTP_RESEND_WINDOW_SECONDS.toString() } });
      }
      throw windowError;
    }

    const forwardedFor = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
    const [phoneLimit, ipLimit] = await Promise.all([
      consumeRateLimit(`otp:${normalizedPhone}`, config.OTP_RATE_LIMIT_WINDOW, config.OTP_RATE_LIMIT_MAX),
      consumeRateLimit(`otp-ip:${clientIp}`, config.OTP_RATE_LIMIT_WINDOW, config.OTP_RATE_LIMIT_MAX * 2),
    ]);

    if (!phoneLimit.success || !ipLimit.success) {
      const resetAt = phoneLimit.resetAt > ipLimit.resetAt ? phoneLimit.resetAt : ipLimit.resetAt;
      return NextResponse.json(
        { success: false, message: "تعداد درخواست‌های مجاز شما برای دریافت کد تایید به حد مجاز رسیده است. لطفا چند دقیقه بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000)).toString() } },
      );
    }

    const otp = await createOtpRequest(normalizedPhone, parsed.data.purpose, {
      skipWindowCheck: true,
      currentTime: windowCheckedAt,
      normalizedPhoneOverride: normalizedPhone,
    });

    const smsResult = await sendOtpSms(normalizedPhone, otp.code, otp.expiresAt);
    if (!smsResult.success) {
      await discardOtpRequest(otp.id);
      const message =
        "پیامک ارسال نشد. لطفا تنظیمات SMS_ENABLED، SMS_PROVIDER، SMS_SANDBOX_MODE و کلید سرویس پیامک را در Vercel بررسی کنید.";
      logger.error("OTP SMS not delivered", { phone: normalizedPhone, reason: smsResult.error });
      return NextResponse.json({ success: false, message }, { status: 503 });
    }

    return NextResponse.json({ success: true, expiresAt: otp.expiresAt.toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ارسال کد با خطا مواجه شد.";
    logger.error("OTP request failed", { message });
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
