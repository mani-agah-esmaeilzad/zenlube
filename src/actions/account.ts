"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getAppSession } from "@/lib/session";
import { normalizeIranPhone, validateIranPhone } from "@/lib/phone";

const profileSchema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل دو کاراکتر باشد."),
  email: z.string().email("ایمیل معتبر نیست."),
  phone: z.string().refine((value) => validateIranPhone(value), "شماره موبایل معتبر نیست."),
});

const addressSchema = z.object({
  fullName: z.string().trim().min(3, "نام گیرنده باید حداقل سه کاراکتر باشد."),
  phone: z.string().refine((value) => validateIranPhone(value), "شماره موبایل معتبر نیست."),
  address1: z.string().trim().min(5, "آدرس باید حداقل پنج کاراکتر باشد."),
  address2: z.string().trim().optional(),
  city: z.string().trim().min(2, "شهر را وارد کنید."),
  province: z.string().trim().min(2, "استان را وارد کنید."),
  postalCode: z.string().trim().min(5, "کد پستی معتبر نیست.").max(20, "کد پستی معتبر نیست."),
});

type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

async function requireUserId() {
  const session = await getAppSession();
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!userId) {
    throw new Error("ابتدا وارد حساب کاربری خود شوید.");
  }
  return userId;
}

export async function updateProfileAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const raw = Object.fromEntries(formData);
    const parsed = profileSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, message: "اطلاعات را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
    }

    const { name, email, phone } = parsed.data;
    const normalizedPhone = normalizeIranPhone(phone);

    const existing = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        message: "این ایمیل قبلاً ثبت شده است.",
        errors: { email: ["این ایمیل قبلاً ثبت شده است."] },
      };
    }

    const phoneOwner = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
        id: { not: userId },
      },
      select: { id: true },
    });

    if (phoneOwner) {
      return {
        success: false,
        message: "این شماره موبایل قبلاً ثبت شده است.",
        errors: { phone: ["این شماره موبایل قبلاً ثبت شده است."] },
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone: normalizedPhone,
      },
    });

    revalidatePath("/account");
    return { success: true, message: "پروفایل با موفقیت بروزرسانی شد." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "بروزرسانی پروفایل با خطا مواجه شد." };
  }
}

export async function updateDefaultAddressAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const raw = Object.fromEntries(formData);
    const parsed = addressSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, message: "اطلاعات آدرس را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
    }

    const input = parsed.data;
    const normalizedPhone = normalizeIranPhone(input.phone);

    await prisma.userAddress.upsert({
      where: {
        userId_isDefault: {
          userId,
          isDefault: true,
        },
      },
      update: {
        fullName: input.fullName,
        phone: normalizedPhone,
        address1: input.address1,
        address2: input.address2,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
      },
      create: {
        userId,
        fullName: input.fullName,
        phone: normalizedPhone,
        address1: input.address1,
        address2: input.address2,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        isDefault: true,
      },
    });

    revalidatePath("/account");
    return { success: true, message: "آدرس پیش‌فرض ذخیره شد." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "ذخیره آدرس با خطا مواجه شد." };
  }
}
