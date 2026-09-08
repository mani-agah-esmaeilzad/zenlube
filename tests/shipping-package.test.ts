import assert from "node:assert/strict";
import test from "node:test";

import { ShippingDomainError } from "@/lib/shipping/errors";
import { buildShippingPackage } from "@/lib/shipping/package";
import type {
  ShippingPackageItemInput,
  ShippingPackageSettings,
} from "@/lib/shipping/types";

const settings: ShippingPackageSettings = {
  basePackagingWeightGrams: 100,
  extraPackagingWeightPerAdditionalItemGrams: 25,
  minimumPackageWeightGrams: 500,
  defaultLengthCm: 30,
  defaultWidthCm: 20,
  defaultHeightCm: 10,
};

function product(
  overrides: Partial<ShippingPackageItemInput> = {},
): ShippingPackageItemInput {
  return {
    productId: "product-1",
    quantity: 1,
    requiresShipping: true,
    weightGrams: 900,
    dimensionsMode: "DEFAULT",
    lengthCm: null,
    widthCm: null,
    heightCm: null,
    ...overrides,
  };
}

test("buildShippingPackage aggregates quantities, packaging, and conservative dimensions", () => {
  const result = buildShippingPackage([
    product({ quantity: 2 }),
    product({
      productId: "product-2",
      weightGrams: 400,
      dimensionsMode: "CUSTOM",
      lengthCm: 12.1,
      widthCm: 41,
      heightCm: 8.2,
    }),
  ], settings);

  assert.deepEqual(result, {
    itemCount: 3,
    lineCount: 2,
    contentWeightGrams: 2_200,
    packagingWeightGrams: 150,
    weightGrams: 2_350,
    lengthCm: 41,
    widthCm: 20,
    heightCm: 29,
  });
});

test("buildShippingPackage ignores non-physical lines and returns null without shipping", () => {
  const nonPhysical = product({
    productId: "service",
    requiresShipping: false,
    weightGrams: null,
    quantity: 2,
  });

  assert.equal(buildShippingPackage([nonPhysical], settings), null);
  assert.equal(buildShippingPackage([], settings), null);
});

test("buildShippingPackage enforces minimum weight conservatively", () => {
  const result = buildShippingPackage([
    product({ weightGrams: 100 }),
  ], settings);

  assert.equal(result?.weightGrams, 500);
  assert.equal(result?.packagingWeightGrams, 400);
});

test("buildShippingPackage rejects a physical product without weight", () => {
  assert.throws(
    () => buildShippingPackage([product({ weightGrams: null })], settings),
    (error) => error instanceof ShippingDomainError
      && error.code === "MISSING_PRODUCT_WEIGHT",
  );
});

test("buildShippingPackage rejects missing default or custom dimensions", () => {
  assert.throws(
    () => buildShippingPackage(
      [product()],
      { ...settings, defaultHeightCm: null },
    ),
    (error) => error instanceof ShippingDomainError
      && error.code === "MISSING_PRODUCT_DIMENSIONS",
  );

  assert.throws(
    () => buildShippingPackage([
      product({
        dimensionsMode: "CUSTOM",
        lengthCm: 20,
        widthCm: 10,
        heightCm: null,
      }),
    ], settings),
    (error) => error instanceof ShippingDomainError
      && error.code === "MISSING_PRODUCT_DIMENSIONS",
  );
});

test("buildShippingPackage rejects invalid quantities and fractional weights", () => {
  assert.throws(
    () => buildShippingPackage([product({ quantity: 0 })], settings),
    (error) => error instanceof ShippingDomainError
      && error.code === "INVALID_CART_QUANTITY",
  );
  assert.throws(
    () => buildShippingPackage([product({ weightGrams: 1.5 })], settings),
    (error) => error instanceof ShippingDomainError
      && error.code === "INVALID_PRODUCT_WEIGHT",
  );
});
