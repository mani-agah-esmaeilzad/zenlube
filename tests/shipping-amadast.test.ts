import assert from "node:assert/strict";
import test from "node:test";

import {
  amadastProvider,
  classifyAmadastCreateDispatchError,
  normalizeAmadastCreateOrderPayload,
  normalizeAmadastEstimatePayload,
  normalizeAmadastLocationPayload,
  resolveAmadastPackageType,
} from "@/lib/shipping/providers/amadast";
import { config } from "@/lib/config";
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

test("Amadast live quote uses the official calculator endpoint and requested couriers", async (t) => {
  const previousConfig = {
    AMADAST_CALCULATOR_BASE_URL: config.AMADAST_CALCULATOR_BASE_URL,
    NEXT_PUBLIC_APP_URL: config.NEXT_PUBLIC_APP_URL,
  };
  Object.assign(config, {
    AMADAST_CALCULATOR_BASE_URL: "https://calculator.example.test/api/v2.0/tool/shipping-calculator",
    NEXT_PUBLIC_APP_URL: "https://www.oilbar.ir",
  });
  t.after(() => Object.assign(config, previousConfig));

  let requestCount = 0;
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    requestCount += 1;
    const url = String(input);
    const headers = new Headers(init?.headers);
    assert.equal(headers.has("Authorization"), false);
    assert.equal(headers.has("X-Client-Code"), false);
    assert.equal(headers.get("Origin"), "https://www.oilbar.ir");

    if (requestCount === 1) {
      assert.equal(url, "https://calculator.example.test/api/v2.0/tool/shipping-calculator");
      assert.equal(init?.method, "POST");
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body.couriers, [13, 4]);
      assert.equal(body.from_city, 279);
      assert.equal(body.to_city, 360);
      return Response.json({ result: true, data: { request_id: "quote-1" } });
    }

    assert.equal(url, "https://calculator.example.test/api/v2.0/tool/shipping-calculator/quote-1");
    return Response.json({
      result: true,
      data: {
        data: {
          items: [{ id: "4", shipping_method: 4, title: "تیپاکس", price: 350000 }],
        },
        progress_detail: { percent: 100 },
      },
    });
  });

  const quotes = await amadastProvider.quote({
    originExternalCityId: 279,
    destinationExternalCityId: 360,
    weightGrams: 4500,
    declaredValueRials: 10_000_000,
    packageType: 2,
    carrierCodes: ["POST", "TIPAX"],
  }, 2000);

  assert.equal(requestCount, 2);
  assert.equal(quotes.length, 1);
  assert.equal(quotes[0]?.carrierCode, "TIPAX");
  assert.equal(quotes[0]?.basePriceRials, 350000);
});

test("Amadast location normalization accepts the documented null parent for provinces", () => {
  const provinces = normalizeAmadastLocationPayload({
    success: true,
    data: [
      { id: 4, title: "اصفهان", parent: null, location: null },
      { id: 8, title: "تهران", parent: null, location: null },
    ],
  });

  assert.deepEqual(provinces, [
    { externalId: 4, name: "اصفهان", externalParentId: 0 },
    { externalId: 8, name: "تهران", externalParentId: 0 },
  ]);
});

test("Amadast location normalization keeps city hierarchy and tolerates a null city parent", () => {
  const province = { externalId: 8, name: "تهران", externalParentId: 0 };
  assert.deepEqual(normalizeAmadastLocationPayload({
    success: true,
    data: [
      { id: 360, title: "تهران", parent: 8, location: null },
      { id: 349, title: "اسلامشهر", parent: null, location: null },
    ],
  }, province), [
    { externalId: 360, name: "تهران", externalParentId: 8 },
    { externalId: 349, name: "اسلامشهر", externalParentId: 8 },
  ]);
});

test("Amadast locations reject empty, failed, paginated, duplicate and wrong-parent responses", () => {
  const province = { externalId: 8, name: "تهران", externalParentId: 0 };
  const city = { id: 360, title: "تهران", parent: 8 };
  for (const payload of [
    { success: true, data: [] },
    { success: false, data: [city] },
    { result: false, data: [city] },
    { data: [city], next_page_url: "/v1/cities?page=2" },
    { data: [city], meta: { current_page: 1, last_page: 2 } },
    { data: [city], current_page: 2, last_page: 2 },
    { data: [city, city] },
    { data: [{ ...city, parent: 9 }] },
    { data: [{ ...city, title: "  " }] },
  ]) {
    assert.throws(() => normalizeAmadastLocationPayload(payload, province),
      (error: unknown) => error instanceof ShippingProviderError && error.code === "INVALID_RESPONSE");
  }
});

test("Amadast location fetching has one overall deadline and bounded concurrency", async (t) => {
  const previousConfig = {
    AMADAST_CLIENT_CODE: config.AMADAST_CLIENT_CODE,
    AMADAST_ACCESS_TOKEN: config.AMADAST_ACCESS_TOKEN,
  };
  Object.assign(config, { AMADAST_CLIENT_CODE: "test-client", AMADAST_ACCESS_TOKEN: "test-token" });
  t.after(() => Object.assign(config, previousConfig));
  let now = 0;
  let requests = 0;
  let active = 0;
  let maximumActive = 0;
  t.mock.method(Date, "now", () => now);
  t.mock.method(globalThis, "fetch", async (input: string) => {
    requests++;
    now += 1_000;
    active++;
    maximumActive = Math.max(maximumActive, active);
    await new Promise((resolve) => setImmediate(resolve));
    active--;
    const provinceId = new URL(input).searchParams.get("province_id");
    const data = provinceId
      ? [{ id: Number(provinceId) + 100, title: "شهر", parent: Number(provinceId) }]
      : Array.from({ length: 31 }, (_, i) => ({ id: i + 1, title: `استان ${i}`, parent: null }));
    return Response.json({ success: true, data });
  });

  await assert.rejects(amadastProvider.listLocations(10_000),
    (error: unknown) => error instanceof ShippingProviderError && error.code === "TIMEOUT");
  assert.ok(requests <= 20, `Expected a shared deadline, received ${requests} requests`);
  assert.ok(maximumActive <= 6);
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
