import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SHIPPING_ORIGIN,
  resolveDefaultShippingOrigin,
} from "@/lib/shipping/origin-defaults";

const provinces = [
  { code: "province-tehran", name: "تهران", parentCode: null },
  { code: "province-alborz", name: "البرز", parentCode: null },
];
const cities = [
  { code: "city-tehran", name: "تهران", parentCode: "province-tehran" },
  { code: "city-karaj", name: "كرج", parentCode: "province-alborz" },
];

test("shipping admin suggests Alborz and Karaj only when stored codes are empty", () => {
  assert.deepEqual(resolveDefaultShippingOrigin({ provinces, cities }), {
    provinceCode: "province-alborz",
    cityCode: "city-karaj",
  });
  assert.equal(DEFAULT_SHIPPING_ORIGIN.address, "کرج، عظیمیه");
});

test("shipping admin preserves an explicitly stored origin", () => {
  assert.deepEqual(resolveDefaultShippingOrigin({
    provinces,
    cities,
    storedProvinceCode: "province-tehran",
    storedCityCode: "city-tehran",
  }), {
    provinceCode: "province-tehran",
    cityCode: "city-tehran",
  });
});

test("shipping admin leaves codes empty before provider locations are synced", () => {
  assert.deepEqual(resolveDefaultShippingOrigin({ provinces: [], cities: [] }), {
    provinceCode: "",
    cityCode: "",
  });
});
