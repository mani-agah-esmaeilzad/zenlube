import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  FEEDBACK_PAYLOAD_MAX_BYTES,
  feedbackPayloadSchema,
  feedbackTokenSchema,
  hashFeedbackToken,
  isFeedbackSubmissionTooFast,
} from "@/lib/feedback";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

const FEEDBACK_RATE_WINDOW_SECONDS = 60 * 60;
const FEEDBACK_RATE_LIMIT = 12;
const FEEDBACK_COOLDOWN_SECONDS = 60;

type FeedbackRouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(request: Request, context: FeedbackRouteContext) {
  try {
    const { token } = await context.params;
    const parsedToken = feedbackTokenSchema.safeParse(token);
    if (!parsedToken.success) return response("لینک نظرسنجی معتبر نیست.", 404);

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > FEEDBACK_PAYLOAD_MAX_BYTES) {
      return response("حجم درخواست بیش از حد مجاز است.", 413);
    }

    const forwardedFor = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
    const limit = await consumeRateLimit(`purchase-feedback:${clientIp}`, FEEDBACK_RATE_WINDOW_SECONDS, FEEDBACK_RATE_LIMIT);
    if (!limit.success) return response("تعداد درخواست‌ها زیاد است؛ لطفاً بعداً تلاش کنید.", 429);

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > FEEDBACK_PAYLOAD_MAX_BYTES) {
      return response("حجم درخواست بیش از حد مجاز است.", 413);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return response("ساختار درخواست معتبر نیست.", 400);
    }

    const parsed = feedbackPayloadSchema.safeParse(payload);
    if (!parsed.success) return response("لطفاً به همه امتیازها پاسخ معتبر بدهید.", 400);
    if (parsed.data.website || isFeedbackSubmissionTooFast(parsed.data.formStartedAt)) {
      return response("امکان ثبت این پاسخ وجود ندارد؛ لطفاً دوباره تلاش کنید.", 400);
    }

    const cooldown = await consumeRateLimit(
      `purchase-feedback-cooldown:${clientIp}:${hashFeedbackToken(parsedToken.data)}`,
      FEEDBACK_COOLDOWN_SECONDS,
      1,
    );
    if (!cooldown.success) return response("برای تلاش دوباره لطفاً کمی صبر کنید.", 429);

    const now = new Date();
    const result = await prisma.orderFeedback.updateMany({
      where: {
        tokenHash: hashFeedbackToken(parsedToken.data),
        status: { in: ["PENDING", "SENT"] },
        expiresAt: { gt: now },
      },
      data: {
        status: "SUBMITTED",
        overallRating: parsed.data.overallRating,
        productQualityRating: parsed.data.productQualityRating,
        deliveryRating: parsed.data.deliveryRating,
        recommend: parsed.data.recommend,
        comment: parsed.data.comment || null,
        submittedAt: now,
      },
    });

    if (result.count !== 1) {
      return response("این لینک منقضی شده یا بازخورد آن قبلاً ثبت شده است.", 409);
    }

    revalidatePath("/admin");
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Purchase feedback submission failed", { error: error instanceof Error ? error.message : error });
    return response("ثبت نظر با خطا روبه‌رو شد؛ لطفاً دوباره تلاش کنید.", 500);
  }
}

function response(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}
