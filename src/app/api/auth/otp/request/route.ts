import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizeIranPhone } from "@/lib/phone";
import { createOtpRequest } from "@/services/otp";
import { sendMelipayamakOtp } from "@/lib/sms/melipayamak";

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

    const { code, expiresAt } = await createOtpRequest(normalizedPhone, parsed.data.purpose);
    await sendMelipayamakOtp({ phone: normalizedPhone, code, expiresAt });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ارسال کد با خطا مواجه شد.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
