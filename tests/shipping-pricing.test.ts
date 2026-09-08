import assert from "node:assert/strict";
import test from "node:test";

import { ShippingDomainError } from "@/lib/shipping/errors";
import { calculateShippingPrice } from "@/lib/shipping/pricing";

test("calculateShippingPrice applies signed fixed and percentage adjustments in IRR", () => {
  assert.deepEqual(
    calculateShippingPrice(100_000, 900_000, {
      fixedAdjustmentRials: 10_000,
      percentAdjustment: -5,
      freeShippingThresholdRials: 1_000_000,
    }),
    {
      currency: "IRR",
      basePriceRials: 100_000,
      fixedAdjustmentRials: 10_000,
      percentAdjustmentRials: -5_000,
      adjustedPriceRials: 105_000,
      freeShippingApplied: false,
      freeShippingDiscountRials: 0,
      customerPriceRials: 105_000,
    },
  );
});

test("calculateShippingPrice applies the free-shipping threshold after adjustments", () => {
  const result = calculateShippingPrice(100_000, 1_000_000, {
    fixedAdjustmentRials: 20_000,
    percentAdjustment: 10,
    freeShippingThresholdRials: 1_000_000,
  });

  assert.equal(result.adjustedPriceRials, 130_000);
  assert.equal(result.freeShippingApplied, true);
  assert.equal(result.freeShippingDiscountRials, 130_000);
  assert.equal(result.customerPriceRials, 0);
});

test("calculateShippingPrice clamps an excessive discount to zero", () => {
  const result = calculateShippingPrice(50_000, 100_000, {
    fixedAdjustmentRials: -60_000,
    percentAdjustment: -10,
    freeShippingThresholdRials: null,
  });

  assert.equal(result.adjustedPriceRials, 0);
  assert.equal(result.customerPriceRials, 0);
  assert.equal(result.freeShippingApplied, false);
});

test("calculateShippingPrice rejects fractional or non-finite money settings", () => {
  assert.throws(
    () => calculateShippingPrice(1.5, 100, {
      fixedAdjustmentRials: 0,
      percentAdjustment: 0,
      freeShippingThresholdRials: null,
    }),
    (error) => error instanceof ShippingDomainError && error.code === "INVALID_MONEY",
  );

  assert.throws(
    () => calculateShippingPrice(100, 100, {
      fixedAdjustmentRials: 0,
      percentAdjustment: Number.NaN,
      freeShippingThresholdRials: null,
    }),
    (error) => error instanceof ShippingDomainError
      && error.code === "INVALID_PRICING_SETTINGS",
  );
});
