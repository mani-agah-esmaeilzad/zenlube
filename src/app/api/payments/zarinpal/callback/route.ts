import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import prisma from "@/lib/prisma";
import { appendOrderStatusEvent } from "@/lib/commerce";
import {
  verifyZarinpalPayment,
  ZarinpalTransportError,
  type PaymentVerifyResult,
} from "@/lib/payments/zarinpal";
import { sendTemplateSms, smsOrderNumber } from "@/lib/sms/service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const RECONCILIATION_STATUS = "reconciliation_required";
const VERIFICATION_PENDING_STATUS = "verification_pending";
const PROTECTED_PAYMENT_STATUSES = ["paid", "verified", RECONCILIATION_STATUS, VERIFICATION_PENDING_STATUS] as const;
const PAID_ORDER_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

function isPaidOrderStatus(status?: string | null) {
  return PAID_ORDER_STATUSES.some((paidStatus) => paidStatus === status);
}

type OrderPaymentItem = {
  productId: string;
  quantity: number;
};

function aggregateOrderItems(items: OrderPaymentItem[]) {
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  return [...quantities.entries()]
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((left, right) => left.productId.localeCompare(right.productId));
}

async function lockAndConsumeInventory(tx: Prisma.TransactionClient, items: OrderPaymentItem[]) {
  const aggregated = aggregateOrderItems(items);
  if (!aggregated.length) throw new Error("سفارش هیچ قلم کالایی ندارد.");

  const productIds = aggregated.map((item) => item.productId);
  const lockedProducts = await tx.$queryRaw<Array<{ id: string; stock: number }>>(
    Prisma.sql`SELECT "id", "stock" FROM "Product" WHERE "id" IN (${Prisma.join(productIds)}) ORDER BY "id" FOR UPDATE`,
  );
  const stocks = new Map(lockedProducts.map((product) => [product.id, product.stock]));
  for (const item of aggregated) {
    const stock = stocks.get(item.productId);
    if (stock == null || stock < item.quantity) {
      throw new Error(`موجودی محصول ${item.productId} برای نهایی‌سازی پرداخت کافی نیست.`);
    }
  }

  for (const item of aggregated) {
    const updated = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count !== 1) throw new Error(`موجودی محصول ${item.productId} همزمان تغییر کرد.`);
  }
}

async function consumeCouponUsage(tx: Prisma.TransactionClient, couponId: string | null) {
  if (!couponId) return;
  const coupons = await tx.$queryRaw<Array<{
    id: string;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    usageLimit: number | null;
    usedCount: number;
  }>>(
    Prisma.sql`SELECT "id", "isActive", "startsAt", "endsAt", "usageLimit", "usedCount" FROM "Coupon" WHERE "id" = ${couponId} FOR UPDATE`,
  );
  const coupon = coupons[0];
  const now = new Date();
  if (
    !coupon
    || !coupon.isActive
    || (coupon.startsAt && coupon.startsAt > now)
    || (coupon.endsAt && coupon.endsAt < now)
    || (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
  ) {
    throw new Error("ظرفیت کد تخفیف در زمان نهایی‌سازی پرداخت تکمیل شده است.");
  }
  await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
}

async function consumeOnlyOrderedCartQuantities(
  tx: Prisma.TransactionClient,
  userId: string,
  items: OrderPaymentItem[],
) {
  const carts = await tx.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT "id" FROM "Cart" WHERE "userId" = ${userId} FOR UPDATE`,
  );
  const cart = carts[0];
  if (!cart) return;

  let changed = false;
  for (const item of aggregateOrderItems(items)) {
    const cartItem = await tx.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
      select: { id: true, quantity: true },
    });
    if (!cartItem) continue;
    changed = true;
    if (cartItem.quantity <= item.quantity) {
      await tx.cartItem.delete({ where: { id: cartItem.id } });
    } else {
      await tx.cartItem.update({ where: { id: cartItem.id }, data: { quantity: { decrement: item.quantity } } });
    }
  }

  if (changed) await tx.cart.update({ where: { id: cart.id }, data: { version: { increment: 1 } } });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");
  const orderId = searchParams.get("orderId");

  logger.info("Payment callback received", { gateway: "ZARINPAL", authority, status, orderId });

  if (!authority || !orderId) {
    return NextResponse.redirect(new URL("/cart/checkout/failure?reason=missing", request.nextUrl.origin));
  }

  const transaction = await prisma.paymentTransaction.findUnique({
    where: { authority },
    include: { order: { include: { items: true } } },
  });
  const order = transaction?.order;

  if (!transaction || !order || transaction.orderId !== orderId) {
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=not-found&orderId=${orderId}`, request.nextUrl.origin));
  }

  if (transaction.status === RECONCILIATION_STATUS || (transaction.status === "verified" && !isPaidOrderStatus(order.status))) {
    logger.warn("Payment callback is awaiting reconciliation", { orderId, authority });
    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}&review=1`, request.nextUrl.origin));
  }
  if (transaction.status === "paid" || isPaidOrderStatus(order.status)) {
    logger.info("Duplicate payment callback ignored", { orderId, authority });
    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
  }

  if (Number(transaction.amount) !== Number(order.total)) {
    logger.error("Payment callback amount no longer matches order", {
      orderId,
      authority,
      transactionAmount: Number(transaction.amount),
      orderTotal: Number(order.total),
    });
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=amount&orderId=${order.id}`, request.nextUrl.origin));
  }

  if (status !== "OK") {
    const result = await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ status: string }>>(
        Prisma.sql`SELECT "status"::text FROM "Order" WHERE "id" = ${order.id} FOR UPDATE`,
      );
      if (isPaidOrderStatus(locked[0]?.status)) return "paid" as const;
      const freshTransaction = await tx.paymentTransaction.findUnique({ where: { id: transaction.id } });
      if (!freshTransaction || freshTransaction.orderId !== order.id || freshTransaction.authority !== authority) {
        return "missing" as const;
      }
      if (PROTECTED_PAYMENT_STATUSES.some((paymentStatus) => paymentStatus === freshTransaction.status)) {
        return "protected" as const;
      }
      await recordPaymentTransaction(tx, {
        transactionId: transaction.id,
        amount: transaction.amount,
        authority,
        errorMessage: "پرداخت توسط کاربر یا درگاه نهایی نشد.",
        orderId: order.id,
        status: "cancelled",
        verifyPayload: { query: Object.fromEntries(searchParams.entries()) },
      });
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
        status: "PAYMENT_CANCELLED",
        title: "پرداخت تکمیل نشد",
        detail: "فرآیند پرداخت تکمیل نشد؛ سفارش محفوظ است و می‌توانید دوباره تلاش کنید.",
      });
      return "cancelled" as const;
    });
    if (result === "paid") {
      return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
    }
    if (result === "protected") {
      return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}&review=1`, request.nextUrl.origin));
    }
    if (result === "cancelled") {
      await sendTemplateSms(
        order.phone,
        "payment_failed",
        { orderNumber: smsOrderNumber(order.id) },
        { eventType: "payment_failed", dedupeKey: `payment_failed:${order.id}:${authority}` },
      ).catch((error) => logger.warn("Payment failure SMS could not be sent", {
        orderId: order.id,
        authority,
        error: error instanceof Error ? error.message : "unknown",
      }));
    }
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=cancelled&orderId=${order.id}`, request.nextUrl.origin));
  }

  let verification: PaymentVerifyResult;
  try {
    verification = await verifyZarinpalPayment(authority, transaction.amount);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    logger.error("Zarinpal verification failed", { error: message, orderId: order.id, authority });
    if (error instanceof ZarinpalTransportError) {
      const result = await recordVerificationPending({
        authority,
        message,
        orderId: order.id,
        query: Object.fromEntries(searchParams.entries()),
        transactionId: transaction.id,
      });
      if (result === "paid") {
        return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
      }
      return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}&review=1`, request.nextUrl.origin));
    }
    const result = await recordVerificationFailure({
      authority,
      message,
      orderId: order.id,
      query: Object.fromEntries(searchParams.entries()),
      transactionId: transaction.id,
      amount: transaction.amount,
    });
    if (result === "paid") {
      return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
    }
    if (result === "protected") {
      return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}&review=1`, request.nextUrl.origin));
    }
    await sendTemplateSms(
      order.phone,
      "payment_failed",
      { orderNumber: smsOrderNumber(order.id) },
      { eventType: "payment_failed", dedupeKey: `payment_failed:${order.id}:${authority}` },
    ).catch((smsError) => logger.warn("Payment failure SMS could not be sent", {
      orderId: order.id,
      authority,
      error: smsError instanceof Error ? smsError.message : "unknown",
    }));
    return NextResponse.redirect(new URL(`/cart/checkout/failure?reason=verify&orderId=${order.id}`, request.nextUrl.origin));
  }

  try {
    const didTransitionToPaid = await prisma.$transaction(async (tx) => {
      const lockedOrders = await tx.$queryRaw<Array<{ id: string; status: string }>>(
        Prisma.sql`SELECT "id", "status"::text FROM "Order" WHERE "id" = ${order.id} FOR UPDATE`,
      );
      const lockedOrder = lockedOrders[0];
      if (!lockedOrder) throw new Error("سفارش پیدا نشد.");
      if (isPaidOrderStatus(lockedOrder.status)) return false;
      if (lockedOrder.status !== "PENDING") {
        throw new Error(`پرداخت تایید شد، اما وضعیت سفارش ${lockedOrder.status} اجازه تسویه خودکار نمی‌دهد.`);
      }

      const freshTransaction = await tx.paymentTransaction.findUnique({ where: { id: transaction.id } });
      if (!freshTransaction || freshTransaction.orderId !== order.id || freshTransaction.authority !== authority) {
        throw new Error("تراکنش دقیق این پرداخت پیدا نشد.");
      }

      const freshOrder = await tx.order.findUnique({ where: { id: order.id }, include: { items: true } });
      if (!freshOrder) throw new Error("سفارش پیدا نشد.");

      await lockAndConsumeInventory(tx, freshOrder.items);
      await consumeCouponUsage(tx, freshOrder.couponId);
      await consumeOnlyOrderedCartQuantities(tx, freshOrder.userId, freshOrder.items);

      await recordPaymentTransaction(tx, {
        transactionId: transaction.id,
        amount: transaction.amount,
        authority,
        cardPan: verification.cardPan,
        orderId: order.id,
        paidAt: new Date(),
        refId: verification.refId,
        status: "paid",
        verifyPayload: { query: Object.fromEntries(searchParams.entries()) },
        verifyResponse: verification,
      });

      const orderUpdate = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING", paidAt: null },
        data: { status: "PAID", paymentRefId: verification.refId, paidAt: new Date() },
      });
      if (orderUpdate.count !== 1) throw new Error("وضعیت سفارش همزمان تغییر کرد.");

      await tx.paymentEvent.create({
        data: { orderId: order.id, authority, gateway: "ZARINPAL", status: "PAID", payload: verification },
      });
      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "PAID",
        title: "پرداخت موفق",
        detail: verification.refId ? `پرداخت با کد ${verification.refId} تایید شد.` : "پرداخت با موفقیت تایید شد.",
      });
      return true;
    });

    if (didTransitionToPaid) {
      await sendTemplateSms(
        order.phone,
        "payment_success",
        { orderNumber: smsOrderNumber(order.id) },
        { eventType: "payment_success", dedupeKey: `payment_success:${order.id}:${authority}` },
      ).catch((error) => logger.warn("Payment success SMS could not be sent", {
        orderId: order.id,
        authority,
        error: error instanceof Error ? error.message : "unknown",
      }));
    }
    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}`, request.nextUrl.origin));
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    logger.error("Verified payment requires reconciliation", { error: message, orderId: order.id, authority, refId: verification.refId });
    await markPaymentForReconciliation({
      authority,
      message,
      orderId: order.id,
      transactionId: transaction.id,
      verification,
      query: Object.fromEntries(searchParams.entries()),
    }).catch((reconciliationError) => {
      logger.error("Could not persist payment reconciliation state", {
        orderId: order.id,
        authority,
        error: reconciliationError instanceof Error ? reconciliationError.message : "unknown",
      });
    });
    return NextResponse.redirect(new URL(`/cart/checkout/success?orderId=${order.id}&review=1`, request.nextUrl.origin));
  }
}

async function recordVerificationPending(input: {
  authority: string;
  message: string;
  orderId: string;
  query: Record<string, string>;
  transactionId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ status: string }>>(
      Prisma.sql`SELECT "status"::text FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`,
    );
    if (isPaidOrderStatus(locked[0]?.status)) return "paid" as const;
    const freshTransaction = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!freshTransaction || freshTransaction.orderId !== input.orderId || freshTransaction.authority !== input.authority) {
      return "missing" as const;
    }
    if (["paid", "verified", RECONCILIATION_STATUS].includes(freshTransaction.status)) return "protected" as const;

    await recordPaymentTransaction(tx, {
      transactionId: input.transactionId,
      amount: freshTransaction.amount,
      authority: input.authority,
      errorMessage: input.message,
      orderId: input.orderId,
      status: VERIFICATION_PENDING_STATUS,
      verifyPayload: { query: input.query },
      verifyResponse: { transportError: input.message },
    });
    await tx.paymentEvent.create({
      data: {
        orderId: input.orderId,
        authority: input.authority,
        gateway: "ZARINPAL",
        status: "VERIFICATION_PENDING",
        payload: { error: input.message },
      },
    });
    await appendOrderStatusEvent(tx, {
      orderId: input.orderId,
      status: "PAYMENT_VERIFICATION_PENDING",
      title: "وضعیت پرداخت در حال بررسی است",
      detail: "پاسخ تایید درگاه دریافت نشد. برای جلوگیری از پرداخت دوباره، این سفارش تا بررسی نهایی محفوظ است.",
    });
    return "pending" as const;
  });
}

async function recordVerificationFailure(input: {
  authority: string;
  message: string;
  orderId: string;
  query: Record<string, string>;
  transactionId: string;
  amount: Prisma.Decimal;
}) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ status: string }>>(
      Prisma.sql`SELECT "status"::text FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`,
    );
    if (isPaidOrderStatus(locked[0]?.status)) return "paid" as const;
    const freshTransaction = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!freshTransaction || freshTransaction.orderId !== input.orderId || freshTransaction.authority !== input.authority) {
      return "missing" as const;
    }
    if (PROTECTED_PAYMENT_STATUSES.some((status) => status === freshTransaction.status)) return "protected" as const;
    await recordPaymentTransaction(tx, {
      transactionId: input.transactionId,
      amount: input.amount,
      authority: input.authority,
      errorMessage: input.message,
      orderId: input.orderId,
      status: "failed",
      verifyPayload: { query: input.query },
      verifyResponse: { error: input.message },
    });
    await tx.paymentEvent.create({
      data: {
        orderId: input.orderId,
        authority: input.authority,
        gateway: "ZARINPAL",
        status: "FAILED",
        payload: { error: input.message },
      },
    });
    await appendOrderStatusEvent(tx, {
      orderId: input.orderId,
      status: "PAYMENT_VERIFY_FAILED",
      title: "تایید پرداخت ناموفق بود",
      detail: "در تایید نهایی پرداخت خطا رخ داد؛ سفارش برای بررسی و تلاش دوباره محفوظ است.",
    });
    return "failed" as const;
  });
}

async function markPaymentForReconciliation(input: {
  authority: string;
  message: string;
  orderId: string;
  query: Record<string, string>;
  transactionId: string;
  verification: PaymentVerifyResult;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`);
    const freshTransaction = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!freshTransaction || freshTransaction.orderId !== input.orderId || freshTransaction.authority !== input.authority) {
      throw new Error("تراکنش پرداخت دقیق پیدا نشد.");
    }
    if (freshTransaction.status === "paid" || freshTransaction.status === RECONCILIATION_STATUS) return;

    await tx.paymentTransaction.update({
      where: { id: input.transactionId },
      data: {
        status: RECONCILIATION_STATUS,
        refId: input.verification.refId,
        cardPan: input.verification.cardPan,
        paidAt: new Date(),
        errorMessage: input.message,
        verifyPayload: { authority: input.authority, query: input.query },
        verifyResponse: { verification: input.verification, query: input.query, settlementError: input.message },
      },
    });
    await tx.paymentEvent.create({
      data: {
        orderId: input.orderId,
        authority: input.authority,
        gateway: "ZARINPAL",
        status: "RECONCILIATION_REQUIRED",
        payload: { refId: input.verification.refId, error: input.message },
      },
    });
    await appendOrderStatusEvent(tx, {
      orderId: input.orderId,
      status: "PAYMENT_RECONCILIATION_REQUIRED",
      title: "پرداخت تایید شد؛ سفارش در حال بررسی است",
      detail: "مبلغ در درگاه تایید شده، اما نهایی‌سازی سفارش به بررسی مدیر نیاز دارد. پرداخت جدید ایجاد نشود.",
    });
  });
}

async function recordPaymentTransaction(
  tx: Prisma.TransactionClient,
  input: {
    transactionId: string;
    amount: Prisma.Decimal | number;
    authority: string;
    cardPan?: string;
    errorMessage?: string;
    orderId: string;
    paidAt?: Date;
    refId?: string;
    status: string;
    verifyPayload?: Prisma.InputJsonValue;
    verifyResponse?: Prisma.InputJsonValue;
  },
) {
  const updated = await tx.paymentTransaction.updateMany({
    where: { id: input.transactionId, orderId: input.orderId, authority: input.authority },
    data: {
      amount: input.amount,
      cardPan: input.cardPan,
      errorMessage: input.errorMessage,
      paidAt: input.paidAt,
      refId: input.refId,
      status: input.status,
      verifyPayload: input.verifyPayload,
      verifyResponse: input.verifyResponse,
    },
  });
  if (updated.count !== 1) throw new Error("تراکنش دقیق این پرداخت پیدا نشد.");
}
