import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizeIranPhone } from "@/lib/phone";
import { createOtpRequest, assertOtpWindowAvailability, OtpRequestWindowError } from "@/services/otp";
import { sendSmsIrOtp } from "@/lib/sms/smsir";
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
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizeIranPhone(parsed.data.phone);
    if (!/^\+989\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل معتبر نیست." },
        { status: 400 },
      );
    }

    let windowCheckedAt: Date;
    try {
      windowCheckedAt = await assertOtpWindowAvailability(normalizedPhone, parsed.data.purpose);
    } catch (windowError) {
      if (windowError instanceof OtpRequestWindowError) {
        return NextResponse.json(
          { success: false, message: windowError.message },
          { status: 429 },
        );
      }
      throw windowError;
    }

    const forwardedFor = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
    const phoneKey = `otp:${normalizedPhone}`;
    const ipKey = `otp-ip:${clientIp}`;
    const [phoneLimit, ipLimit] = await Promise.all([
      consumeRateLimit(phoneKey, config.OTP_RATE_LIMIT_WINDOW, config.OTP_RATE_LIMIT_MAX),
      consumeRateLimit(ipKey, config.OTP_RATE_LIMIT_WINDOW, config.OTP_RATE_LIMIT_MAX * 2),
    ]);

    if (!phoneLimit.success || !ipLimit.success) {
      const resetAt = phoneLimit.resetAt > ipLimit.resetAt ? phoneLimit.resetAt : ipLimit.resetAt;
      return NextResponse.json(
        { success: false, message: "تعداد درخواست‌های مجاز شما برای دریافت کد تایید به حد مجاز رسیده است. لطفاً چند دقیقه بعد دوباره تلاش کنید." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000)).toString(),
          },
        },
      );
    }

    let code: string;
    let expiresAt: Date;
    try {
      const otp = await createOtpRequest(normalizedPhone, parsed.data.purpose, {
        skipWindowCheck: true,
        currentTime: windowCheckedAt,
        normalizedPhoneOverride: normalizedPhone,
      });
      code = otp.code;
      expiresAt = otp.expiresAt;
    } catch (otpError) {
      const message = otpError instanceof Error ? otpError.message : "ارسال کد در حال حاضر امکان‌پذیر نیست.";
      logger.error("OTP creation failed", { phone: normalizedPhone, message });
      return NextResponse.json(
        { success: false, message: "امکان صدور کد تایید وجود ندارد. لطفاً دوباره تلاش کنید." },
        { status: 500 },
      );
    }

    try {
      await sendSmsIrOtp({ phone: normalizedPhone, code, expiresAt });
    } catch (error) {
      const message = error instanceof Error ? error.message : "ارسال پیامک با خطا مواجه شد.";
      logger.error("OTP SMS delivery failed", { phone: normalizedPhone, message });
      return NextResponse.json(
        { success: false, message: "ارسال پیامک تایید از طریق سرویس‌دهنده با خطا مواجه شد. لطفاً چند دقیقه دیگر تلاش کنید." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ارسال کد با خطا مواجه شد.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
