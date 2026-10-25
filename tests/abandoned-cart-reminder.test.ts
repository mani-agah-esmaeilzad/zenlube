import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAbandonedCartReminderMessage,
  isAbandonedCartReminderEligible,
} from "@/lib/abandoned-cart-reminder";

const now = new Date("2026-09-26T12:00:00.000Z");

function eligibleInput(overrides: Record<string, unknown> = {}) {
  return {
    status: "CART_ABANDONED",
    lastActivityAt: new Date(now.getTime() - 5 * 60_000),
    hasPhone: true,
    hasAvailableItems: true,
    now,
    ...overrides,
  };
}

test("cart reminder does not require a minimum waiting period and skips completed purchases", () => {
  assert.equal(isAbandonedCartReminderEligible(eligibleInput()), true);
  assert.equal(isAbandonedCartReminderEligible(eligibleInput({ status: "CART_ACTIVE" })), true);
  assert.equal(isAbandonedCartReminderEligible(eligibleInput({ status: "CHECKOUT_ACTIVE" })), true);
  assert.equal(isAbandonedCartReminderEligible(eligibleInput({ lastActivityAt: now })), true);
  assert.equal(isAbandonedCartReminderEligible(eligibleInput({ latestOrderAt: now })), false);
  assert.equal(isAbandonedCartReminderEligible(eligibleInput({ hasPhone: false })), false);
  assert.equal(isAbandonedCartReminderEligible(eligibleInput({ hasAvailableItems: false })), false);
  assert.equal(isAbandonedCartReminderEligible(eligibleInput({ status: "INVALID" })), false);
});

test("abandoned-cart reminder starts with a personalized name and links back to cart", () => {
  assert.equal(
    buildAbandonedCartReminderMessage("مانی آگاه", "https://www.oilbar.ir/cart"),
    "مانی عزیز، سبد خریدت در اویل‌بار هنوز منتظرته. اگر هنوز قصد خرید داری، از اینجا ادامه بده: https://www.oilbar.ir/cart",
  );
  assert.match(buildAbandonedCartReminderMessage(null, "https://www.oilbar.ir/cart"), /^همراه عزیز/);
});
