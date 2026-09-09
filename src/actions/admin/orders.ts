"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma, type OrderStatus } from "@/generated/prisma";
import { ensureAdminAction } from "@/lib/auth";
import { appendOrderStatusEvent } from "@/lib/commerce";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { notifyMerchantOfNewOrder } from "@/lib/sms/merchant-order";
import {
  notifyCustomerOfOrderStatusChange,
  notifyCustomerOfTrackingCode,
} from "@/lib/sms/order-notifications";
import { smsOrderNumber } from "@/lib/sms/service";
import { deleteOrderSafely } from "@/services/admin/mutations";

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

export async function retryMerchantOrderSmsAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const orderId = z.string().cuid().parse(formData.get("orderId"));
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
  if (!order) throw new Error("سفارش پیدا نشد.");
  await notifyMerchantOfNewOrder(order.id);
  revalidatePath("/admin");
}

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

  const result = await prisma.$transaction(async (tx) => {
    const [currentOrder] = await tx.$queryRaw<Array<{
      id: string;
      status: OrderStatus;
      phone: string;
      shippingTrackingCode: string | null;
    }>>(Prisma.sql`
      SELECT "id", "status"::text AS "status", "phone", "shippingTrackingCode"
      FROM "Order"
      WHERE "id" = ${parsed.data.orderId}
      FOR UPDATE
    `);

    if (!currentOrder) throw new Error("سفارش پیدا نشد.");
    if (currentOrder.status === parsed.data.status) {
      return { changed: false as const, order: currentOrder, previousStatus: currentOrder.status };
    }

    const updatedOrder = await tx.order.update({
      where: { id: parsed.data.orderId },
      data: {
        status: parsed.data.status,
        deliveredAt: parsed.data.status === "DELIVERED" ? new Date() : undefined,
      },
    });

    if (parsed.data.status === "SHIPPED") {
      await tx.shipment.updateMany({
        where: { orderId: updatedOrder.id, status: { in: ["SUBMITTED", "PICKED_UP"] } },
        data: { status: "IN_TRANSIT", pickedUpAt: new Date() },
      });
    } else if (parsed.data.status === "DELIVERED") {
      await tx.shipment.updateMany({
        where: { orderId: updatedOrder.id, status: { not: "CANCELLED" } },
        data: { status: "DELIVERED", deliveredAt: new Date() },
      });
    }

    await appendOrderStatusEvent(tx, {
      orderId: updatedOrder.id,
      status: parsed.data.status,
      title: `وضعیت سفارش به ${parsed.data.status} تغییر کرد`,
      detail: "این تغییر توسط مدیر فروشگاه ثبت شد.",
    });

    return { changed: true as const, order: updatedOrder, previousStatus: currentOrder.status };
  });

  await notifyCustomerOfOrderStatusChange(result.order.phone, {
    orderId: result.order.id,
    orderNumber: smsOrderNumber(result.order.id),
    previousStatus: result.previousStatus,
    nextStatus: parsed.data.status,
    trackingCode: result.order.shippingTrackingCode,
    retryUndelivered: true,
  }).catch((error) => {
    logger.warn("Order status SMS could not be sent", {
      orderId: result.order.id,
      status: parsed.data.status,
      error: error instanceof Error ? error.message : "unknown",
    });
  });

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

  const result = await prisma.$transaction(async (tx) => {
    const [currentOrder] = await tx.$queryRaw<Array<{
      id: string;
      phone: string;
      shippingTrackingCode: string | null;
    }>>(Prisma.sql`
      SELECT "id", "phone", "shippingTrackingCode"
      FROM "Order"
      WHERE "id" = ${parsed.data.orderId}
      FOR UPDATE
    `);

    if (!currentOrder) throw new Error("سفارش پیدا نشد.");

    const trackingChanged = currentOrder.shippingTrackingCode !== parsed.data.shippingTrackingCode;
    if (!trackingChanged) {
      await tx.shipment.updateMany({
        where: {
          orderId: currentOrder.id,
          OR: [
            { trackingCode: null },
            { trackingCode: { not: parsed.data.shippingTrackingCode } },
          ],
        },
        data: { trackingCode: parsed.data.shippingTrackingCode },
      });
      return { changed: false as const, order: currentOrder, previousTrackingCode: currentOrder.shippingTrackingCode };
    }

    const updatedOrder = await tx.order.update({
      where: { id: parsed.data.orderId },
      data: { shippingTrackingCode: parsed.data.shippingTrackingCode },
    });
    await tx.shipment.updateMany({
      where: { orderId: updatedOrder.id },
      data: { trackingCode: parsed.data.shippingTrackingCode },
    });

    await appendOrderStatusEvent(tx, {
      orderId: updatedOrder.id,
      status: "TRACKING_UPDATED",
      title: "کد پیگیری ثبت شد",
      detail: `کد پیگیری ${parsed.data.shippingTrackingCode} برای سفارش ثبت شد.`,
    });

    return { changed: true as const, order: updatedOrder, previousTrackingCode: currentOrder.shippingTrackingCode };
  });

  await notifyCustomerOfTrackingCode(result.order.phone, {
    orderId: result.order.id,
    orderNumber: smsOrderNumber(result.order.id),
    previousTrackingCode: result.previousTrackingCode,
    nextTrackingCode: parsed.data.shippingTrackingCode,
    retryUndelivered: true,
  }).catch((error) => {
    logger.warn("Order tracking SMS could not be sent", {
      orderId: result.order.id,
      error: error instanceof Error ? error.message : "unknown",
    });
  });

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
