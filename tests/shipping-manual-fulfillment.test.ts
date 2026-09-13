import assert from "node:assert/strict";
import test from "node:test";

import { isOrderHandedToCarrier, manualShippingStatusLabel } from "@/lib/shipping/manual-fulfillment";

test("manual fulfillment derives the customer shipping state from the order", () => {
  assert.equal(manualShippingStatusLabel("PENDING"), "پس از پرداخت");
  assert.equal(manualShippingStatusLabel("PAID"), "پرداخت تأیید شده");
  assert.equal(manualShippingStatusLabel("PREPARING"), "در حال آماده‌سازی");
  assert.equal(manualShippingStatusLabel("SHIPPED"), "تحویل شرکت حمل");
  assert.equal(manualShippingStatusLabel("DELIVERED"), "تحویل‌شده");
  assert.equal(isOrderHandedToCarrier("PAID"), false);
  assert.equal(isOrderHandedToCarrier("SHIPPED"), true);
  assert.equal(isOrderHandedToCarrier("DELIVERED"), true);
});
