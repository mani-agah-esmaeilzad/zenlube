import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyAmadastCreateDispatchError,
  normalizeAmadastCreateOrderPayload,
  normalizeAmadastEstimatePayload,
  resolveAmadastPackageType,
} from "@/lib/shipping/providers/amadast";
import { ShippingProviderError } from "@/lib/shipping/providers/provider";

test("Amadast estimate normalization keeps only supported Post and Tipax services", () => {
  const result = normalizeAmadastEstimatePayload({
    success: true,
    data: {
      progress_detail: { percent: 100 },
      data: {
        items: [
          { id: 101, shipping_method: 13, title: "پست پیشتاز", price: 980000, discounted_price: 900000 },
          { id: 202, shipping_method: 4, title: "تیپاکس", price: "1350000" },
          { id: 303, shipping_method: 999, title: "ناوگان ناشناخته", price: 1 },
        ],
      },
    },
  }, "request-1");

  assert.equal(result.complete, true);
  assert.deepEqual(result.options.map((option) => option.carrierCode), ["POST", "TIPAX"]);
  assert.equal(result.options[0]?.basePriceRials, 900000);
  assert.equal(result.options[1]?.basePriceRials, 1350000);
  assert.equal(result.options.every((option) => option.providerRequestId === "request-1"), true);
});

test("Amadast estimate normalization rejects malformed paid-rate responses", () => {
  assert.throws(
    () => normalizeAmadastEstimatePayload({ success: true, data: { data: { items: [{ id: 1, price: "not-money" }] } } }, "request-2"),
    (error: unknown) => error instanceof ShippingProviderError && error.code === "INVALID_RESPONSE",
  );
});

test("Amadast package mapping is deterministic at documented size boundaries", () => {
  assert.equal(resolveAmadastPackageType({ lengthCm: 15, widthCm: 10, heightCm: 8 }), 1);
  assert.equal(resolveAmadastPackageType({ lengthCm: 20, widthCm: 15, heightCm: 10 }), 2);
  assert.equal(resolveAmadastPackageType({ lengthCm: 81, widthCm: 10, heightCm: 10 }), 11);
});

test("Amadast order creation accepts the official id-less response shape", () => {
  const result = normalizeAmadastCreateOrderPayload({
    success: true,
    data: {
      store_id: 12,
      external_order_id: 9001,
      recipient_name: "کاربر آزمایشی",
    },
  });
  assert.deepEqual(result, { externalShipmentId: null, externalStatus: "SUBMITTED" });
  assert.deepEqual(
    normalizeAmadastCreateOrderPayload({ success: true, data: { id: 456 } }),
    { externalShipmentId: "456", externalStatus: "SUBMITTED" },
  );
});

test("Amadast order creation distinguishes definite rejection from an ambiguous 2xx response", () => {
  assert.throws(
    () => normalizeAmadastCreateOrderPayload({ success: false, data: {} }),
    (error: unknown) => error instanceof ShippingProviderError
      && error.code === "CREATE_REJECTED"
      && error.retryable
      && !error.outcomeUnknown,
  );
  assert.throws(
    () => normalizeAmadastCreateOrderPayload({ success: true, data: null }),
    (error: unknown) => error instanceof ShippingProviderError
      && error.code === "CREATE_OUTCOME_UNKNOWN"
      && error.outcomeUnknown
      && !error.retryable,
  );
});

test("Amadast create transport classification retries only definite 4xx responses", () => {
  const clientRejection = classifyAmadastCreateDispatchError(
    new ShippingProviderError("HTTP_ERROR", "invalid request", false, 422),
  );
  assert.equal(clientRejection.code, "CREATE_REJECTED");
  assert.equal(clientRejection.retryable, true);
  assert.equal(clientRejection.outcomeUnknown, false);

  for (const failure of [
    new ShippingProviderError("HTTP_ERROR", "provider unavailable", true, 503),
    new ShippingProviderError("NETWORK_ERROR", "timeout", true),
    new Error("connection reset"),
  ]) {
    const ambiguous = classifyAmadastCreateDispatchError(failure);
    assert.equal(ambiguous.code, "CREATE_OUTCOME_UNKNOWN");
    assert.equal(ambiguous.retryable, false);
    assert.equal(ambiguous.outcomeUnknown, true);
  }
});
