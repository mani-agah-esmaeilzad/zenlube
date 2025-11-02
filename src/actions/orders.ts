"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { checkoutOrderSchema } from "@/lib/validators";
import { getAppSession } from "@/lib/session";
import { requestZarinpalPayment } from "@/lib/payments/zarinpal";
import { normalizeIranPhone } from "@/lib/phone";
import { verifyOtpCode, createOtpRequest } from "@/services/otp";
import { sendMelipayamakOtp } from "@/lib/sms/melipayamak";

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
  const normalizedPhone = normalizeIranPhone(phone);
  if (!/^\+989\d{9}$/.test(normalizedPhone)) {
    throw new Error("شماره موبایل معتبر نیست.");
  }
  const { code, expiresAt } = await createOtpRequest(normalizedPhone, "checkout");
  await sendMelipayamakOtp({ phone: normalizedPhone, code, expiresAt });
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

    const callbackUrl = `${process.env.ZARINPAL_CALLBACK_URL ?? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/payments/zarinpal/callback`}?orderId=${order.id}`;

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

    return {
      success: true,
      redirectUrl: payment.paymentUrl,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "ثبت سفارش با خطا مواجه شد.",
    };
  }
}
