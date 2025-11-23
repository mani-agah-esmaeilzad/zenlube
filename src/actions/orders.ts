"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";

import prisma from "@/lib/prisma";
import { checkoutOrderSchema } from "@/lib/validators";
import { getAppSession } from "@/lib/session";
import { requestZarinpalPayment } from "@/lib/payments/zarinpal";
import { normalizeIranPhone } from "@/lib/phone";
import { verifyOtpCode, createOtpRequest } from "@/services/otp";
import { sendSmsIrOtp } from "@/lib/sms/smsir";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { consumeRateLimit } from "@/lib/rate-limit";

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
    throw new Error("تعداد درخواست‌های مجاز برای دریافت کد تایید به حد مجاز رسیده است. لطفاً بعداً تلاش کنید.");
  }
  const { code, expiresAt } = await createOtpRequest(normalizedPhone, "checkout");
  await sendSmsIrOtp({ phone: normalizedPhone, code, expiresAt });
  return { success: true } as const;
}

export async function createCheckoutOrderAction(
  _prev: CheckoutState | undefined,
  formData: FormData,
): Promise<CheckoutState> {
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
        message: "لطفاً خطاهای فرم را اصلاح کنید.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const input = parsed.data;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || !cart.items.length) {
      return {
        success: false,
        message: "سبد خرید شما خالی است.",
      };
    }

    await verifyOtpCode(input.phone, input.otpCode, "checkout");

    const subtotal = cart.items.reduce((sum, item) => {
      const price = Number(item.product.price);
      return sum + price * item.quantity;
    }, 0);

    const shippingCost = input.shippingMethod === "EXPRESS" ? 120000 : input.shippingMethod === "STANDARD" ? 60000 : 0;
    const total = subtotal + shippingCost;

    const normalizedPhone = normalizeIranPhone(input.phone);

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
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (input.saveAddress) {
        await tx.userAddress.upsert({
          where: {
            userId_isDefault: {
              userId,
              isDefault: true,
            },
          },
          update: {
            fullName: input.fullName,
            phone: normalizedPhone,
            address1: input.address1,
            address2: input.address2,
            city: input.city,
            province: input.province,
            postalCode: input.postalCode,
          },
          create: {
            userId,
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

      return createdOrder;
    });

    revalidatePath("/cart");

    const callbackBase = config.ZARINPAL_CALLBACK_URL ?? `${config.NEXT_PUBLIC_APP_URL}/api/payments/zarinpal/callback`;
    const callbackUrl = `${callbackBase}?orderId=${order.id}`;

    const payment = await requestZarinpalPayment({
      amount: order.total,
      description: `پرداخت سفارش ${order.id}`,
      callbackUrl,
      email: input.email,
      phone: normalizedPhone,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentAuthority: payment.authority },
    });

    return redirect(payment.paymentUrl);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    logger.error("Checkout order failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return {
      success: false,
      message: error instanceof Error ? error.message : "ثبت سفارش با خطا مواجه شد.",
    };
  }
}
