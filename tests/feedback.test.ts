import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFeedbackUrl,
  createFeedbackToken,
  feedbackCustomerName,
  feedbackExpiryDate,
  feedbackPayloadSchema,
  feedbackTokenSchema,
  hashFeedbackToken,
  isFeedbackSubmissionTooFast,
} from "@/lib/feedback";

test("feedback tokens are URL-safe and only their hash needs persistence", () => {
  const token = createFeedbackToken();
  assert.equal(feedbackTokenSchema.safeParse(token).success, true);
  assert.match(token, /^[A-Za-z0-9_-]{32}$/);

  const hash = hashFeedbackToken(token);
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(hash.includes(token), false);
});

test("feedback URL uses the configured Oilbar origin without a duplicate slash", () => {
  const token = "a".repeat(32);
  assert.equal(buildFeedbackUrl(token, "https://www.oilbar.ir/"), `https://www.oilbar.ir/f/${token}`);
});

test("previously issued 43-character feedback tokens remain valid", () => {
  assert.equal(feedbackTokenSchema.safeParse("a".repeat(43)).success, true);
});

test("feedback customer names satisfy the SMS.ir template variable limit", () => {
  assert.equal(feedbackCustomerName("  مانی   آگاه  "), "مانی آگاه");
  assert.equal(feedbackCustomerName("   "), "مشتری اویل‌بار");
  assert.equal(feedbackCustomerName("م".repeat(60)).length, 40);
});

test("feedback links expire thirty days after creation", () => {
  const now = new Date("2026-09-21T10:00:00.000Z");
  assert.equal(feedbackExpiryDate(now).toISOString(), "2026-10-21T10:00:00.000Z");
});

test("feedback payload accepts complete ratings and rejects out-of-range values", () => {
  const valid = {
    overallRating: 5,
    productQualityRating: 4,
    deliveryRating: 3,
    recommend: true,
    comment: "تجربه خوبی بود.",
    website: "",
    formStartedAt: Date.now() - 10_000,
  };
  assert.equal(feedbackPayloadSchema.safeParse(valid).success, true);
  assert.equal(feedbackPayloadSchema.safeParse({ ...valid, overallRating: 6 }).success, false);
  assert.equal(feedbackPayloadSchema.safeParse({ ...valid, recommend: "yes" }).success, false);
});

test("feedback anti-spam timing rejects unrealistically fast submissions", () => {
  const now = 100_000;
  assert.equal(isFeedbackSubmissionTooFast(now - 1_000, now), true);
  assert.equal(isFeedbackSubmissionTooFast(now - 5_000, now), false);
  assert.equal(isFeedbackSubmissionTooFast(now + 2 * 60 * 60 * 1_000, now), true);
});
