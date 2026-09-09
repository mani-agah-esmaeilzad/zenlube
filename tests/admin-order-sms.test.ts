import assert from "node:assert/strict";
import test from "node:test";

import { mapOrderSmsFeedback } from "../src/services/admin/order-sms";

test("order SMS feedback distinguishes provider acceptance from unconfirmed delivery", () => {
  assert.equal(mapOrderSmsFeedback().status, "absent");
  assert.equal(mapOrderSmsFeedback({ status: "sent" }).label, "پذیرفته‌شده توسط سرویس پیامک");
  assert.equal(mapOrderSmsFeedback({ status: "sending" }).status, "sending");
  assert.equal(mapOrderSmsFeedback({ status: "uncertain" }).status, "uncertain");
  assert.equal(mapOrderSmsFeedback({ status: "sandbox" }).label, "آزمایشی؛ پیامکی ارسال نشده");
  assert.equal(mapOrderSmsFeedback({ status: "unexpected-provider-state" }).status, "unknown");
});

test("order SMS feedback never exposes raw provider errors or credentials", () => {
  const feedback = mapOrderSmsFeedback({ status: "failed", errorMessage: "Invalid API key SECRET-1234 for phone 09120000000" });
  assert.equal(feedback.errorSummary, "تنظیمات یا دسترسی سرویس پیامک را بررسی کنید.");
  assert.equal(JSON.stringify(feedback).includes("SECRET-1234"), false);
  assert.equal(JSON.stringify(feedback).includes("09120000000"), false);
  assert.equal(mapOrderSmsFeedback({ status: "failed", errorMessage: "arbitrary response SECRET-5678" }).errorSummary?.includes("SECRET"), false);
  assert.equal(mapOrderSmsFeedback({ status: "uncertain", errorMessage: "SECRET-5678" }).errorSummary, undefined);
});
