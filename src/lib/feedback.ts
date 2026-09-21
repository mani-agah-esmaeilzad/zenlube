import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

export const FEEDBACK_TOKEN_TTL_DAYS = 30;
export const FEEDBACK_MIN_COMPLETION_MS = 3_000;
export const FEEDBACK_PAYLOAD_MAX_BYTES = 8_000;

export const feedbackTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "لینک نظرسنجی معتبر نیست.");

export const feedbackPayloadSchema = z.object({
  overallRating: z.coerce.number().int().min(1).max(5),
  productQualityRating: z.coerce.number().int().min(1).max(5),
  deliveryRating: z.coerce.number().int().min(1).max(5),
  recommend: z.boolean(),
  comment: z.string().trim().max(1_500, "متن بازخورد حداکثر ۱۵۰۰ کاراکتر است.").optional().default(""),
  website: z.string().max(200).optional().default(""),
  formStartedAt: z.number().int().positive(),
}).strict();

export function createFeedbackToken() {
  return randomBytes(32).toString("base64url");
}

export function hashFeedbackToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function feedbackExpiryDate(now = new Date()) {
  return new Date(now.getTime() + FEEDBACK_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1_000);
}

export function feedbackOrderNumber(orderId: string) {
  return orderId.slice(0, 10).toUpperCase();
}

export function buildFeedbackUrl(token: string, appUrl: string) {
  return `${appUrl.replace(/\/$/, "")}/feedback/${token}`;
}

export function isFeedbackSubmissionTooFast(formStartedAt: number, now = Date.now()) {
  const maxClockSkewMs = 60 * 60 * 1_000;
  if (formStartedAt > now + maxClockSkewMs) return true;
  return now - formStartedAt < FEEDBACK_MIN_COMPLETION_MS;
}
