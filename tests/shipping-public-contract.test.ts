import assert from "node:assert/strict";
import test from "node:test";

import {
  sanitizePublicShippingQuote,
  type ShippingQuotePublicResult,
} from "@/lib/shipping/service";

test("customer shipping quote allowlist excludes origin, sender and provider metadata", () => {
  const unsafeInternalQuote = {
    quoteId: "quote-1",
    mode: "dynamic",
    expiresAt: "2030-01-01T00:10:00.000Z",
    subtotalRials: 1_000_000,
    discountRials: 0,
    unavailableCarriers: [],
    originAddress: "private-origin-address",
    originPostalCode: "1111111111",
    senderName: "private-sender",
    senderMobile: "+989111111111",
    options: [{
      id: "option-1",
      carrierCode: "POST",
      carrierLabel: "پست",
      serviceCode: "post-pishtaz",
      serviceLabel: "پست پیشتاز",
      customerPriceRials: 250_000,
      currency: "IRR",
      isFree: false,
      estimatedDeliveryLabel: "۳ تا ۵ روز کاری",
      providerMetadata: { privateOriginId: 86 },
    }],
  } as unknown as ShippingQuotePublicResult & Record<string, unknown>;

  const payload = sanitizePublicShippingQuote(unsafeInternalQuote);
  const serialized = JSON.stringify(payload);

  assert.deepEqual(Object.keys(payload).sort(), [
    "discountRials",
    "expiresAt",
    "mode",
    "options",
    "quoteId",
    "subtotalRials",
    "unavailableCarriers",
  ]);
  assert.deepEqual(Object.keys(payload.options[0]).sort(), [
    "carrierCode",
    "carrierLabel",
    "currency",
    "customerPriceRials",
    "estimatedDeliveryLabel",
    "id",
    "isFree",
    "serviceCode",
    "serviceLabel",
  ]);
  assert.equal(serialized.includes("private-origin-address"), false);
  assert.equal(serialized.includes("private-sender"), false);
  assert.equal(serialized.includes("+989111111111"), false);
  assert.equal(serialized.includes("privateOriginId"), false);
});
