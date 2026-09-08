import assert from "node:assert/strict";
import test from "node:test";

import { LEGACY_SHIPPING_OPTIONS } from "@/lib/shipping/service";
import {
  evaluateShippingRollout,
  type ShippingRolloutEnvironment,
  type ShippingRolloutSettings,
} from "@/lib/shipping/rollout";

const liveEnvironment: ShippingRolloutEnvironment = {
  providerMode: "amadast",
  nodeEnv: "production",
  clientCodeConfigured: true,
  providerIdentityConfigured: true,
};

const completeSettings: ShippingRolloutSettings = {
  enabled: true,
  providerKey: "amadast",
  providerStoreId: "12",
  providerProductTypeCode: "3",
  originProvinceCode: "IR-P-tehran",
  originCityCode: "IR-C-tehran",
  originAddress: "تهران، خیابان آزمایشی، پلاک ۱۲",
  originPostalCode: "1234567890",
  senderName: "فروشگاه اویل‌بار",
  senderMobile: "+989121234567",
  enabledCarriers: ["POST"],
};

const completeStats = {
  missingWeightProducts: 0,
  mappedProvinces: 31,
  mappedCities: 400,
  originMapped: true,
};

test("shipping rollout keeps checkout in legacy mode until the admin explicitly enables live rates", () => {
  const state = evaluateShippingRollout({
    settings: { ...completeSettings, enabled: false },
    environment: liveEnvironment,
    stats: completeStats,
  });
  assert.equal(state.setupReady, true);
  assert.equal(state.mode, "legacy");
});

test("shipping rollout activates dynamic rates only when every setup blocker is clear", () => {
  const state = evaluateShippingRollout({
    settings: completeSettings,
    environment: liveEnvironment,
    stats: completeStats,
  });
  assert.equal(state.setupReady, true);
  assert.equal(state.mode, "dynamic");
  assert.deepEqual(state.blockers, []);
});

test("missing provider config, locations, or a single product weight safely retain legacy checkout", () => {
  const state = evaluateShippingRollout({
    settings: completeSettings,
    environment: { ...liveEnvironment, providerMode: "disabled", clientCodeConfigured: false },
    stats: { missingWeightProducts: 1, mappedProvinces: 0, mappedCities: 0, originMapped: true },
  });
  assert.equal(state.mode, "legacy");
  assert.equal(state.setupReady, false);
  assert.deepEqual(
    new Set(state.blockers.map((blocker) => blocker.code)),
    new Set(["PROVIDER_DISABLED", "PRODUCT_WEIGHTS_MISSING", "LOCATIONS_MISSING"]),
  );
});

test("an unmapped selected origin cannot activate live rates even after a location sync", () => {
  const state = evaluateShippingRollout({
    settings: completeSettings,
    environment: liveEnvironment,
    stats: { ...completeStats, originMapped: false },
  });
  assert.equal(state.mode, "legacy");
  assert.equal(state.setupReady, false);
  assert.ok(state.blockers.some((blocker) => blocker.code === "ORIGIN_MAPPING_MISSING"));
});

test("invalid persisted sender or carrier values fail closed", () => {
  const state = evaluateShippingRollout({
    settings: {
      ...completeSettings,
      senderMobile: "0912",
      enabledCarriers: ["UNSUPPORTED"],
    },
    environment: liveEnvironment,
    stats: completeStats,
  });
  assert.equal(state.mode, "legacy");
  assert.deepEqual(
    new Set(state.blockers.map((blocker) => blocker.code)),
    new Set(["SENDER_MISSING", "CARRIERS_MISSING"]),
  );
});

test("legacy rollout preserves the checkout methods and prices from origin/main", () => {
  assert.deepEqual(
    LEGACY_SHIPPING_OPTIONS.map(({ serviceCode, customerPriceRials, estimatedDeliveryLabel }) => ({
      serviceCode,
      customerPriceRials,
      estimatedDeliveryLabel,
    })),
    [
      { serviceCode: "STANDARD", customerPriceRials: 60_000, estimatedDeliveryLabel: "۳ تا ۵ روز کاری" },
      { serviceCode: "EXPRESS", customerPriceRials: 120_000, estimatedDeliveryLabel: "۱ تا ۲ روز کاری" },
      { serviceCode: "PICKUP", customerPriceRials: 0, estimatedDeliveryLabel: "هماهنگی با پشتیبانی" },
    ],
  );
});
