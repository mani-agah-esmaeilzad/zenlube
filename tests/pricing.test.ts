import assert from "node:assert/strict";
import test from "node:test";

import { isBuyableProduct, isPromotionActive, resolveProductPricing } from "@/lib/pricing";

const now = new Date("2026-09-01T12:00:00.000Z");

test("resolveProductPricing applies only a valid active discount", () => {
  const pricing = resolveProductPricing({
    price: 2_000_000,
    promotion: {
      isActive: true,
      kind: "SALE",
      label: "فروش شهریور",
      specialPrice: 1_700_000,
      startsAt: "2026-08-31T00:00:00.000Z",
      endsAt: "2026-09-02T00:00:00.000Z",
    },
  }, now);

  assert.equal(pricing.basePrice, 2_000_000);
  assert.equal(pricing.effectivePrice, 1_700_000);
  assert.equal(pricing.hasDiscount, true);
  assert.equal(pricing.label, "فروش شهریور");
});

test("resolveProductPricing ignores expired, zero, or non-discount prices", () => {
  assert.equal(resolveProductPricing({ price: 2_000_000, promotion: { isActive: true, specialPrice: 1_000_000, endsAt: "2026-08-30T00:00:00Z" } }, now).effectivePrice, 2_000_000);
  assert.equal(resolveProductPricing({ price: 2_000_000, promotion: { isActive: true, specialPrice: 2_100_000 } }, now).effectivePrice, 2_000_000);
  assert.equal(resolveProductPricing({ price: 0, promotion: { isActive: true, specialPrice: 100_000 } }, now).effectivePrice, 0);
});

test("promotion boundaries are inclusive and buyability requires stock and price", () => {
  assert.equal(isPromotionActive({ isActive: true, startsAt: now, endsAt: now }, now), true);
  assert.equal(isBuyableProduct({ price: 100_000, stock: 1 }, now), true);
  assert.equal(isBuyableProduct({ price: 100_000, stock: 0 }, now), false);
  assert.equal(isBuyableProduct({ price: 0, stock: 10 }, now), false);
});
