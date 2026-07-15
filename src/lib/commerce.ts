import { Prisma } from "@/generated/prisma";
import type { DiscountType } from "@/generated/prisma";
import prisma from "@/lib/prisma";

type CouponLike = {
  id: string;
  code: string;
  title: string;
  discountType: DiscountType;
  amount: Prisma.Decimal | number;
  minOrderAmount: Prisma.Decimal | number | null;
  maxDiscountAmount: Prisma.Decimal | number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
};

export function getShippingEstimateLabel(method: "STANDARD" | "EXPRESS" | "PICKUP") {
  if (method === "EXPRESS") return "تحویل تقریبی ۱ تا ۲ روز کاری";
  if (method === "PICKUP") return "تحویل حضوری با هماهنگی پشتیبانی";
  return "تحویل تقریبی ۳ تا ۵ روز کاری";
}

export function calculateCouponDiscount(coupon: CouponLike, subtotal: number) {
  const amount = Number(coupon.amount);
  const minOrderAmount = coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : null;
  const maxDiscountAmount = coupon.maxDiscountAmount != null ? Number(coupon.maxDiscountAmount) : null;

  if (minOrderAmount != null && subtotal < minOrderAmount) {
    return {
      valid: false as const,
      discount: 0,
      message: `حداقل مبلغ سفارش برای این کد ${new Intl.NumberFormat("fa-IR").format(minOrderAmount)} تومان است.`,
    };
  }

  const rawDiscount = coupon.discountType === "PERCENTAGE"
    ? subtotal * (amount / 100)
    : amount;

  const discount = Math.max(
    0,
    Math.min(
      subtotal,
      maxDiscountAmount != null ? Math.min(rawDiscount, maxDiscountAmount) : rawDiscount,
    ),
  );

  return { valid: true as const, discount, message: null };
}

export async function findActiveCouponByCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return null;

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon || !coupon.isActive) {
    return null;
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return null;
  if (coupon.endsAt && coupon.endsAt < now) return null;
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return null;

  return coupon;
}

export async function appendOrderStatusEvent(
  tx: Prisma.TransactionClient,
  input: {
    orderId: string;
    status: string;
    title: string;
    detail?: string | null;
  },
) {
  await tx.orderStatusEvent.create({
    data: {
      orderId: input.orderId,
      status: input.status,
      title: input.title,
      detail: input.detail ?? null,
    },
  });
}
