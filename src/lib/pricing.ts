import type { PromotionKind } from "@/generated/prisma";

export type DecimalLike = number | string | { toString(): string };

export type ProductPromotionLike = {
  isActive: boolean;
  kind?: PromotionKind | "SALE" | "OCTANE" | "RACING_FUEL";
  label?: string | null;
  specialPrice?: DecimalLike | null;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
} | null;

export type ProductPricingInput = {
  price: DecimalLike;
  promotion?: ProductPromotionLike;
};

export const promotionKindLabels: Record<"SALE" | "OCTANE" | "RACING_FUEL", string> = {
  SALE: "فروش ویژه",
  OCTANE: "اکتان و مکمل سوخت",
  RACING_FUEL: "بنزین مسابقه‌ای",
};

function toFiniteNumber(value: DecimalLike | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toTimestamp(value: Date | string | null | undefined) {
  if (!value) return null;
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isPromotionActive(promotion: ProductPromotionLike, now = new Date()) {
  if (!promotion?.isActive) return false;

  const nowTimestamp = now.getTime();
  const startsAt = toTimestamp(promotion.startsAt);
  const endsAt = toTimestamp(promotion.endsAt);

  if (startsAt != null && nowTimestamp < startsAt) return false;
  if (endsAt != null && nowTimestamp > endsAt) return false;
  return true;
}

export function resolveProductPricing(product: ProductPricingInput, now = new Date()) {
  const basePrice = Math.max(0, toFiniteNumber(product.price));
  const promotionActive = isPromotionActive(product.promotion ?? null, now);
  const specialPrice = Math.max(0, toFiniteNumber(product.promotion?.specialPrice));
  const hasDiscount = promotionActive && basePrice > 0 && specialPrice > 0 && specialPrice < basePrice;
  const kind = product.promotion?.kind ?? "SALE";

  return {
    basePrice,
    effectivePrice: hasDiscount ? specialPrice : basePrice,
    hasDiscount,
    promotionActive,
    kind,
    label: product.promotion?.label?.trim() || promotionKindLabels[kind],
  } as const;
}

export function isBuyableProduct(product: ProductPricingInput & { stock: number }, now = new Date()) {
  return product.stock > 0 && resolveProductPricing(product, now).effectivePrice > 0;
}
