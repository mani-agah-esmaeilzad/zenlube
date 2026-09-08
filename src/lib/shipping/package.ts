import {
  SHIPPING_ERROR_CODES,
  ShippingDomainError,
} from "@/lib/shipping/errors";
import type {
  ShippingDimensions,
  ShippingPackage,
  ShippingPackageItemInput,
  ShippingPackageSettings,
} from "@/lib/shipping/types";

function assertNonNegativeInteger(
  value: number,
  field: keyof Pick<
    ShippingPackageSettings,
    | "basePackagingWeightGrams"
    | "extraPackagingWeightPerAdditionalItemGrams"
    | "minimumPackageWeightGrams"
  >,
) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_PACKAGE_SETTINGS,
      `${field} must be a non-negative safe integer`,
      { field },
    );
  }
}

function normalizeDimension(value: number | null) {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return Math.ceil(value);
}

function normalizeDimensions(
  dimensions: ShippingDimensions | {
    lengthCm: number | null;
    widthCm: number | null;
    heightCm: number | null;
  },
) {
  const lengthCm = normalizeDimension(dimensions.lengthCm);
  const widthCm = normalizeDimension(dimensions.widthCm);
  const heightCm = normalizeDimension(dimensions.heightCm);

  if (lengthCm == null || widthCm == null || heightCm == null) return null;

  // Normalize orientation so equivalent input rotations aggregate identically.
  const [length, width, height] = [lengthCm, widthCm, heightCm].sort((a, b) => b - a);
  return { lengthCm: length, widthCm: width, heightCm: height };
}

function resolveItemDimensions(
  item: ShippingPackageItemInput,
  settings: ShippingPackageSettings,
) {
  const source = item.dimensionsMode === "CUSTOM"
    ? {
        lengthCm: item.lengthCm,
        widthCm: item.widthCm,
        heightCm: item.heightCm,
      }
    : {
        lengthCm: settings.defaultLengthCm,
        widthCm: settings.defaultWidthCm,
        heightCm: settings.defaultHeightCm,
      };

  const dimensions = normalizeDimensions(source);
  if (dimensions) return dimensions;

  const isMissing = Object.values(source).some((value) => value == null);
  throw new ShippingDomainError(
    isMissing
      ? SHIPPING_ERROR_CODES.MISSING_PRODUCT_DIMENSIONS
      : SHIPPING_ERROR_CODES.INVALID_PRODUCT_DIMENSIONS,
    item.dimensionsMode === "CUSTOM"
      ? "Physical product requires complete custom shipping dimensions"
      : "Physical product requires usable default shipping dimensions",
    { productId: item.productId, dimensionsMode: item.dimensionsMode },
  );
}

/**
 * Builds one conservative package for the shippable part of a cart.
 *
 * Items are orientation-normalized, then placed along the shortest axis. This
 * deliberately produces a deterministic outer box that never has less volume
 * than the sum of the individual normalized item boxes. Returns `null` for a
 * cart containing no physical items.
 */
export function buildShippingPackage(
  items: readonly ShippingPackageItemInput[],
  settings: ShippingPackageSettings,
): ShippingPackage | null {
  assertNonNegativeInteger(settings.basePackagingWeightGrams, "basePackagingWeightGrams");
  assertNonNegativeInteger(
    settings.extraPackagingWeightPerAdditionalItemGrams,
    "extraPackagingWeightPerAdditionalItemGrams",
  );
  assertNonNegativeInteger(settings.minimumPackageWeightGrams, "minimumPackageWeightGrams");

  let itemCount = 0;
  let lineCount = 0;
  let contentWeightGrams = 0;
  let lengthCm = 0;
  let widthCm = 0;
  let heightCm = 0;

  for (const item of items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new ShippingDomainError(
        SHIPPING_ERROR_CODES.INVALID_CART_QUANTITY,
        "Shipping cart item quantity must be a positive safe integer",
        { productId: item.productId },
      );
    }

    if (!item.requiresShipping) continue;

    if (item.weightGrams == null) {
      throw new ShippingDomainError(
        SHIPPING_ERROR_CODES.MISSING_PRODUCT_WEIGHT,
        "Physical product requires a shipping weight",
        { productId: item.productId },
      );
    }
    if (!Number.isSafeInteger(item.weightGrams) || item.weightGrams <= 0) {
      throw new ShippingDomainError(
        SHIPPING_ERROR_CODES.INVALID_PRODUCT_WEIGHT,
        "Physical product shipping weight must be a positive safe integer",
        { productId: item.productId },
      );
    }

    const dimensions = resolveItemDimensions(item, settings);
    const lineWeight = item.weightGrams * item.quantity;
    if (!Number.isSafeInteger(lineWeight)) {
      throw new ShippingDomainError(
        SHIPPING_ERROR_CODES.INVALID_PRODUCT_WEIGHT,
        "Physical product total shipping weight exceeds the safe integer range",
        { productId: item.productId },
      );
    }

    itemCount += item.quantity;
    lineCount += 1;
    contentWeightGrams += lineWeight;
    lengthCm = Math.max(lengthCm, dimensions.lengthCm);
    widthCm = Math.max(widthCm, dimensions.widthCm);
    heightCm += dimensions.heightCm * item.quantity;

    if (
      !Number.isSafeInteger(itemCount)
      || !Number.isSafeInteger(contentWeightGrams)
      || !Number.isSafeInteger(heightCm)
    ) {
      throw new ShippingDomainError(
        SHIPPING_ERROR_CODES.INVALID_INPUT,
        "Aggregated shipping package exceeds the safe numeric range",
      );
    }
  }

  if (itemCount === 0) return null;

  const configuredPackagingWeight = settings.basePackagingWeightGrams
    + settings.extraPackagingWeightPerAdditionalItemGrams * Math.max(0, itemCount - 1);
  const weightBeforeMinimum = contentWeightGrams + configuredPackagingWeight;
  const weightGrams = Math.max(settings.minimumPackageWeightGrams, weightBeforeMinimum);

  if (!Number.isSafeInteger(configuredPackagingWeight) || !Number.isSafeInteger(weightGrams)) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_PACKAGE_SETTINGS,
      "Aggregated packaging weight exceeds the safe integer range",
    );
  }

  return {
    itemCount,
    lineCount,
    contentWeightGrams,
    packagingWeightGrams: weightGrams - contentWeightGrams,
    weightGrams,
    lengthCm,
    widthCm,
    heightCm,
  };
}
