"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getAppSession } from "@/lib/session";
import { getIranPhoneLookupVariants, normalizeIranPhone, validateIranPhone } from "@/lib/phone";
import { createAuditLog } from "@/lib/admin-audit";
import { isStorefrontVisibleProduct } from "@/lib/storefront-visibility";
import { returnRequestSchema } from "@/lib/validators";
import { createReturnRequest } from "@/services/admin/mutations";

const profileSchema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل دو کاراکتر باشد."),
  email: z.string().email("ایمیل معتبر نیست."),
  phone: z.string().refine((value) => validateIranPhone(value), "شماره موبایل معتبر نیست."),
});

const addressSchema = z.object({
  label: z.string().trim().min(2, "عنوان آدرس را وارد کنید.").max(40, "عنوان آدرس بیش از حد طولانی است.").optional(),
  fullName: z.string().trim().min(3, "نام گیرنده باید حداقل سه کاراکتر باشد."),
  phone: z.string().refine((value) => validateIranPhone(value), "شماره موبایل معتبر نیست."),
  address1: z.string().trim().min(5, "آدرس باید حداقل پنج کاراکتر باشد."),
  address2: z.string().trim().optional(),
  city: z.string().trim().min(2, "شهر را وارد کنید."),
  province: z.string().trim().min(2, "استان را وارد کنید."),
  postalCode: z.string().trim().min(5, "کد پستی معتبر نیست.").max(20, "کد پستی معتبر نیست."),
});

const addressBookSchema = addressSchema.extend({
  setAsDefault: z.boolean().optional(),
});

type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

async function requireUserId() {
  const session = await getAppSession();
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!userId) throw new Error("ابتدا وارد حساب کاربری خود شوید.");
  return userId;
}

export async function updateProfileAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const parsed = profileSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { success: false, message: "اطلاعات را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
    }

    const { name, email, phone } = parsed.data;
    const normalizedPhone = normalizeIranPhone(phone);

    const [emailOwner, phoneOwner] = await Promise.all([
      prisma.user.findFirst({ where: { email, id: { not: userId } }, select: { id: true } }),
      prisma.user.findFirst({
        where: { phone: { in: getIranPhoneLookupVariants(normalizedPhone) }, id: { not: userId } },
        select: { id: true },
      }),
    ]);

    if (emailOwner) {
      return { success: false, message: "این ایمیل قبلا ثبت شده است.", errors: { email: ["این ایمیل قبلا ثبت شده است."] } };
    }
    if (phoneOwner) {
      return { success: false, message: "این شماره موبایل قبلا ثبت شده است.", errors: { phone: ["این شماره موبایل قبلا ثبت شده است."] } };
    }

    await prisma.user.update({ where: { id: userId }, data: { name, email, phone: normalizedPhone } });

    revalidatePath("/account");
    return { success: true, message: "پروفایل با موفقیت به‌روزرسانی شد." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "به‌روزرسانی پروفایل با خطا مواجه شد." };
  }
}

export async function updateDefaultAddressAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const parsed = addressSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { success: false, message: "اطلاعات آدرس را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
    }

    const input = parsed.data;
    const normalizedPhone = normalizeIranPhone(input.phone);

    await prisma.$transaction(async (tx) => {
      const existingDefault = await tx.userAddress.findFirst({
        where: { userId, isDefault: true },
        select: { id: true, label: true },
      });

      if (existingDefault) {
        await tx.userAddress.update({
          where: { id: existingDefault.id },
          data: {
            fullName: input.fullName,
            phone: normalizedPhone,
            address1: input.address1,
            address2: input.address2,
            city: input.city,
            province: input.province,
            postalCode: input.postalCode,
          },
        });
        return;
      }

      await tx.userAddress.create({
        data: {
          userId,
          label: input.label?.trim() || "آدرس اصلی",
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
    });

    revalidatePath("/account");
    revalidatePath("/cart/checkout");
    return { success: true, message: "آدرس پیش‌فرض ذخیره شد." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "ذخیره آدرس با خطا مواجه شد." };
  }
}

export async function createAddressAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const parsed = addressBookSchema.safeParse({
      ...Object.fromEntries(formData),
      setAsDefault: formData.get("setAsDefault") === "on",
    });

    if (!parsed.success) {
      return { success: false, message: "اطلاعات آدرس را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
    }

    const input = parsed.data;
    const normalizedPhone = normalizeIranPhone(input.phone);

    await prisma.$transaction(async (tx) => {
      if (input.setAsDefault) {
        await tx.userAddress.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      await tx.userAddress.create({
        data: {
          userId,
          label: input.label?.trim() || "آدرس جدید",
          fullName: input.fullName,
          phone: normalizedPhone,
          address1: input.address1,
          address2: input.address2,
          city: input.city,
          province: input.province,
          postalCode: input.postalCode,
          isDefault: Boolean(input.setAsDefault),
        },
      });
    });

    revalidatePath("/account");
    revalidatePath("/cart/checkout");
    return { success: true, message: "آدرس جدید ذخیره شد." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "ذخیره آدرس با خطا مواجه شد." };
  }
}

export async function setDefaultAddressAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const addressId = formData.get("addressId");
  if (!addressId || typeof addressId !== "string") {
    throw new Error("شناسه آدرس نامعتبر است.");
  }

  await prisma.$transaction(async (tx) => {
    const address = await tx.userAddress.findFirst({
      where: { id: addressId, userId },
      select: { id: true },
    });

    if (!address) {
      throw new Error("آدرس پیدا نشد.");
    }

    await tx.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    await tx.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });

  revalidatePath("/account");
  revalidatePath("/cart/checkout");
}

export async function deleteAddressAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const addressId = formData.get("addressId");
  if (!addressId || typeof addressId !== "string") {
    throw new Error("شناسه آدرس نامعتبر است.");
  }

  await prisma.$transaction(async (tx) => {
    const address = await tx.userAddress.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    });

    if (!address) {
      throw new Error("آدرس پیدا نشد.");
    }

    await tx.userAddress.delete({ where: { id: address.id } });

    if (address.isDefault) {
      const replacement = await tx.userAddress.findFirst({
        where: { userId },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: { id: true },
      });

      if (replacement) {
        await tx.userAddress.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        });
      }
    }
  });

  revalidatePath("/account");
  revalidatePath("/cart/checkout");
}

export async function reorderOrderAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const orderId = formData.get("orderId");

  if (!orderId || typeof orderId !== "string") {
    throw new Error("شناسه سفارش نامعتبر است.");
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, stock: true, slug: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error("سفارش پیدا نشد.");
    }

    const cart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    for (const item of order.items) {
      if (!isStorefrontVisibleProduct(item.product) || item.product.stock <= 0) {
        continue;
      }

      const quantity = Math.min(item.quantity, item.product.stock);
      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId,
          },
        },
        select: { quantity: true },
      });

      const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, item.product.stock);

      await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId,
          },
        },
        update: { quantity: nextQuantity },
        create: {
          cartId: cart.id,
          productId: item.productId,
          quantity,
        },
      });
    }
  });

  revalidatePath("/cart");
  redirect("/cart");
}

export async function createReturnRequestAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const parsed = returnRequestSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { success: false, message: "اطلاعات درخواست را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parsed.data.orderId,
        userId,
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      },
      select: { id: true },
    });

    if (!order) {
      return { success: false, message: "این سفارش برای ثبت مرجوعی معتبر نیست." };
    }

    const existing = await prisma.returnRequest.findFirst({
      where: {
        orderId: order.id,
        userId,
        status: { in: ["REQUESTED", "APPROVED", "RECEIVED"] },
      },
      select: { id: true },
    });

    if (existing) {
      return { success: false, message: "برای این سفارش قبلاً درخواست مرجوعی فعال ثبت شده است." };
    }

    const request = await createReturnRequest({
      orderId: order.id,
      userId,
      reason: parsed.data.reason,
      details: parsed.data.details,
    });

    await createAuditLog({
      actorUserId: userId,
      targetType: "return_request",
      targetId: request.id,
      action: "create",
      summary: `درخواست مرجوعی برای سفارش ${order.id} ثبت شد.`,
      metadata: { orderId: order.id, reason: parsed.data.reason },
    });

    revalidatePath("/account");
    revalidatePath("/admin");
    return { success: true, message: "درخواست مرجوعی ثبت شد و توسط تیم پشتیبانی بررسی می‌شود." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "ثبت درخواست مرجوعی با خطا مواجه شد." };
  }
}
