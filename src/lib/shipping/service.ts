import { createHash } from "node:crypto";

import { Prisma } from "@/generated/prisma";
import { calculateCouponDiscount, findActiveCouponByCode } from "@/lib/commerce";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { resolveProductPricing } from "@/lib/pricing";
import { normalizeIranPostalCode } from "@/lib/shipping/address";
import { createShippingFingerprint } from "@/lib/shipping/fingerprint";
import { normalizeShippingLocationName, resolveShippingLocation } from "@/lib/shipping/locations";
import { buildShippingPackage } from "@/lib/shipping/package";
import { calculateShippingPrice } from "@/lib/shipping/pricing";
import { inspectShippingQuoteSnapshot } from "@/lib/shipping/quote-validation";
import {
  getShippingProvider,
  ShippingProviderError,
} from "@/lib/shipping/providers";
import { resolveAmadastPackageType } from "@/lib/shipping/providers/amadast";
import { getShippingRolloutState, type ShippingRolloutMode } from "@/lib/shipping/rollout";
import type {
  NormalizedProviderQuote,
  ShippingPackage,
} from "@/lib/shipping/types";
import { isStorefrontVisibleProduct } from "@/lib/storefront-visibility";

export type ShippingDestinationInput = {
  provinceCode: string;
  cityCode: string;
  postalCode: string;
  address1: string;
  address2?: string | null;
};

export type ShippingQuotePublicOption = {
  id: string;
  carrierCode: string;
  carrierLabel: string;
  serviceCode: string;
  serviceLabel: string;
  customerPriceRials: number;
  currency: "IRR";
  isFree: boolean;
  estimatedDeliveryLabel: string | null;
};

export type ShippingQuotePublicResult = {
  quoteId: string;
  mode: ShippingRolloutMode;
  expiresAt: string;
  subtotalRials: number;
  discountRials: number;
  options: ShippingQuotePublicOption[];
  unavailableCarriers: string[];
};

/**
 * Final allowlist for the customer-facing quote response. Keep provider
 * metadata, warehouse origin and sender details outside this boundary.
 */
export function sanitizePublicShippingQuote(
  input: ShippingQuotePublicResult,
): ShippingQuotePublicResult {
  return {
    quoteId: input.quoteId,
    mode: input.mode,
    expiresAt: input.expiresAt,
    subtotalRials: input.subtotalRials,
    discountRials: input.discountRials,
    unavailableCarriers: [...input.unavailableCarriers],
    options: input.options.map((option) => ({
      id: option.id,
      carrierCode: option.carrierCode,
      carrierLabel: option.carrierLabel,
      serviceCode: option.serviceCode,
      serviceLabel: option.serviceLabel,
      customerPriceRials: option.customerPriceRials,
      currency: option.currency,
      isFree: option.isFree,
      estimatedDeliveryLabel: option.estimatedDeliveryLabel,
    })),
  };
}

const LEGACY_PROVIDER_KEY = "legacy-checkout-v1";
const LEGACY_SETTINGS_VERSION = "legacy-checkout-v1";
const LEGACY_QUOTE_TTL_SECONDS = 24 * 60 * 60;
export const MANUAL_SHIPPING_PROVIDER_KEY = "manual-mahex-cod-v1";
export const MANUAL_FREE_SHIPPING_THRESHOLD_RIALS = 100_000_000;
const MANUAL_SETTINGS_VERSION = "manual-mahex-cod-v1";

export const LEGACY_SHIPPING_OPTIONS = [
  {
    carrierCode: "LEGACY",
    carrierLabel: "ارسال فروشگاه",
    serviceCode: "STANDARD",
    serviceLabel: "ارسال استاندارد",
    customerPriceRials: 60_000,
    estimatedDeliveryLabel: "۳ تا ۵ روز کاری",
  },
  {
    carrierCode: "LEGACY",
    carrierLabel: "ارسال فروشگاه",
    serviceCode: "EXPRESS",
    serviceLabel: "ارسال سریع",
    customerPriceRials: 120_000,
    estimatedDeliveryLabel: "۱ تا ۲ روز کاری",
  },
  {
    carrierCode: "LEGACY",
    carrierLabel: "فروشگاه",
    serviceCode: "PICKUP",
    serviceLabel: "تحویل حضوری",
    customerPriceRials: 0,
    estimatedDeliveryLabel: "هماهنگی با پشتیبانی",
  },
] as const;

export class ShippingServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "ShippingServiceError";
  }
}

function integerMoney(value: Prisma.Decimal | number | string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new ShippingServiceError("INVALID_MONEY", "مبلغ سفارش برای محاسبه ارسال معتبر نیست.", 500);
  }
  return parsed;
}

export function shippingAddressHash(input: Pick<ShippingDestinationInput, "address1" | "address2">) {
  const normalized = [input.address1, input.address2 ?? ""]
    .map((part) => part.normalize("NFKC").replace(/\s+/g, " ").trim())
    .join("|");
  return createHash("sha256").update(normalized).digest("hex");
}

function buildLegacyShippingPackage(items: ReadonlyArray<{ quantity: number }>): ShippingPackage {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  return {
    itemCount,
    lineCount: items.length,
    contentWeightGrams: 0,
    packagingWeightGrams: 10,
    weightGrams: 10,
    lengthCm: 1,
    widthCm: 1,
    heightCm: 1,
  };
}

async function loadContext(userId: string, destination: ShippingDestinationInput, couponCode?: string | null) {
  const [settings, cart] = await Promise.all([
    prisma.shippingSettings.findUnique({ where: { id: "default" } }),
    prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { id: "asc" },
          include: { product: { include: { promotion: true } } },
        },
      },
    }),
  ]);
  const rollout = await getShippingRolloutState(settings);
  const provider = rollout.mode === "dynamic" ? getShippingProvider() : null;
  if (rollout.mode === "dynamic" && (!settings || !provider)) {
    throw new ShippingServiceError("INVALID_CONFIG", "تنظیمات ارسال آنلاین کامل نیست.", 503);
  }
  if (!cart?.items.length) throw new ShippingServiceError("EMPTY_CART", "سبد خرید خالی است.");

  const postalCode = normalizeIranPostalCode(destination.postalCode);
  if (!/^\d{10}$/.test(postalCode)) {
    throw new ShippingServiceError("INVALID_POSTAL_CODE", "کد پستی باید ۱۰ رقم باشد.");
  }

  const locations = rollout.mode === "dynamic"
    ? await resolveShippingLocation({
        provinceCode: destination.provinceCode,
        cityCode: destination.cityCode,
        providerKey: provider!.key,
      })
    : {
        province: {
          code: destination.provinceCode.trim(),
          name: normalizeShippingLocationName(destination.provinceCode),
        },
        city: {
          code: destination.cityCode.trim(),
          name: normalizeShippingLocationName(destination.cityCode),
        },
        provinceExternalId: 0,
        cityExternalId: 0,
      };
  if (!locations) throw new ShippingServiceError("INVALID_LOCATION", "استان یا شهر انتخاب‌شده معتبر نیست.");

  const origin = rollout.mode === "dynamic"
    ? await resolveShippingLocation({
        provinceCode: settings!.originProvinceCode!,
        cityCode: settings!.originCityCode!,
        providerKey: provider!.key,
      })
    : {
        province: { code: "legacy-origin", name: "فروشگاه" },
        city: { code: "legacy-origin", name: "فروشگاه" },
        provinceExternalId: 0,
        cityExternalId: 0,
      };
  if (!origin) throw new ShippingServiceError("ORIGIN_INVALID", "مبدا ارسال معتبر نیست.", 503);

  const now = new Date();
  const items = cart.items.map((item) => {
    if (!isStorefrontVisibleProduct(item.product)) {
      throw new ShippingServiceError("PRODUCT_UNAVAILABLE", "یکی از کالاهای سبد دیگر قابل خرید نیست.");
    }
    const unitPriceRials = integerMoney(resolveProductPricing(item.product, now).effectivePrice);
    if (unitPriceRials <= 0 || item.product.stock < item.quantity) {
      throw new ShippingServiceError("PRODUCT_UNAVAILABLE", "قیمت یا موجودی یکی از کالاهای سبد تغییر کرده است.");
    }
    return {
      cartItemId: item.id,
      quantity: item.quantity,
      product: item.product,
      unitPriceRials,
    };
  });
  const subtotalRials = items.reduce((sum, item) => sum + item.unitPriceRials * item.quantity, 0);
  if (!Number.isSafeInteger(subtotalRials)) throw new ShippingServiceError("INVALID_MONEY", "جمع سبد معتبر نیست.", 500);

  let discountRials = 0;
  let coupon: Awaited<ReturnType<typeof findActiveCouponByCode>> = null;
  const normalizedCoupon = couponCode?.trim().toUpperCase() || null;
  if (normalizedCoupon) {
    coupon = await findActiveCouponByCode(normalizedCoupon);
    if (!coupon) throw new ShippingServiceError("INVALID_COUPON", "کد تخفیف معتبر یا فعال نیست.");
    const calculation = calculateCouponDiscount(coupon, subtotalRials);
    if (!calculation.valid) throw new ShippingServiceError("INVALID_COUPON", calculation.message ?? "کد تخفیف قابل استفاده نیست.");
    discountRials = integerMoney(Math.round(calculation.discount));
  }
  const declaredValueRials = Math.max(0, subtotalRials - discountRials);

  const shippingPackage = rollout.mode === "dynamic"
    ? buildShippingPackage(items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        requiresShipping: item.product.requiresShipping,
        weightGrams: item.product.shippingWeightGrams,
        dimensionsMode: item.product.shippingDimensionsMode,
        lengthCm: item.product.shippingLengthCm,
        widthCm: item.product.shippingWidthCm,
        heightCm: item.product.shippingHeightCm,
      })), {
        basePackagingWeightGrams: settings!.basePackagingWeightGrams,
        extraPackagingWeightPerAdditionalItemGrams: settings!.extraPackagingWeightPerAdditionalItemGrams,
        minimumPackageWeightGrams: settings!.minimumPackageWeightGrams,
        defaultLengthCm: settings!.defaultLengthCm,
        defaultWidthCm: settings!.defaultWidthCm,
        defaultHeightCm: settings!.defaultHeightCm,
      })
    : buildLegacyShippingPackage(items);
  if (!shippingPackage) throw new ShippingServiceError("NO_SHIPPING_REQUIRED", "این سبد به ارسال فیزیکی نیاز ندارد.");

  const addressHash = shippingAddressHash(destination);
  const fingerprint = createShippingFingerprint({
    cartId: cart.id,
    cartVersion: cart.version,
    items: items.map((item) => ({
      productId: item.product.id,
      lineId: item.cartItemId,
      quantity: item.quantity,
      unitPriceRials: item.unitPriceRials,
      productVersion: item.product.updatedAt,
      requiresShipping: item.product.requiresShipping,
      weightGrams: item.product.shippingWeightGrams,
      dimensionsMode: item.product.shippingDimensionsMode,
      lengthCm: item.product.shippingLengthCm,
      widthCm: item.product.shippingWidthCm,
      heightCm: item.product.shippingHeightCm,
    })),
    destination: {
      provinceCode: destination.provinceCode,
      cityCode: destination.cityCode,
      postalCode,
      addressHash,
    },
    settingsVersion: rollout.mode === "dynamic"
      ? settings!.updatedAt
      : config.SHIPPING_FULFILLMENT_MODE === "manual" ? MANUAL_SETTINGS_VERSION : LEGACY_SETTINGS_VERSION,
    shippingPackage,
    pricingContext: { couponCode: normalizedCoupon, discountRials, declaredValueRials },
  });

  const restrictedCarriers = new Set(items.flatMap((item) => item.product.shippingRestrictedCarriers));
  const enabledCarriers = new Set(
    rollout.mode === "dynamic"
      ? settings!.enabledCarriers.filter((carrier) => !restrictedCarriers.has(carrier))
      : [],
  );

  return {
    provider,
    settings,
    rollout,
    cart,
    items,
    subtotalRials,
    discountRials,
    coupon,
    normalizedCoupon,
    declaredValueRials,
    shippingPackage,
    fingerprint,
    addressHash,
    postalCode,
    origin,
    destinationLocation: locations,
    enabledCarriers,
    restrictedCarriers,
  };
}

function publicResult(
  request: Prisma.ShippingQuoteRequestGetPayload<{ include: { options: true } }>,
  subtotalRials: number,
  discountRials: number,
  mode: ShippingRolloutMode,
): ShippingQuotePublicResult {
  const legacyOptionOrder = new Map<string, number>(
    LEGACY_SHIPPING_OPTIONS.map((option, index) => [option.serviceCode, index]),
  );
  const options = mode === "legacy"
    ? [...request.options].sort((left, right) =>
        (legacyOptionOrder.get(left.serviceCode) ?? Number.MAX_SAFE_INTEGER)
        - (legacyOptionOrder.get(right.serviceCode) ?? Number.MAX_SAFE_INTEGER))
    : request.options;
  return sanitizePublicShippingQuote({
    quoteId: request.id,
    mode,
    expiresAt: request.expiresAt.toISOString(),
    subtotalRials,
    discountRials,
    unavailableCarriers: [],
    options: options.map((option) => ({
      id: option.id,
      carrierCode: option.carrierCode,
      carrierLabel: option.carrierLabel,
      serviceCode: option.serviceCode,
      serviceLabel: option.serviceLabel,
      customerPriceRials: integerMoney(option.customerCost),
      currency: "IRR",
      isFree: option.isFree,
      estimatedDeliveryLabel: option.estimatedDeliveryLabel,
    })),
  });
}

async function createLegacyShippingQuote(
  userId: string,
  destination: ShippingDestinationInput,
  context: Awaited<ReturnType<typeof loadContext>>,
  now: Date,
) {
  const expiresAt = new Date(now.getTime() + LEGACY_QUOTE_TTL_SECONDS * 1000);
  const cacheBucket = String(Math.floor(now.getTime() / (LEGACY_QUOTE_TTL_SECONDS * 1000)));
  let created: Prisma.ShippingQuoteRequestGetPayload<{ include: { options: true } }>;
  try {
    created = await prisma.shippingQuoteRequest.create({
      data: {
        userId,
        cartId: context.cart.id,
        cartVersion: context.cart.version,
        providerKey: LEGACY_PROVIDER_KEY,
        fingerprint: context.fingerprint,
        cacheBucket,
        destinationProvinceCode: destination.provinceCode.trim(),
        destinationCityCode: destination.cityCode.trim(),
        destinationPostalCode: context.postalCode,
        destinationAddressHash: context.addressHash,
        declaredValue: new Prisma.Decimal(context.declaredValueRials),
        packageWeightGrams: context.shippingPackage.weightGrams,
        packageLengthCm: context.shippingPackage.lengthCm,
        packageWidthCm: context.shippingPackage.widthCm,
        packageHeightCm: context.shippingPackage.heightCm,
        packageTypeCode: "legacy",
        status: "READY",
        providerRequestId: null,
        quotedAt: now,
        expiresAt,
        providerErrors: Prisma.JsonNull,
        options: {
          create: LEGACY_SHIPPING_OPTIONS.map((option) => ({
            carrierCode: option.carrierCode,
            carrierLabel: option.carrierLabel,
            serviceCode: option.serviceCode,
            serviceLabel: option.serviceLabel,
            externalQuoteId: null,
            baseCost: new Prisma.Decimal(option.customerPriceRials),
            adjustmentAmount: new Prisma.Decimal(0),
            customerCost: new Prisma.Decimal(option.customerPriceRials),
            currency: "IRR",
            isFree: option.customerPriceRials === 0,
            estimatedDeliveryLabel: option.estimatedDeliveryLabel,
            estimatedMinDays: null,
            estimatedMaxDays: null,
            providerMetadata: { rollout: "legacy", source: "pre-provider-checkout" },
          })),
        },
      },
      include: { options: { orderBy: { createdAt: "asc" } } },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const raced = await prisma.shippingQuoteRequest.findUnique({
      where: { userId_fingerprint_cacheBucket: { userId, fingerprint: context.fingerprint, cacheBucket } },
      include: { options: { orderBy: { createdAt: "asc" } } },
    });
    if (!raced) throw error;
    created = raced;
  }
  return publicResult(created, context.subtotalRials, context.discountRials, "legacy");
}

async function createManualShippingQuote(
  userId: string,
  destination: ShippingDestinationInput,
  context: Awaited<ReturnType<typeof loadContext>>,
  now: Date,
) {
  const expiresAt = new Date(now.getTime() + LEGACY_QUOTE_TTL_SECONDS * 1000);
  const cacheBucket = String(Math.floor(now.getTime() / (LEGACY_QUOTE_TTL_SECONDS * 1000)));
  const isFree = context.subtotalRials >= MANUAL_FREE_SHIPPING_THRESHOLD_RIALS;
  const serviceLabel = isFree ? "ماهکس — ارسال رایگان" : "ماهکس — پرداخت در محل (پس‌کرایه)";
  const estimatedDeliveryLabel = isFree
    ? "ارسال برای خریدهای بالای ۱۰ میلیون تومان رایگان است."
    : "هزینه ارسال هنگام تحویل توسط ماهکس دریافت می‌شود.";
  let created: Prisma.ShippingQuoteRequestGetPayload<{ include: { options: true } }>;
  try {
    created = await prisma.shippingQuoteRequest.create({
      data: {
        userId,
        cartId: context.cart.id,
        cartVersion: context.cart.version,
        providerKey: MANUAL_SHIPPING_PROVIDER_KEY,
        fingerprint: context.fingerprint,
        cacheBucket,
        destinationProvinceCode: destination.provinceCode.trim(),
        destinationCityCode: destination.cityCode.trim(),
        destinationPostalCode: context.postalCode,
        destinationAddressHash: context.addressHash,
        declaredValue: new Prisma.Decimal(context.declaredValueRials),
        packageWeightGrams: context.shippingPackage.weightGrams,
        packageLengthCm: context.shippingPackage.lengthCm,
        packageWidthCm: context.shippingPackage.widthCm,
        packageHeightCm: context.shippingPackage.heightCm,
        packageTypeCode: "manual",
        status: "READY",
        providerRequestId: null,
        quotedAt: now,
        expiresAt,
        providerErrors: Prisma.JsonNull,
        options: {
          create: [{
            carrierCode: "MANUAL",
            carrierLabel: "ماهکس",
            serviceCode: "MAHEX_COD",
            serviceLabel,
            externalQuoteId: null,
            baseCost: new Prisma.Decimal(0),
            adjustmentAmount: new Prisma.Decimal(0),
            customerCost: new Prisma.Decimal(0),
            currency: "IRR",
            isFree: isFree,
            estimatedDeliveryLabel,
            estimatedMinDays: null,
            estimatedMaxDays: null,
            providerMetadata: { rollout: "manual", source: "mahex-cod-display-only", freeThresholdRials: MANUAL_FREE_SHIPPING_THRESHOLD_RIALS },
          }],
        },
      },
      include: { options: { orderBy: { createdAt: "asc" } } },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const raced = await prisma.shippingQuoteRequest.findUnique({
      where: { userId_fingerprint_cacheBucket: { userId, fingerprint: context.fingerprint, cacheBucket } },
      include: { options: { orderBy: { createdAt: "asc" } } },
    });
    if (!raced) throw error;
    created = raced;
  }
  return publicResult(created, context.subtotalRials, context.discountRials, "legacy");
}

export async function requestShippingQuote(
  userId: string,
  destination: ShippingDestinationInput,
  couponCode?: string | null,
): Promise<ShippingQuotePublicResult> {
  const context = await loadContext(userId, destination, couponCode);
  const now = new Date();
  const cached = await prisma.shippingQuoteRequest.findFirst({
    where: {
      userId,
      cartId: context.cart.id,
      fingerprint: context.fingerprint,
      expiresAt: { gt: now },
      status: { in: ["READY", "PARTIAL"] },
    },
    include: { options: { orderBy: { customerCost: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  if (cached?.options.length) {
    return publicResult(cached, context.subtotalRials, context.discountRials, context.rollout.mode);
  }
  if (config.SHIPPING_FULFILLMENT_MODE === "manual") {
    return createManualShippingQuote(userId, destination, context, now);
  }
  if (context.rollout.mode === "legacy") {
    return createLegacyShippingQuote(userId, destination, context, now);
  }
  if (!context.provider || !context.settings) {
    throw new ShippingServiceError("INVALID_CONFIG", "تنظیمات ارسال آنلاین کامل نیست.", 503);
  }
  const provider = context.provider;
  const settings = context.settings;

  if (context.enabledCarriers.size === 0) {
    throw new ShippingServiceError("NO_CARRIER_AVAILABLE", "برای کالاهای این سبد روش ارسال فعالی وجود ندارد.", 409);
  }

  let providerOptions: NormalizedProviderQuote[] = [];
  let providerError: ShippingProviderError | null = null;
  try {
    providerOptions = await provider.quote({
      originExternalCityId: context.origin.cityExternalId,
      destinationExternalCityId: context.destinationLocation.cityExternalId,
      weightGrams: context.shippingPackage.weightGrams,
      declaredValueRials: Math.max(10_000, context.declaredValueRials),
      packageType: resolveAmadastPackageType(context.shippingPackage),
      carrierCodes: [...context.enabledCarriers] as Array<"POST" | "TIPAX">,
    }, settings.providerTimeoutMs);
  } catch (error) {
    providerError = error instanceof ShippingProviderError
      ? error
      : new ShippingProviderError("UNKNOWN", "خطا در دریافت نرخ ارسال.");
    logger.warn("Shipping quote provider failed", {
      provider: provider.key,
      code: providerError.code,
      retryable: providerError.retryable,
    });
  }

  const allowedOptions = providerOptions.filter((option) => context.enabledCarriers.has(option.carrierCode));
  if (!allowedOptions.length && providerError) {
    throw new ShippingServiceError(providerError.code, providerError.message, 503, providerError.retryable);
  }

  const expiresAt = new Date(now.getTime() + settings.quoteTtlSeconds * 1000);
  const cacheBucket = String(Math.floor(now.getTime() / (settings.quoteTtlSeconds * 1000)));
  const providerRequestId = providerOptions.find((option) => option.providerRequestId)?.providerRequestId ?? null;
  let created: Prisma.ShippingQuoteRequestGetPayload<{ include: { options: true } }>;
  try {
    created = await prisma.shippingQuoteRequest.create({
      data: {
      userId,
      cartId: context.cart.id,
      cartVersion: context.cart.version,
      providerKey: provider.key,
      fingerprint: context.fingerprint,
      cacheBucket,
      destinationProvinceCode: destination.provinceCode,
      destinationCityCode: destination.cityCode,
      destinationPostalCode: context.postalCode,
      destinationAddressHash: context.addressHash,
      declaredValue: new Prisma.Decimal(context.declaredValueRials),
      packageWeightGrams: context.shippingPackage.weightGrams,
      packageLengthCm: context.shippingPackage.lengthCm,
      packageWidthCm: context.shippingPackage.widthCm,
      packageHeightCm: context.shippingPackage.heightCm,
      packageTypeCode: String(resolveAmadastPackageType(context.shippingPackage)),
      status: allowedOptions.length ? (providerError ? "PARTIAL" : "READY") : "FAILED",
      providerRequestId,
      quotedAt: now,
      expiresAt,
      providerErrors: providerError ? { code: providerError.code, retryable: providerError.retryable } : Prisma.JsonNull,
      options: {
        create: allowedOptions.map((option) => {
          const price = calculateShippingPrice(option.basePriceRials, context.declaredValueRials, {
            fixedAdjustmentRials: integerMoney(settings.adjustmentFixedRials),
            percentAdjustment: Number(settings.adjustmentPercent),
            freeShippingThresholdRials: settings.freeShippingEnabled && settings.freeShippingThresholdRials != null
              ? integerMoney(settings.freeShippingThresholdRials)
              : null,
          });
          return {
            carrierCode: option.carrierCode,
            carrierLabel: option.carrierLabel,
            serviceCode: option.serviceCode,
            serviceLabel: option.serviceLabel,
            externalQuoteId: option.providerRequestId,
            baseCost: new Prisma.Decimal(price.basePriceRials),
            adjustmentAmount: new Prisma.Decimal(price.adjustedPriceRials - price.basePriceRials),
            customerCost: new Prisma.Decimal(price.customerPriceRials),
            currency: "IRR",
            isFree: price.customerPriceRials === 0,
            estimatedDeliveryLabel: option.estimatedDeliveryLabel,
            estimatedMinDays: option.estimatedMinDays,
            estimatedMaxDays: option.estimatedMaxDays,
            providerMetadata: option.metadata ? { ...option.metadata } : Prisma.JsonNull,
          };
        }),
      },
      },
      include: { options: { orderBy: { customerCost: "asc" } } },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const raced = await prisma.shippingQuoteRequest.findUnique({
      where: { userId_fingerprint_cacheBucket: { userId, fingerprint: context.fingerprint, cacheBucket } },
      include: { options: { orderBy: { customerCost: "asc" } } },
    });
    if (!raced) throw error;
    created = raced;
  }

  const unavailableCarriers = settings.enabledCarriers.filter((carrier) =>
    context.restrictedCarriers.has(carrier) || !allowedOptions.some((option) => option.carrierCode === carrier));
  return { ...publicResult(created, context.subtotalRials, context.discountRials, "dynamic"), unavailableCarriers };
}

export async function validateShippingSelection(input: {
  userId: string;
  optionId: string;
  orderId?: string;
  destination: ShippingDestinationInput;
  couponCode?: string | null;
}) {
  const option = await prisma.shippingQuoteOption.findUnique({
    where: { id: input.optionId },
    include: { request: true, selectedByOrder: { select: { id: true, userId: true } } },
  });
  if (!option || option.request.userId !== input.userId) {
    throw new ShippingServiceError("QUOTE_NOT_FOUND", "روش ارسال انتخاب‌شده معتبر نیست.");
  }
  const snapshot = {
    ownerUserId: option.request.userId,
    selectedOrderId: option.selectedByOrder?.id,
    selectedOrderUserId: option.selectedByOrder?.userId,
    status: option.request.status,
    currency: option.currency,
    expiresAt: option.request.expiresAt,
    fingerprint: option.request.fingerprint,
    cartId: option.request.cartId,
  };
  const initialValidation = inspectShippingQuoteSnapshot(snapshot, { userId: input.userId, orderId: input.orderId });
  if (!initialValidation.valid) throw new ShippingServiceError(initialValidation.code, initialValidation.message, initialValidation.retryable ? 409 : 400, initialValidation.retryable);
  const context = await loadContext(input.userId, input.destination, input.couponCode);
  const expectedProviderKey = config.SHIPPING_FULFILLMENT_MODE === "manual"
    ? MANUAL_SHIPPING_PROVIDER_KEY
    : context.rollout.mode === "legacy"
      ? LEGACY_PROVIDER_KEY
    : context.provider?.key;
  if (!expectedProviderKey || option.request.providerKey !== expectedProviderKey) {
    throw new ShippingServiceError(
      "QUOTE_STALE",
      "روش ارسال فروشگاه تغییر کرده است؛ هزینه ارسال را دوباره محاسبه کنید.",
      409,
      true,
    );
  }
  const currentValidation = inspectShippingQuoteSnapshot(snapshot, { userId: input.userId, orderId: input.orderId, fingerprint: context.fingerprint, cartId: context.cart.id });
  if (!currentValidation.valid) throw new ShippingServiceError(currentValidation.code, currentValidation.message, currentValidation.retryable ? 409 : 400, currentValidation.retryable);
  return { option, context };
}
