import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verifyZarinpalPayment } from "@/lib/payments/zarinpal";

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

  if (status !== "OK") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=cancelled&orderId=${order.id}`, request.nextUrl.origin));
  }

  try {
    const verification = await verifyZarinpalPayment(authority, order.total);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentRefId: verification.refId,
        paidAt: new Date(),
      },
    });
    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
  } catch (error) {
    console.error("Zarinpal verification failed", error);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=verify&orderId=${order.id}`, request.nextUrl.origin));
  }
}
