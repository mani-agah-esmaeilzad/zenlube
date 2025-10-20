"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { cartItemSchema } from "@/lib/validators";
import { getAppSession } from "@/lib/session";

type SessionWithUserId = {
  user: {
    id: string;
    role?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

async function requireSession(): Promise<SessionWithUserId> {
  const session = await getAppSession();
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;

  if (!session || !userId) {
    throw new Error("برای مدیریت سبد خرید ابتدا وارد شوید.");
  }

  const baseSession = session as { user?: Record<string, unknown> };

  return {
    ...session,
    user: {
      ...(baseSession.user ?? {}),
      id: userId,
    },
  } as SessionWithUserId;
}

export async function addToCartAction(input: { productId: string; quantity?: number }) {
  try {
    const session = await requireSession();

    const parsed = cartItemSchema.safeParse({
      productId: input.productId,
      quantity: input.quantity ?? 1,
    });

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const { productId, quantity } = parsed.data;

    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطای ناشناخته‌ای رخ داد.",
    };
  }
}

export async function updateCartItemAction(input: { productId: string; quantity: number }) {
  try {
    const session = await requireSession();

    const parsed = cartItemSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return { success: false, message: "سبد خرید یافت نشد." };
    }

    if (parsed.data.quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: parsed.data.productId,
          },
        },
      });
    } else {
      await prisma.cartItem.update({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: parsed.data.productId,
          },
        },
        data: {
          quantity: parsed.data.quantity,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطای ناشناخته‌ای رخ داد.",
    };
  }
}

export async function removeCartItemAction(productId: string) {
  try {
    const session = await requireSession();

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return { success: false, message: "سبد خرید یافت نشد." };
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطای ناشناخته‌ای رخ داد.",
    };
  }
}

export async function clearCartAction() {
  try {
    const session = await requireSession();

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return { success: false, message: "سبد خرید خالی است." };
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "خطای ناشناخته‌ای رخ داد.",
    };
  }
}
