"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { Prisma } from "@/generated/prisma";
import { appendOrderStatusEvent, calculateCouponDiscount } from "@/lib/commerce";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { requestExternalZarinpalPayment } from "@/lib/payments/payment-api";
import { requestZarinpalPayment } from "@/lib/payments/zarinpal";
import { normalizeIranPhone } from "@/lib/phone";
import prisma from "@/lib/prisma";
import { resolveProductPricing } from "@/lib/pricing";
import { getAppSession } from "@/lib/session";
import { notifyMerchantOfNewOrder } from "@/lib/sms/merchant-order";
import { normalizeIranPostalCode } from "@/lib/shipping/address";
import { findReplacementShippingOption, pendingOrderCartMatches } from "@/lib/shipping/quote-validation";
import { requestShippingQuote, validateShippingSelection, ShippingServiceError } from "@/lib/shipping/service";
import { sendTemplateSms, smsOrderNumber } from "@/lib/sms/service";
import { isStorefrontVisibleProduct } from "@/lib/storefront-visibility";
import { formatPrice } from "@/lib/utils";
import { checkoutOrderSchema } from "@/lib/validators";

export type CheckoutState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  redirectUrl?: string;
  orderId?: string;
};

async function requireUserId() {
  const session = await getAppSession();
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!session || !userId) throw new Error("برای ثبت سفارش ابتدا وارد حساب کاربری شوید.");
  return { session, userId } as const;
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function safeIntegerMoney(value: Prisma.Decimal | number | string) {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("مبلغ سفارش معتبر نیست.");
  return amount;
}

type PaymentOrder = {
  id: string;
  total: Prisma.Decimal;
  email: string;
  phone: string;
  status: string;
};

const PAYMENT_REQUEST_TTL_MS = 2 * 60 * 1000;
const PAYMENT_REDIRECT_TTL_MS = 30 * 60 * 1000;
const ACTIVE_PAYMENT_STATUSES = ["pending", "initiated", "redirected"] as const;
const PAYMENT_RECONCILIATION_STATUSES = ["reconciliation_required", "verification_pending", "verified"] as const;

type ActivePaymentAttempt = {
  status: string;
  updatedAt: Date;
};

function isFreshPaymentAttempt(attempt: ActivePaymentAttempt, now = Date.now()) {
  const ttl = attempt.status === "pending" ? PAYMENT_REQUEST_TTL_MS : PAYMENT_REDIRECT_TTL_MS;
  return attempt.updatedAt.getTime() > now - ttl;
}

function paymentUrlFromJson(value: Prisma.JsonValue | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const paymentUrl = (value as Record<string, unknown>).paymentUrl;
  if (typeof paymentUrl !== "string") return null;
  try {
    const parsed = new URL(paymentUrl);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

async function startPaymentForOrder(order: PaymentOrder) {
  if (order.status !== "PENDING") throw new Error("این سفارش در وضعیت پرداخت‌پذیر نیست.");
  const callbackBase = config.ZARINPAL_CALLBACK_URL ?? `${config.NEXT_PUBLIC_APP_URL}/api/payments/zarinpal/callback`;
  const callbackUrl = `${callbackBase}${callbackBase.includes("?") ? "&" : "?"}orderId=${encodeURIComponent(order.id)}`;
  const description = `پرداخت سفارش ${smsOrderNumber(order.id)} در Oilbar`;
  let localTransactionId: string | null = null;

  if (!config.PAYMENT_API_BASE_URL) {
    const claim = await prisma.$transaction(async (tx) => {
      const lockedOrders = await tx.$queryRaw<Array<{ status: string; paidAt: Date | null }>>(
        Prisma.sql`SELECT "status"::text, "paidAt" FROM "Order" WHERE "id" = ${order.id} FOR UPDATE`,
      );
      const lockedOrder = lockedOrders[0];
      if (!lockedOrder || lockedOrder.status !== "PENDING" || lockedOrder.paidAt) {
        throw new Error("این سفارش در وضعیت پرداخت‌پذیر نیست.");
      }

      const reconciliation = await tx.paymentTransaction.findFirst({
        where: { orderId: order.id, status: { in: [...PAYMENT_RECONCILIATION_STATUSES] } },
        select: { id: true },
      });
      if (reconciliation) {
        throw new Error("وضعیت این پرداخت در حال بررسی است؛ از ایجاد پرداخت جدید خودداری کنید.");
      }

      const active = await tx.paymentTransaction.findFirst({
        where: { orderId: order.id, status: { in: [...ACTIVE_PAYMENT_STATUSES] } },
        orderBy: { createdAt: "desc" },
        select: { id: true, authority: true, requestResponse: true, status: true, updatedAt: true },
      });
      const isFresh = active ? isFreshPaymentAttempt(active) : false;
      const reusableUrl = active && active.status !== "pending" && isFresh
        ? paymentUrlFromJson(active.requestResponse)
        : null;
      if (active && isFresh && reusableUrl) {
        return { transactionId: active.id, paymentUrl: reusableUrl, authority: active.authority };
      }
      if (active && isFresh) {
        throw new Error("درخواست پرداخت قبلی در حال آماده‌سازی است؛ چند لحظه دیگر دوباره تلاش کنید.");
      }
      if (active) {
        const abandoned = await tx.paymentTransaction.updateMany({
          where: { id: active.id, status: { in: [...ACTIVE_PAYMENT_STATUSES] }, updatedAt: active.updatedAt },
          data: { status: "request_abandoned", errorMessage: "درخواست پرداخت بدون پاسخ نهایی رها شد." },
        });
        if (abandoned.count !== 1) {
          throw new Error("وضعیت پرداخت همزمان تغییر کرد؛ لطفاً دوباره تلاش کنید.");
        }
      }

      const transaction = await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          gateway: "zarinpal",
          amount: order.total,
          currency: "IRR",
          status: "pending",
          requestPayload: { callbackUrl, description },
        },
      });
      return { transactionId: transaction.id, paymentUrl: null, authority: null };
    });
    if (claim.paymentUrl) return claim.paymentUrl;
    localTransactionId = claim.transactionId;
  }

  try {
    const payment = config.PAYMENT_API_BASE_URL
      ? await requestExternalZarinpalPayment(order.id)
      : await requestZarinpalPayment({
          amount: order.total,
          description,
          callbackUrl,
          email: order.email,
          phone: order.phone,
          metadata: { order_id: order.id, transaction_id: localTransactionId },
        });

    await prisma.$transaction(async (tx) => {
      if (payment.authority) {
        await tx.order.update({ where: { id: order.id }, data: { paymentAuthority: payment.authority } });
      }
      if (localTransactionId) {
        await tx.paymentTransaction.update({
          where: { id: localTransactionId },
          data: {
            authority: payment.authority ?? null,
            status: payment.authority ? "initiated" : "redirected",
            requestResponse: { ...payment, paymentUrl: payment.paymentUrl },
          },
        });
      }
      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "PAYMENT_STARTED",
        title: "انتقال به درگاه پرداخت",
        detail: "درخواست جدید پرداخت برای سفارش ثبت شد.",
      });
    });

    after(() => sendTemplateSms(
      order.phone,
      "payment_started",
      { orderNumber: smsOrderNumber(order.id) },
      { eventType: "payment_started", dedupeKey: `payment_started:${order.id}:${payment.authority ?? localTransactionId ?? "external"}` },
    ).catch((error) => {
      logger.warn("Payment started SMS could not be sent", {
        orderId: order.id,
        error: error instanceof Error ? error.message : "unknown",
      });
    }));
    return payment.paymentUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "اتصال به درگاه پرداخت ناموفق بود.";
    if (localTransactionId) {
      await prisma.paymentTransaction.update({
        where: { id: localTransactionId },
        data: { status: "request_failed", errorMessage: message },
      }).catch(() => undefined);
    }
    await prisma.$transaction(async (tx) => {
      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "PAYMENT_REQUEST_FAILED",
        title: "اتصال به درگاه ناموفق بود",
        detail: "سفارش محفوظ مانده و امکان تلاش دوباره وجود دارد.",
      });
    }).catch(() => undefined);
    throw error;
  }
}

export async function createCheckoutOrderAction(
  _prev: CheckoutState | undefined,
  formData: FormData,
): Promise<CheckoutState> {
  let orderId: string | null = null;
  try {
    const { userId } = await requireUserId();
    const raw = Object.fromEntries(formData);
    const parsed = checkoutOrderSchema.safeParse({
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      address1: raw.address1,
      address2: raw.address2,
      cityCode: raw.cityCode,
      provinceCode: raw.provinceCode,
      postalCode: raw.postalCode,
      shippingOptionId: raw.shippingOptionId,
      checkoutIdempotencyKey: raw.checkoutIdempotencyKey,
      couponCode: raw.couponCode,
      notes: raw.notes,
      saveAddress: raw.saveAddress,
    });
    if (!parsed.success) {
      return { success: false, message: "لطفاً خطاهای فرم را اصلاح کنید.", errors: parsed.error.flatten().fieldErrors };
    }

    const input = parsed.data;
    const destination = {
      provinceCode: input.provinceCode,
      cityCode: input.cityCode,
      postalCode: input.postalCode,
      address1: input.address1,
      address2: input.address2,
    };

    const existingOrder = await prisma.order.findUnique({
      where: { userId_checkoutIdempotencyKey: { userId, checkoutIdempotencyKey: input.checkoutIdempotencyKey } },
      select: { id: true, total: true, email: true, phone: true, status: true, paymentMethod: true, shippingQuoteOptionId: true },
    });
    if (existingOrder) {
      if (existingOrder.shippingQuoteOptionId !== input.shippingOptionId) {
        return { success: false, message: "اطلاعات این تلاش پرداخت با سفارش ذخیره‌شده یکسان نیست." };
      }
      if (existingOrder.status === "PAID") {
        return { success: true, message: "این سفارش قبلاً پرداخت شده است.", redirectUrl: `/cart/checkout/success?orderId=${existingOrder.id}` };
      }
      if (existingOrder.status !== "PENDING") {
        return { success: false, message: "این سفارش دیگر قابل پرداخت نیست.", orderId: existingOrder.id };
      }
      await validateShippingSelection({
        userId,
        orderId: existingOrder.id,
        optionId: input.shippingOptionId,
        destination,
        couponCode: input.couponCode,
      });
      orderId = existingOrder.id;
      const paymentUrl = await startPaymentForOrder(existingOrder);
      return { success: true, message: "در حال انتقال به درگاه پرداخت...", redirectUrl: paymentUrl, orderId };
    }

    // This performs the full authoritative cart, price, discount, package,
    // address and quote-fingerprint validation before order creation.
    const validated = await validateShippingSelection({
      userId,
      optionId: input.shippingOptionId,
      destination,
      couponCode: input.couponCode,
    });

    const normalizedPhone = normalizeIranPhone(input.phone);
    if (!/^\+989\d{9}$/.test(normalizedPhone)) {
      return { success: false, message: "شماره موبایل معتبر نیست.", errors: { phone: ["شماره موبایل معتبر نیست."] } };
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      const lockedCarts = await tx.$queryRaw<Array<{ id: string; version: number }>>(
        Prisma.sql`SELECT "id", "version" FROM "Cart" WHERE "id" = ${validated.context.cart.id} FOR UPDATE`,
      );
      if (lockedCarts[0]?.version !== validated.context.cart.version) {
        throw new ShippingServiceError("QUOTE_STALE", "سبد خرید تغییر کرده؛ هزینه ارسال را دوباره محاسبه کنید.", 409, true);
      }

      const freshOption = await tx.shippingQuoteOption.findUnique({
        where: { id: input.shippingOptionId },
        include: { request: true },
      });
      if (!freshOption || freshOption.request.userId !== userId || freshOption.request.fingerprint !== validated.context.fingerprint || freshOption.request.expiresAt <= new Date()) {
        throw new ShippingServiceError("QUOTE_STALE", "اعتبار قیمت ارسال تمام شده؛ دوباره استعلام بگیرید.", 409, true);
      }

      const freshCart = await tx.cart.findUnique({
        where: { id: validated.context.cart.id },
        include: { items: { include: { product: { include: { promotion: true } } }, orderBy: { id: "asc" } } },
      });
      if (!freshCart || !freshCart.items.length) throw new Error("سبد خرید شما خالی است.");

      const now = new Date();
      const pricedItems = freshCart.items.map((item) => {
        if (!isStorefrontVisibleProduct(item.product) || item.product.stock < item.quantity) {
          throw new Error(`موجودی محصول «${item.product.name}» کافی نیست.`);
        }
        const unitPrice = safeIntegerMoney(resolveProductPricing(item.product, now).effectivePrice);
        if (unitPrice <= 0) throw new Error(`قیمت محصول «${item.product.name}» هنوز نهایی نشده است.`);
        return { ...item, unitPrice };
      });
      const subtotal = pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      let discountAmount = 0;
      let coupon: Awaited<ReturnType<typeof tx.coupon.findUnique>> = null;
      if (validated.context.coupon) {
        coupon = await tx.coupon.findUnique({ where: { id: validated.context.coupon.id } });
        if (!coupon || !coupon.isActive || (coupon.endsAt && coupon.endsAt < now) || (coupon.startsAt && coupon.startsAt > now) || (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)) {
          throw new Error("کد تخفیف معتبر نیست یا منقضی شده است.");
        }
        const discount = calculateCouponDiscount(coupon, subtotal);
        if (!discount.valid) throw new Error(discount.message ?? "کد تخفیف قابل استفاده نیست.");
        discountAmount = safeIntegerMoney(Math.round(discount.discount));
      }

      if (subtotal !== validated.context.subtotalRials || discountAmount !== validated.context.discountRials) {
        throw new ShippingServiceError("QUOTE_STALE", "قیمت سبد تغییر کرده؛ هزینه ارسال را دوباره محاسبه کنید.", 409, true);
      }

      const shippingCost = safeIntegerMoney(freshOption.customerCost);
      const total = subtotal - discountAmount + shippingCost;
      const location = validated.context.destinationLocation;
      const postalCode = normalizeIranPostalCode(input.postalCode);
      const hasLiquid = validated.context.items.some((item) => item.product.shippingIsLiquid);

      const order = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          total,
          fullName: input.fullName,
          email: input.email,
          phone: normalizedPhone,
          address1: input.address1,
          address2: input.address2,
          city: location.city.name,
          province: location.province.name,
          cityCode: location.city.code,
          provinceCode: location.province.code,
          postalCode,
          country: "IR",
          paymentMethod: "ONLINE",
          paymentGateway: "ZARINPAL",
          shippingMethod: freshOption.serviceCode === "PICKUP" ? "PICKUP" : null,
          shippingCost,
          checkoutIdempotencyKey: input.checkoutIdempotencyKey,
          shippingQuoteOptionId: freshOption.id,
          shippingProviderKey: freshOption.request.providerKey,
          shippingCarrierCode: freshOption.carrierCode,
          shippingCarrierLabel: freshOption.carrierLabel,
          shippingServiceCode: freshOption.serviceCode,
          shippingServiceLabel: freshOption.serviceLabel,
          shippingBaseCost: freshOption.baseCost,
          shippingAdjustmentAmount: freshOption.adjustmentAmount,
          shippingCurrency: freshOption.currency,
          shippingPackageWeightGrams: freshOption.request.packageWeightGrams,
          shippingPackageLengthCm: freshOption.request.packageLengthCm,
          shippingPackageWidthCm: freshOption.request.packageWidthCm,
          shippingPackageHeightCm: freshOption.request.packageHeightCm,
          shippingPackageTypeCode: freshOption.request.packageTypeCode,
          shippingIsLiquid: hasLiquid,
          shippingQuotedAt: freshOption.request.quotedAt,
          shippingQuoteExpiresAt: freshOption.request.expiresAt,
          discountAmount,
          couponId: coupon?.id ?? null,
          couponCode: coupon?.code ?? null,
          estimatedDeliveryLabel: freshOption.estimatedDeliveryLabel,
          notes: input.notes,
          items: {
            createMany: {
              data: pricedItems.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.unitPrice })),
            },
          },
        },
      });

      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "PENDING",
        title: "سفارش ثبت شد",
        detail: `سفارش با ${freshOption.serviceLabel} و مبلغ ${formatPrice(total)} ثبت شد.`,
      });

      const addressData = {
        fullName: input.fullName,
        phone: normalizedPhone,
        address1: input.address1,
        address2: input.address2 ?? null,
        city: location.city.name,
        province: location.province.name,
        cityCode: location.city.code,
        provinceCode: location.province.code,
        postalCode,
      };
      if (input.saveAddress) {
        await tx.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
        const existing = await tx.userAddress.findFirst({
          where: { userId, address1: input.address1, cityCode: input.cityCode, provinceCode: input.provinceCode, postalCode },
          select: { id: true },
        });
        if (existing) await tx.userAddress.update({ where: { id: existing.id }, data: { ...addressData, isDefault: true } });
        else await tx.userAddress.create({ data: { userId, label: "آدرس اصلی", ...addressData, isDefault: true } });
      } else {
        const defaultAddress = await tx.userAddress.findFirst({ where: { userId, isDefault: true }, select: { id: true } });
        if (!defaultAddress) await tx.userAddress.create({ data: { userId, label: "آدرس اصلی", ...addressData, isDefault: true } });
      }

      return order;
    });

    orderId = createdOrder.id;
    logger.info("Order created with validated shipping", {
      orderId,
      userId,
      carrier: createdOrder.shippingCarrierCode,
      total: Number(createdOrder.total),
    });
    revalidatePath("/cart");
    revalidatePath("/account");

    after(() => sendTemplateSms(
      createdOrder.phone,
      "order_created",
      { orderNumber: smsOrderNumber(createdOrder.id) },
      { eventType: "order_created", dedupeKey: `order_created:${createdOrder.id}` },
    ).catch((error) => {
      logger.warn("Order created SMS could not be sent", {
        orderId: createdOrder.id,
        error: error instanceof Error ? error.message : "unknown",
      });
    }));
    after(() => notifyMerchantOfNewOrder(createdOrder.id));
    const paymentUrl = await startPaymentForOrder(createdOrder);
    return { success: true, message: "در حال انتقال به درگاه پرداخت...", redirectUrl: paymentUrl, orderId };
  } catch (error) {
    if (isUniqueConstraintError(error) && orderId == null) {
      logger.warn("Duplicate checkout request prevented", { error: error instanceof Error ? error.message : "unique constraint" });
    }
    const message = error instanceof Error ? error.message : "اتصال به درگاه پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.";
    logger.error("Checkout order failed", { error: message, orderId });
    return {
      success: false,
      orderId: orderId ?? undefined,
      message: orderId
        ? `سفارش شما محفوظ است، اما اتصال به درگاه انجام نشد. دوباره تلاش کنید. (${message})`
        : message,
    };
  }
}

export async function retryOrderPaymentAction(formData: FormData): Promise<void> {
  const { userId } = await requireUserId();
  const orderId = formData.get("orderId");
  if (typeof orderId !== "string" || !orderId) throw new Error("شناسه سفارش معتبر نیست.");
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      total: true,
      email: true,
      phone: true,
      status: true,
      paymentMethod: true,
      shippingQuoteOptionId: true,
      provinceCode: true,
      cityCode: true,
      postalCode: true,
      address1: true,
      address2: true,
      couponCode: true,
      shippingCarrierCode: true,
      shippingServiceCode: true,
      discountAmount: true,
      items: { select: { productId: true, quantity: true, price: true } },
    },
  });
  if (!order) throw new Error("سفارش پیدا نشد.");
  if (order.status === "PAID") redirect(`/cart/checkout/success?orderId=${order.id}`);
  if (order.status !== "PENDING" || !order.shippingQuoteOptionId || !order.provinceCode || !order.cityCode) {
    throw new Error("این سفارش قابل پرداخت مجدد نیست.");
  }
  const destination = {
    provinceCode: order.provinceCode,
    cityCode: order.cityCode,
    postalCode: order.postalCode,
    address1: order.address1,
    address2: order.address2,
  };

  try {
    await validateShippingSelection({
      userId,
      orderId: order.id,
      optionId: order.shippingQuoteOptionId,
      destination,
      couponCode: order.couponCode,
    });
  } catch (error) {
    if (!(error instanceof ShippingServiceError) || !["QUOTE_EXPIRED", "QUOTE_STALE"].includes(error.code)) {
      throw error;
    }

    const quote = await requestShippingQuote(userId, destination, order.couponCode);
    const replacement = order.shippingCarrierCode && order.shippingServiceCode
      ? findReplacementShippingOption(quote.options, {
          carrierCode: order.shippingCarrierCode,
          serviceCode: order.shippingServiceCode,
        })
      : null;
    if (!replacement) {
      redirect(`/cart/checkout/failure?reason=shipping-unavailable&orderId=${encodeURIComponent(order.id)}`);
    }

    const refreshed = await validateShippingSelection({
      userId,
      optionId: replacement.id,
      destination,
      couponCode: order.couponCode,
    });
    const cartStillMatches = pendingOrderCartMatches(
      order.items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPriceRials: safeIntegerMoney(item.price) })),
      refreshed.context.items.map((item) => ({ productId: item.product.id, quantity: item.quantity, unitPriceRials: item.unitPriceRials })),
    );
    if (!cartStillMatches || refreshed.context.discountRials !== safeIntegerMoney(order.discountAmount)) {
      redirect(`/cart/checkout/failure?reason=cart-changed&orderId=${encodeURIComponent(order.id)}`);
    }

    const replacementCost = safeIntegerMoney(refreshed.option.customerCost);
    const replacementTotal = refreshed.context.subtotalRials - refreshed.context.discountRials + replacementCost;
    const hasLiquid = refreshed.context.items.some((item) => item.product.shippingIsLiquid);
    const refreshResult = await prisma.$transaction(async (tx) => {
      const lockedOrders = await tx.$queryRaw<Array<{ status: string; shippingQuoteOptionId: string | null }>>(
        Prisma.sql`SELECT "status"::text, "shippingQuoteOptionId" FROM "Order" WHERE "id" = ${order.id} FOR UPDATE`,
      );
      const lockedOrder = lockedOrders[0];
      if (!lockedOrder || lockedOrder.status !== "PENDING") throw new Error("این سفارش دیگر قابل پرداخت نیست.");
      if (lockedOrder.shippingQuoteOptionId !== order.shippingQuoteOptionId) return "already-refreshed" as const;

      const activePayment = await tx.paymentTransaction.findFirst({
        where: {
          orderId: order.id,
          status: { in: [...ACTIVE_PAYMENT_STATUSES, ...PAYMENT_RECONCILIATION_STATUSES] },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, updatedAt: true },
      });
      if (activePayment && PAYMENT_RECONCILIATION_STATUSES.some((status) => status === activePayment.status)) {
        return "payment-active" as const;
      }
      if (activePayment && isFreshPaymentAttempt(activePayment)) return "payment-active" as const;
      if (activePayment) {
        const abandoned = await tx.paymentTransaction.updateMany({
          where: { id: activePayment.id, status: { in: [...ACTIVE_PAYMENT_STATUSES] }, updatedAt: activePayment.updatedAt },
          data: { status: "request_abandoned", errorMessage: "درخواست قبلی پرداخت پس از اتمام مهلت رها شد." },
        });
        if (abandoned.count !== 1) return "payment-active" as const;
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          total: replacementTotal,
          shippingCost: replacementCost,
          shippingQuoteOptionId: refreshed.option.id,
          shippingProviderKey: refreshed.option.request.providerKey,
          shippingCarrierCode: refreshed.option.carrierCode,
          shippingCarrierLabel: refreshed.option.carrierLabel,
          shippingServiceCode: refreshed.option.serviceCode,
          shippingServiceLabel: refreshed.option.serviceLabel,
          shippingMethod: refreshed.option.serviceCode === "PICKUP" ? "PICKUP" : null,
          shippingBaseCost: refreshed.option.baseCost,
          shippingAdjustmentAmount: refreshed.option.adjustmentAmount,
          shippingCurrency: refreshed.option.currency,
          shippingPackageWeightGrams: refreshed.option.request.packageWeightGrams,
          shippingPackageLengthCm: refreshed.option.request.packageLengthCm,
          shippingPackageWidthCm: refreshed.option.request.packageWidthCm,
          shippingPackageHeightCm: refreshed.option.request.packageHeightCm,
          shippingPackageTypeCode: refreshed.option.request.packageTypeCode,
          shippingIsLiquid: hasLiquid,
          shippingQuotedAt: refreshed.option.request.quotedAt,
          shippingQuoteExpiresAt: refreshed.option.request.expiresAt,
          estimatedDeliveryLabel: refreshed.option.estimatedDeliveryLabel,
        },
      });
      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "SHIPPING_REQUOTED",
        title: "هزینه ارسال به‌روز شد",
        detail: `نرخ ${refreshed.option.serviceLabel} پیش از تلاش دوباره برای پرداخت، مجدداً استعلام شد.`,
      });
      return "refreshed" as const;
    });
    if (refreshResult === "payment-active") {
      redirect(`/cart/checkout/failure?reason=payment-active&orderId=${encodeURIComponent(order.id)}`);
    }
    redirect(`/cart/checkout/failure?reason=shipping-refreshed&orderId=${encodeURIComponent(order.id)}`);
  }

  let paymentUrl: string;
  try {
    paymentUrl = await startPaymentForOrder(order);
  } catch (error) {
    logger.warn("Retry payment request failed", {
      orderId: order.id,
      error: error instanceof Error ? error.message : "unknown",
    });
    redirect(`/cart/checkout/failure?reason=request&orderId=${encodeURIComponent(order.id)}`);
  }
  redirect(paymentUrl);
}
