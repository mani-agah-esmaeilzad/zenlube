import assert from "node:assert/strict";
import test from "node:test";

import { otpRequestBodySchema } from "@/lib/otp-request";

test("OTP requests are limited to account login and registration", () => {
  const accountRequest = otpRequestBodySchema.safeParse({ phone: "09121234567", purpose: "account" });
  assert.equal(accountRequest.success, true);

  const defaultRequest = otpRequestBodySchema.safeParse({ phone: "09121234567" });
  assert.equal(defaultRequest.success, true);
  if (defaultRequest.success) assert.equal(defaultRequest.data.purpose, "account");

  const checkoutRequest = otpRequestBodySchema.safeParse({ phone: "09121234567", purpose: "checkout" });
  assert.equal(checkoutRequest.success, false);
});
