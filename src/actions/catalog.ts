"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { getAppSession } from "@/lib/session";
import { isStorefrontVisibleProduct } from "@/lib/storefront-visibility";
import { productReviewSchema } from "@/lib/validators";

type ActionResult = {
  success: boolean;
  message?: string;
};

type ReviewActionState = ActionResult & {
  errors?: Record<string, string[]>;
};

async function requireUser() {
  const session = await getAppSession();
  const user = (session as { user?: { id?: string; name?: string | null; email?: string | null } } | null)?.user;

  if (!user?.id) {
    throw new Error("برای استفاده از این بخش ابتدا وارد حساب کاربری شوید.");
  }

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
  };
}

export async function toggleWishlistAction(productId: string): Promise<ActionResult & { active?: boolean }> {
  try {
    const user = await requireUser();

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });

    if (!isStorefrontVisibleProduct(product)) {
      return { success: false, message: "محصول انتخاب‌شده معتبر نیست." };
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/account");
      revalidatePath(`/products/${product.slug}`);
      return { success: true, active: false, message: "از علاقه‌مندی‌ها حذف شد." };
    }

    await prisma.$transaction([
      prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId,
        },
      }),
      prisma.engagementEvent.create({
        data: {
          entityType: "product",
          entityId: productId,
          eventType: "wishlist_add",
          metadata: { userId: user.id },
        },
      }),
    ]);

    revalidatePath("/account");
    revalidatePath(`/products/${product.slug}`);
    return { success: true, active: true, message: "به علاقه‌مندی‌ها اضافه شد." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "عملیات علاقه‌مندی با خطا مواجه شد.",
    };
  }
}

export async function recordRecentlyViewedAction(productId: string): Promise<void> {
  try {
    const user = await requireUser();

    await prisma.$transaction([
      prisma.recentlyViewedProduct.upsert({
        where: { userId_productId: { userId: user.id, productId } },
        update: { viewedAt: new Date() },
        create: { userId: user.id, productId },
      }),
      prisma.engagementEvent.create({
        data: {
          entityType: "product",
          entityId: productId,
          eventType: "recent_view",
          metadata: { userId: user.id },
        },
      }),
    ]);

    revalidatePath("/account");
  } catch {
    return;
  }
}

export async function createProductReviewAction(
  _prev: ReviewActionState | undefined,
  formData: FormData,
): Promise<ReviewActionState> {
  try {
    const user = await requireUser();
    const parsed = productReviewSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return {
        success: false,
        message: "لطفا خطاهای فرم را بررسی کنید.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const input = parsed.data;

    const [product, verifiedPurchase] = await Promise.all([
      prisma.product.findUnique({
        where: { id: input.productId },
        select: { id: true, slug: true, name: true },
      }),
      prisma.orderItem.findFirst({
        where: {
          productId: input.productId,
          order: {
            userId: user.id,
            status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
          },
        },
        select: { id: true },
      }),
    ]);

    if (!isStorefrontVisibleProduct(product)) {
      return { success: false, message: "محصول موردنظر پیدا نشد." };
    }

    const existingReview = await prisma.productReview.findFirst({
      where: { productId: input.productId, userId: user.id },
      select: { id: true },
    });

    if (existingReview) {
      await prisma.productReview.update({
        where: { id: existingReview.id },
        data: {
          customerName: user.name ?? user.email ?? "کاربر Oilbar",
          title: input.title ?? null,
          rating: input.rating,
          comment: input.comment ?? null,
          isVerifiedPurchase: Boolean(verifiedPurchase),
        },
      });
    } else {
      await prisma.productReview.create({
        data: {
          productId: input.productId,
          userId: user.id,
          customerName: user.name ?? user.email ?? "کاربر Oilbar",
          title: input.title ?? null,
          rating: input.rating,
          comment: input.comment ?? null,
          isVerifiedPurchase: Boolean(verifiedPurchase),
        },
      });
    }

    const aggregate = await prisma.productReview.aggregate({
      where: { productId: input.productId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await prisma.product.update({
      where: { id: input.productId },
      data: {
        averageRating: aggregate._avg.rating != null ? Number(aggregate._avg.rating.toFixed(1)) : null,
        reviewCount: aggregate._count._all,
      },
    });

    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/products");
    revalidatePath("/account");
    revalidatePath("/admin");

    return {
      success: true,
      message: verifiedPurchase
        ? "نظر شما به عنوان خرید تاییدشده ثبت شد."
        : "نظر شما ثبت شد.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "ثبت نظر با خطا مواجه شد.",
    };
  }
}
