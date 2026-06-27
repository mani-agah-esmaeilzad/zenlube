import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
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
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }),
      prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          authority,
          gateway: "ZARINPAL",
          status: status ?? "CANCELLED",
          payload: { query: Object.fromEntries(searchParams.entries()) },
        },
      }),
    ]);
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
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }),
      prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          authority,
          gateway: "ZARINPAL",
          status: "FAILED",
          payload: { error: message },
        },
      }),
    ]);
    await sendTemplateSms(
      order.phone,
      "payment_failed",
      { orderNumber: smsOrderNumber(order.id) },
      { eventType: "payment_failed", dedupeKey: `payment_failed:${order.id}:${authority}` },
    );
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=verify&orderId=${order.id}`, request.nextUrl.origin));
  }
}
