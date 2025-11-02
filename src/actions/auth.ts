"use server";

import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { registerUserSchema } from "@/lib/validators";

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
    password: raw.password,
    confirmPassword: raw.confirmPassword,
    phone: raw.phone,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "لطفاً خطاهای زیر را برطرف کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return {
      success: false,
      message: "این ایمیل قبلاً ثبت شده است.",
      fieldErrors: { email: ["این ایمیل قبلاً ثبت شده است."] },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone ?? undefined,
    },
  });

  return {
    success: true,
    message: "ثبت‌نام با موفقیت انجام شد.",
    fieldErrors: {},
  };
}
