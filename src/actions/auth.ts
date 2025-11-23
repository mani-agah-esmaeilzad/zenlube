"use server";

import prisma from "@/lib/prisma";
import { registerUserSchema } from "@/lib/validators";
import { normalizeIranPhone } from "@/lib/phone";
import { verifyOtpCode } from "@/services/otp";

type RegisterState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerUserAction(
  _prevState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const raw = Object.fromEntries(formData);

  const parsed = registerUserSchema.safeParse({
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    otpCode: raw.otpCode,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "لطفاً خطاهای زیر را برطرف کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, otpCode } = parsed.data;
  const normalizedPhone = normalizeIranPhone(phone);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return {
      success: false,
      message: "این ایمیل قبلاً ثبت شده است.",
      fieldErrors: { email: ["این ایمیل قبلاً ثبت شده است."] },
    };
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone: normalizedPhone } });

  if (existingPhone) {
    return {
      success: false,
      message: "این شماره موبایل قبلاً ثبت شده است.",
      fieldErrors: { phone: ["این شماره موبایل قبلاً ثبت شده است."] },
    };
  }

  try {
    await verifyOtpCode(phone, otpCode, "account");
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "کد تایید معتبر نیست.",
      fieldErrors: { otpCode: [error instanceof Error ? error.message : "کد تایید معتبر نیست."] },
    };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone: normalizedPhone,
    },
  });

  return {
    success: true,
    message: "ثبت‌نام با موفقیت انجام شد.",
    fieldErrors: {},
  };
}
