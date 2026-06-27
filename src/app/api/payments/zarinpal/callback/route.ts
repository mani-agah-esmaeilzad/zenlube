import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verifyZarinpalPayment } from "@/lib/payments/zarinpal";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");
  const orderId = searchParams.get("orderId");

  if (!authority || !orderId) {
    return NextResponse.redirect(new URL("/cart/checkout/failure?reason=missing", request.nextUrl.origin));
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order || order.paymentAuthority !== authority) {
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=not-found&orderId=${orderId}`, request.nextUrl.origin));
  }

  if (order.status === "PAID") {
    logger.info("Duplicate payment callback ignored", { orderId, authority });
    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
  }

  if (status !== "OK") {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      }),
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
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=cancelled&orderId=${order.id}`, request.nextUrl.origin));
  }

  try {
    const verification = await verifyZarinpalPayment(authority, order.total);
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentRefId: verification.refId,
          paidAt: new Date(),
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          authority,
          gateway: "ZARINPAL",
          status: "PAID",
          payload: verification,
        },
      }),
    ]);
    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
  } catch (error) {
    logger.error("Zarinpal verification failed", {
      error: error instanceof Error ? error.message : error,
      orderId: order.id,
      authority,
    });
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          authority,
          gateway: "ZARINPAL",
          status: "FAILED",
          payload: { error: error instanceof Error ? error.message : "unknown" },
        },
      }),
    ]);
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=verify&orderId=${order.id}`, request.nextUrl.origin));
  }
}
