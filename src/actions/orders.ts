"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { appendOrderStatusEvent, calculateCouponDiscount, findActiveCouponByCode, getShippingEstimateLabel } from "@/lib/commerce";
import { checkoutOrderSchema } from "@/lib/validators";
import { getAppSession } from "@/lib/session";
import { requestZarinpalPayment } from "@/lib/payments/zarinpal";
import { requestExternalZarinpalPayment } from "@/lib/payments/payment-api";
import { normalizeIranPhone } from "@/lib/phone";
import { verifyOtpCode, createOtpRequest } from "@/services/otp";
import { sendOtpSms, sendTemplateSms, smsOrderNumber } from "@/lib/sms/service";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isStorefrontVisibleProduct } from "@/lib/storefront-visibility";

export type CheckoutState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  redirectUrl?: string;
};

async function requireUserId() {
  const session = await getAppSession();
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!session || !userId) {
    throw new Error("برای ثبت سفارش ابتدا وارد حساب کاربری شوید.");
  }
  return { session, userId } as const;
}

export async function sendCheckoutOtpAction(phone: string) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip");
  const clientIp = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
  const normalizedPhone = normalizeIranPhone(phone);
  if (!/^\+989\d{9}$/.test(normalizedPhone)) {
    throw new Error("شماره موبایل معتبر نیست.");
  }
  const phoneKey = `otp:${normalizedPhone}`;
  const ipKey = `otp-ip:${clientIp}`;
  const [{ success: phoneOk }, { success: ipOk }] = await Promise.all([
    consumeRateLimit(phoneKey, config.OTP_RATE_LIMIT_WINDOW, config.OTP_RATE_LIMIT_MAX),
    consumeRateLimit(ipKey, config.OTP_RATE_LIMIT_WINDOW, config.OTP_RATE_LIMIT_MAX * 2),
  ]);

  if (!phoneOk || !ipOk) {
    throw new Error("تعداد درخواست‌های مجاز برای دریافت کد تایید به حد مجاز رسیده است. لطفا بعدا تلاش کنید.");
  }
  const { code, expiresAt } = await createOtpRequest(normalizedPhone, "checkout");
  await sendOtpSms(normalizedPhone, code, expiresAt);
  return { success: true } as const;
}

export async function createCheckoutOrderAction(
  _prev: CheckoutState | undefined,
  formData: FormData,
): Promise<CheckoutState> {
  let createdOrderId: string | null = null;
  let createdOrderTotal = 0;

  try {
    const { userId } = await requireUserId();
    const raw = Object.fromEntries(formData);
    const parsed = checkoutOrderSchema.safeParse({
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      address1: raw.address1,
      address2: raw.address2,
      city: raw.city,
      province: raw.province,
      postalCode: raw.postalCode,
      shippingMethod: raw.shippingMethod,
      notes: raw.notes,
      otpCode: raw.otpCode,
      saveAddress: raw.saveAddress,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "لطفا خطاهای فرم را اصلاح کنید.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const input = parsed.data;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || !cart.items.length) {
      return { success: false, message: "سبد خرید شما خالی است." };
    }

    await verifyOtpCode(input.phone, input.otpCode, "checkout");

    const deletedItem = cart.items.find((item) => !isStorefrontVisibleProduct(item.product));
    if (deletedItem) {
      return { success: false, message: "یکی از محصولات سبد خرید دیگر در فروشگاه فعال نیست." };
    }

    const unavailable = cart.items.find((item) => item.product.stock < item.quantity);
    if (unavailable) {
      return { success: false, message: `موجودی محصول «${unavailable.product.name}» کافی نیست.` };
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const shippingCost = input.shippingMethod === "EXPRESS" ? 120000 : input.shippingMethod === "STANDARD" ? 60000 : 0;
    const estimatedDeliveryLabel = getShippingEstimateLabel(input.shippingMethod);
    const normalizedPhone = normalizeIranPhone(input.phone);
    const coupon = input.couponCode ? await findActiveCouponByCode(input.couponCode) : null;

    if (input.couponCode && !coupon) {
      return { success: false, message: "کد تخفیف معتبر نیست یا منقضی شده است." };
    }

    const discountValidation = coupon
      ? calculateCouponDiscount(coupon, subtotal)
      : { valid: true as const, discount: 0, message: null };

    if (!discountValidation.valid) {
      return { success: false, message: discountValidation.message ?? "کد تخفیف قابل استفاده نیست." };
    }

    const discountAmount = discountValidation.discount;
    const total = Math.max(0, subtotal + shippingCost - discountAmount);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          total,
          fullName: input.fullName,
          email: input.email,
          phone: normalizedPhone,
          address1: input.address1,
          address2: input.address2,
          city: input.city,
          province: input.province,
          postalCode: input.postalCode,
          country: "IR",
          paymentMethod: "ONLINE",
          paymentGateway: "ZARINPAL",
          shippingMethod: input.shippingMethod,
          shippingCost,
          discountAmount,
          couponId: coupon?.id ?? null,
          couponCode: coupon?.code ?? null,
          estimatedDeliveryLabel,
          notes: input.notes,
          items: {
            createMany: {
              data: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
        },
      });

      await appendOrderStatusEvent(tx, {
        orderId: createdOrder.id,
        status: "PENDING",
        title: "سفارش ثبت شد",
        detail: `سفارش با مبلغ ${total.toLocaleString("fa-IR")} تومان ثبت شد.`,
      });

      if (input.saveAddress) {
        await tx.userAddress.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });

        const existingAddress = await tx.userAddress.findFirst({
          where: {
            userId,
            fullName: input.fullName,
            phone: normalizedPhone,
            address1: input.address1,
            address2: input.address2 ?? null,
            city: input.city,
            province: input.province,
            postalCode: input.postalCode,
          },
          select: { id: true },
        });

        if (existingAddress) {
          await tx.userAddress.update({
            where: { id: existingAddress.id },
            data: { isDefault: true },
          });
        } else {
          await tx.userAddress.create({
            data: {
              userId,
              label: "آدرس checkout",
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
        }
      } else {
        const hasDefaultAddress = await tx.userAddress.findFirst({
          where: { userId, isDefault: true },
          select: { id: true },
        });

        if (!hasDefaultAddress) {
          await tx.userAddress.create({
            data: {
              userId,
              label: "آدرس اصلی",
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
        }
      }

      return createdOrder;
    });
    createdOrderId = order.id;
    createdOrderTotal = Number(order.total);

    logger.info("Order created", { orderId: order.id, userId, total });
    revalidatePath("/cart");

    await sendTemplateSms(
      normalizedPhone,
      "order_created",
      { orderNumber: smsOrderNumber(order.id) },
      { eventType: "order_created", dedupeKey: `order_created:${order.id}` },
    );

    const callbackUrl = `${config.ZARINPAL_CALLBACK_URL ?? `${config.NEXT_PUBLIC_APP_URL}/api/payments/zarinpal/callback`}?orderId=${order.id}`;

    const payment = config.PAYMENT_API_BASE_URL
      ? await requestExternalZarinpalPayment(order.id)
      : await requestZarinpalPayment({
          amount: order.total,
      description: `پرداخت سفارش ${smsOrderNumber(order.id)} در Oilbar`,
          callbackUrl,
          email: input.email,
          phone: normalizedPhone,
          metadata: { orderId: order.id },
        });

    await prisma.$transaction(async (tx) => {
      if (payment.authority) {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentAuthority: payment.authority },
        });
      }

      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          gateway: "zarinpal",
          amount: order.total,
          currency: "IRT",
          authority: payment.authority ?? null,
          status: payment.authority ? "initiated" : "redirected",
          requestPayload: {
            callbackUrl,
            description: `پرداخت سفارش ${smsOrderNumber(order.id)} در Oilbar`,
            email: input.email,
            phone: normalizedPhone,
          },
          requestResponse: payment,
        },
      });

      await appendOrderStatusEvent(tx, {
        orderId: order.id,
        status: "PAYMENT_STARTED",
        title: "انتقال به درگاه پرداخت",
        detail: "کاربر برای تکمیل پرداخت به درگاه منتقل شد.",
      });
    });

    await sendTemplateSms(
      normalizedPhone,
      "payment_started",
      { orderNumber: smsOrderNumber(order.id) },
      { eventType: "payment_started", dedupeKey: `payment_started:${order.id}:${payment.authority ?? "external"}` },
    );

    return {
      success: true,
      message: "در حال انتقال به درگاه پرداخت...",
      redirectUrl: payment.paymentUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    logger.error("Checkout order failed", { error: message, orderId: createdOrderId });

    if (createdOrderId) {
      const failedOrderId = createdOrderId;
      const failedOrderTotal = createdOrderTotal;

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: failedOrderId },
          data: { status: "CANCELLED" },
        });
        await tx.paymentTransaction.create({
          data: {
            orderId: failedOrderId,
            gateway: "zarinpal",
            amount: failedOrderTotal,
            currency: "IRT",
            status: "request_failed",
            errorMessage: message,
          },
        });
        await appendOrderStatusEvent(tx, {
          orderId: failedOrderId,
          status: "PAYMENT_REQUEST_FAILED",
          title: "اتصال به درگاه ناموفق بود",
          detail: "در آغاز تراکنش از سمت فروشگاه خطا رخ داد و سفارش لغو شد.",
        });
      });
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "اتصال به درگاه پرداخت ناموفق بود. لطفا دوباره تلاش کنید.",
    };
  }
}
