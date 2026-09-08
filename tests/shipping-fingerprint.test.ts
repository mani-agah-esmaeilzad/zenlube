import assert from "node:assert/strict";
import test from "node:test";

import {
  createShippingFingerprint,
  stableCanonicalJson,
} from "@/lib/shipping/fingerprint";
import type {
  ShippingFingerprintInput,
  ShippingFingerprintItemInput,
} from "@/lib/shipping/types";

const firstItem: ShippingFingerprintItemInput = {
  productId: "product-a",
  lineId: "line-a",
  quantity: 2,
  unitPriceRials: 2_000_000,
  productVersion: "2026-09-03T09:00:00.000Z",
  requiresShipping: true,
  weightGrams: 1_000,
  dimensionsMode: "CUSTOM",
  lengthCm: 30,
  widthCm: 20,
  heightCm: 10,
};

const secondItem: ShippingFingerprintItemInput = {
  productId: "product-b",
  lineId: "line-b",
  quantity: 1,
  unitPriceRials: 500_000,
  productVersion: 7,
  requiresShipping: true,
  weightGrams: 250,
  dimensionsMode: "DEFAULT",
  lengthCm: null,
  widthCm: null,
  heightCm: null,
};

function input(overrides: Partial<ShippingFingerprintInput> = {}): ShippingFingerprintInput {
  return {
    cartId: "cart-1",
    cartVersion: new Date("2026-09-03T10:00:00.000Z"),
    items: [firstItem, secondItem],
    destination: {
      provinceCode: "08",
      cityCode: "0801",
      postalCode: "12345-67890",
    },
    settingsVersion: "3",
    shippingPackage: {
      itemCount: 3,
      lineCount: 2,
      contentWeightGrams: 2_250,
      packagingWeightGrams: 150,
      weightGrams: 2_400,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 30,
    },
    ...overrides,
  };
}

test("createShippingFingerprint is independent of item and object-key order", () => {
  const forward = createShippingFingerprint(input());
  const reversed = createShippingFingerprint(input({ items: [secondItem, firstItem] }));

  assert.match(forward, /^[a-f0-9]{64}$/);
  assert.equal(reversed, forward);
  assert.equal(
    stableCanonicalJson({ z: 1, a: { y: 2, x: 3 } }),
    stableCanonicalJson({ a: { x: 3, y: 2 }, z: 1 }),
  );
});

test("createShippingFingerprint normalizes destination digits and postal formatting", () => {
  const ascii = createShippingFingerprint(input());
  const localized = createShippingFingerprint(input({
    destination: {
      provinceCode: "۰۸",
      cityCode: "۰۸۰۱",
      postalCode: "۱۲۳۴۵ ۶۷۸۹۰",
    },
  }));

  assert.equal(localized, ascii);
});

test("createShippingFingerprint changes with every authoritative quote dependency", () => {
  const baseline = createShippingFingerprint(input());
  const mutations: ShippingFingerprintInput[] = [
    input({ cartVersion: "next-cart-version" }),
    input({ settingsVersion: "next-settings-version" }),
    input({ destination: { ...input().destination, cityCode: "0802" } }),
    input({
      items: [{ ...firstItem, unitPriceRials: firstItem.unitPriceRials + 1 }, secondItem],
    }),
    input({
      items: [{ ...firstItem, weightGrams: (firstItem.weightGrams ?? 0) + 1 }, secondItem],
    }),
    input({
      shippingPackage: { ...input().shippingPackage!, weightGrams: 2_401 },
    }),
  ];

  for (const changed of mutations) {
    assert.notEqual(createShippingFingerprint(changed), baseline);
  }
});
