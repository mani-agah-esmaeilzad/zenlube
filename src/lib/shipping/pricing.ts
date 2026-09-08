import {
  SHIPPING_ERROR_CODES,
  ShippingDomainError,
} from "@/lib/shipping/errors";
import {
  SHIPPING_CURRENCY,
  type ShippingPriceBreakdown,
  type ShippingPricingSettings,
} from "@/lib/shipping/types";

function assertMoney(value: number, field: string, options: { signed?: boolean } = {}) {
  if (
    !Number.isSafeInteger(value)
    || (!options.signed && value < 0)
  ) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_MONEY,
      `${field} must be ${options.signed ? "a" : "a non-negative"} safe integer in IRR`,
      { field },
    );
  }
}

/** Applies store pricing rules to an authoritative provider price in integer IRR. */
export function calculateShippingPrice(
  basePriceRials: number,
  cartSubtotalRials: number,
  settings: ShippingPricingSettings,
): ShippingPriceBreakdown {
  assertMoney(basePriceRials, "basePriceRials");
  assertMoney(cartSubtotalRials, "cartSubtotalRials");
  assertMoney(settings.fixedAdjustmentRials, "fixedAdjustmentRials", { signed: true });

  if (!Number.isFinite(settings.percentAdjustment)) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_PRICING_SETTINGS,
      "percentAdjustment must be finite",
      { field: "percentAdjustment" },
    );
  }
  if (settings.freeShippingThresholdRials != null) {
    assertMoney(settings.freeShippingThresholdRials, "freeShippingThresholdRials");
  }

  const percentAdjustmentRials = Math.round(
    basePriceRials * settings.percentAdjustment / 100,
  );
  if (!Number.isSafeInteger(percentAdjustmentRials)) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_PRICING_SETTINGS,
      "Percentage adjustment exceeds the safe integer range",
      { field: "percentAdjustment" },
    );
  }

  const unboundedAdjustedPrice = basePriceRials
    + settings.fixedAdjustmentRials
    + percentAdjustmentRials;
  if (!Number.isSafeInteger(unboundedAdjustedPrice)) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_PRICING_SETTINGS,
      "Adjusted shipping price exceeds the safe integer range",
    );
  }

  const adjustedPriceRials = Math.max(0, unboundedAdjustedPrice);
  const freeShippingApplied = settings.freeShippingThresholdRials != null
    && cartSubtotalRials >= settings.freeShippingThresholdRials;
  const customerPriceRials = freeShippingApplied ? 0 : adjustedPriceRials;

  return {
    currency: SHIPPING_CURRENCY,
    basePriceRials,
    fixedAdjustmentRials: settings.fixedAdjustmentRials,
    percentAdjustmentRials,
    adjustedPriceRials,
    freeShippingApplied,
    freeShippingDiscountRials: freeShippingApplied ? adjustedPriceRials : 0,
    customerPriceRials,
  };
}
