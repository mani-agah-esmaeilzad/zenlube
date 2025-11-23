import test from "node:test";
import assert from "node:assert/strict";

import { normalizeIranPhone, validateIranPhone } from "@/lib/phone";

test("normalizeIranPhone normalizes numbers with leading zero", () => {
  assert.equal(normalizeIranPhone("09121234567"), "+989121234567");
});

test("normalizeIranPhone keeps already normalized numbers", () => {
  assert.equal(normalizeIranPhone("+989121234567"), "+989121234567");
});

test("normalizeIranPhone strips non-digit characters", () => {
  assert.equal(normalizeIranPhone("(0912) 123-4567"), "+989121234567");
});

test("normalizeIranPhone converts persian digits", () => {
  assert.equal(normalizeIranPhone("۰۹۱۲۳۴۵۶۷۸۹"), "+989123456789");
  assert.equal(normalizeIranPhone("+۹۸۹۱۲۳۴۵۶۷۸۹"), "+989123456789");
});

test("validateIranPhone returns true for valid iranian phones", () => {
  assert.equal(validateIranPhone("09121234567"), true);
  assert.equal(validateIranPhone("+989121234567"), true);
  assert.equal(validateIranPhone("۰۹۱۲۱۲۳۴۵۶۷"), true);
});

test("validateIranPhone returns false for invalid phones", () => {
  assert.equal(validateIranPhone("12345"), false);
  assert.equal(validateIranPhone("+982112345678"), false);
});
