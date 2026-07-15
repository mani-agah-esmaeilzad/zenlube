import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { appendOrderStatusEvent } from "@/lib/commerce";
import { verifyZarinpalPayment } from "@/lib/payments/zarinpal";
import { sendTemplateSms, smsOrderNumber } from "@/lib/sms/service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");
  const orderId = searchParams.get("orderId");

  logger.info("Payment callback received", { gateway: "ZARINPAL", authority, status, orderId });

  if (!authority || !orderId) {
    return NextResponse.redirect(new URL("/cart/checkout/failure?reason=missing", request.nextUrl.origin));
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.paymentAuthority !== authority) {
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=not-found&orderId=${orderId}`, request.nextUrl.origin));
  }

  if (order.status === "PAID") {
    logger.info("Duplicate payment callback ignored", { orderId, authority });
    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
  }

  if (status !== "OK") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      await tx.paymentEvent.create({
        data: {
          orderId: order.id,
          authority,
          gateway: "ZARINPAL",
          status: status ?? "CANCELLED",
          payload: { query: Object.fromEntries(searchParams.entries()) },
        },
      });
      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "CANCELLED",
        title: "پرداخت تکمیل نشد",
        detail: "فرآیند پرداخت توسط کاربر یا درگاه نهایی نشد.",
      });
    });
    await sendTemplateSms(
      order.phone,
      "payment_failed",
      { orderNumber: smsOrderNumber(order.id) },
      { eventType: "payment_failed", dedupeKey: `payment_failed:${order.id}:${authority}` },
    );
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=cancelled&orderId=${order.id}`, request.nextUrl.origin));
  }

  try {
    const verification = await verifyZarinpalPayment(authority, order.total);
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentRefId: verification.refId,
          paidAt: new Date(),
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: order.userId,
          },
        },
      });

      await Promise.all(
        order.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      await tx.paymentEvent.create({
        data: {
          orderId: order.id,
          authority,
          gateway: "ZARINPAL",
          status: "PAID",
          payload: verification,
        },
      });

      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "PAID",
        title: "پرداخت موفق",
        detail: verification.refId ? `پرداخت با کد ${verification.refId} تایید شد.` : "پرداخت با موفقیت تایید شد.",
      });
    });

    await sendTemplateSms(
      order.phone,
      "payment_success",
      { orderNumber: smsOrderNumber(order.id) },
      { eventType: "payment_success", dedupeKey: `payment_success:${order.id}:${authority}` },
    );

    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    logger.error("Zarinpal verification failed", { error: message, orderId: order.id, authority });
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      await tx.paymentEvent.create({
        data: {
          orderId: order.id,
          authority,
          gateway: "ZARINPAL",
          status: "FAILED",
          payload: { error: message },
        },
      });
      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "FAILED",
        title: "تایید پرداخت ناموفق بود",
        detail: "در تایید نهایی پرداخت از سمت درگاه خطا رخ داد.",
      });
    });
    await sendTemplateSms(
      order.phone,
      "payment_failed",
      { orderNumber: smsOrderNumber(order.id) },
      { eventType: "payment_failed", dedupeKey: `payment_failed:${order.id}:${authority}` },
    );
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=verify&orderId=${order.id}`, request.nextUrl.origin));
  }
}
