"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ensureAdminAction } from "@/lib/auth";
import prisma from "@/lib/prisma";

const statusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

const trackingSchema = z.object({
  orderId: z.string().cuid(),
  shippingTrackingCode: z
    .string()
    .trim()
    .min(3, "کد پیگیری حداقل ۳ کاراکتر است.")
    .max(60, "کد پیگیری حداکثر ۶۰ کاراکتر است."),
});

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const raw = Object.fromEntries(formData);
  const parsed = statusSchema.safeParse(raw);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(flattened)
        .flat()
        .find((message) => Boolean(message)) ?? "به‌روزرسانی وضعیت سفارش نامعتبر است.";
    throw new Error(firstError);
  }

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin");
}

export async function updateOrderTrackingAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const raw = Object.fromEntries(formData);
  const parsed = trackingSchema.safeParse(raw);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(flattened)
        .flat()
        .find((message) => Boolean(message)) ?? "کد پیگیری نامعتبر است.";
    throw new Error(firstError);
  }

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { shippingTrackingCode: parsed.data.shippingTrackingCode },
  });

  revalidatePath("/admin");
}
