import assert from "node:assert/strict";
import test from "node:test";

import {
  CART_ACTIVE_WINDOW_MS,
  CHECKOUT_ACTIVE_WINDOW_MS,
  classifyCartActivity,
  getLatestCartActivity,
} from "../src/lib/cart-activity";

const now = new Date("2026-09-26T12:00:00.000Z");

test("classifies a recently viewed checkout as active", () => {
  assert.equal(classifyCartActivity({
    checkoutStartedAt: new Date(now.getTime() - 20 * 60_000),
    checkoutLastSeenAt: new Date(now.getTime() - CHECKOUT_ACTIVE_WINDOW_MS + 1_000),
  }, now), "CHECKOUT_ACTIVE");
});

test("classifies an expired checkout session as abandoned", () => {
  assert.equal(classifyCartActivity({
    checkoutStartedAt: new Date(now.getTime() - 45 * 60_000),
    checkoutLastSeenAt: new Date(now.getTime() - CHECKOUT_ACTIVE_WINDOW_MS - 1_000),
  }, now), "CHECKOUT_ABANDONED");
});

test("classifies a recently edited cart as active", () => {
  assert.equal(classifyCartActivity({
    latestItemUpdatedAt: new Date(now.getTime() - CART_ACTIVE_WINDOW_MS + 1_000),
  }, now), "CART_ACTIVE");
});

test("classifies an old cart as abandoned", () => {
  assert.equal(classifyCartActivity({
    lastCartSeenAt: new Date(now.getTime() - CART_ACTIVE_WINDOW_MS - 1_000),
    latestItemUpdatedAt: new Date(now.getTime() - 24 * 60 * 60_000),
  }, now), "CART_ABANDONED");
});

test("returns the latest known activity timestamp", () => {
  const latest = new Date("2026-09-26T11:55:00.000Z");
  assert.equal(getLatestCartActivity({
    checkoutStartedAt: new Date("2026-09-26T11:30:00.000Z"),
    checkoutLastSeenAt: latest,
    latestItemUpdatedAt: new Date("2026-09-26T11:50:00.000Z"),
  })?.toISOString(), latest.toISOString());
});
