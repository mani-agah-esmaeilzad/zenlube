"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ensureAdminAction } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendTemplateSms, smsOrderNumber } from "@/lib/sms/service";
import { deleteOrderSafely } from "@/services/admin/mutations";

const statusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
  sendSms: z.coerce.boolean().optional(),
});

const trackingSchema = z.object({
  orderId: z.string().cuid(),
  sendSms: z.coerce.boolean().optional(),
  shippingTrackingCode: z
    .string()
    .trim()
    .min(3, "کد پیگیری حداقل ۳ کاراکتر است.")
    .max(60, "کد پیگیری حداکثر ۶۰ کاراکتر است."),
});

const smsTemplateByStatus: Record<string, string | null> = {
  PENDING: null,
  PAID: "status_processing",
  SHIPPED: "status_shipped",
  DELIVERED: "status_delivered",
  CANCELLED: "status_cancelled",
};

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .find(Boolean) ?? "به‌روزرسانی وضعیت سفارش نامعتبر است.";
    throw new Error(firstError);
  }

  const order = await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  });

  if (parsed.data.sendSms) {
    const templateName = smsTemplateByStatus[parsed.data.status];
    if (templateName) {
      await sendTemplateSms(
        order.phone,
        templateName,
        {
          orderNumber: smsOrderNumber(order.id),
          trackingCode: order.shippingTrackingCode ?? "ثبت نشده",
        },
        { eventType: "order_status_changed", dedupeKey: `order_status:${order.id}:${parsed.data.status}:${order.updatedAt.getTime()}` },
      );
    }
  }

  revalidatePath("/admin");
  revalidatePath("/account");
}

export async function updateOrderTrackingAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const parsed = trackingSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .find(Boolean) ?? "کد پیگیری نامعتبر است.";
    throw new Error(firstError);
  }

  const order = await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { shippingTrackingCode: parsed.data.shippingTrackingCode },
  });

  if (parsed.data.sendSms) {
    await sendTemplateSms(
      order.phone,
      "status_shipped",
      { orderNumber: smsOrderNumber(order.id), trackingCode: parsed.data.shippingTrackingCode },
      { eventType: "tracking_code_added", dedupeKey: `tracking:${order.id}:${parsed.data.shippingTrackingCode}` },
    );
  }

  revalidatePath("/admin");
  revalidatePath("/account");
}

export async function deleteOrderFormAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const orderId = formData.get("orderId");
  if (!orderId || typeof orderId !== "string") {
    throw new Error("شناسه سفارش نامعتبر است.");
  }

  await deleteOrderSafely(orderId);
  revalidatePath("/admin");
  revalidatePath("/account");
}
