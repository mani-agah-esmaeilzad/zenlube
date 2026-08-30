import test from "node:test";
import assert from "node:assert/strict";

import {
  buildZarinpalRequestPayload,
  buildZarinpalVerifyPayload,
} from "@/lib/payments/zarinpal";

test("Zarinpal request converts stored rial amounts to toman and uses merchant-side verification", () => {
  const payload = buildZarinpalRequestPayload({
    amount: 125000,
    callbackUrl: "https://example.com/api/payments/zarinpal/callback?orderId=order_1",
    description: "پرداخت سفارش آزمایشی",
    email: "customer@example.com",
    phone: "+989121234567",
    metadata: { order_id: "order_1", auto_verify: true },
  });

  assert.equal(payload.amount, 12500);
  assert.equal(payload.currency, "IRT");
  assert.equal(payload.callback_url, "https://example.com/api/payments/zarinpal/callback?orderId=order_1");
  assert.deepEqual(payload.metadata, {
    email: "customer@example.com",
    mobile: "+989121234567",
    order_id: "order_1",
    auto_verify: false,
  });
});

test("Zarinpal verify sends only the fields accepted by the v4 verify API", () => {
  const payload = buildZarinpalVerifyPayload("S000000000000000000000000000000001", 125000);

  assert.deepEqual(Object.keys(payload).sort(), ["amount", "authority", "merchant_id"]);
  assert.equal(payload.amount, 12500);
  assert.equal(payload.authority, "S000000000000000000000000000000001");
});
