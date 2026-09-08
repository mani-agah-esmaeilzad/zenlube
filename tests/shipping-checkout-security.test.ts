import assert from "node:assert/strict";
import test from "node:test";

import { checkoutOrderSchema } from "@/lib/validators";

const validCheckout = {
  fullName: "کاربر آزمایشی",
  email: "customer@example.com",
  phone: "09121234567",
  address1: "تهران، خیابان آزمایشی، پلاک ۱۲",
  provinceCode: "IR-P-1234567890abcdef",
  cityCode: "IR-C-1234567890abcdef",
  postalCode: "۱۲۳۴۵۶۷۸۹۰",
  shippingOptionId: "cm12345678901234567890123",
  checkoutIdempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
  saveAddress: true,
};

test("checkout accepts only an option identifier and strips a tampered client shipping price", () => {
  const parsed = checkoutOrderSchema.safeParse({ ...validCheckout, shippingPrice: 1, total: 1, productWeight: 1 });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  assert.equal("shippingPrice" in parsed.data, false);
  assert.equal("total" in parsed.data, false);
  assert.equal("productWeight" in parsed.data, false);
});

test("checkout cannot continue without a persisted shipping option", () => {
  const parsed = checkoutOrderSchema.safeParse({ ...validCheckout, shippingOptionId: "" });
  assert.equal(parsed.success, false);
});

test("checkout does not require or accept an OTP field", () => {
  const parsed = checkoutOrderSchema.safeParse({ ...validCheckout, otpCode: "123456" });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  assert.equal("otpCode" in parsed.data, false);
});
