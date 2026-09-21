"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ensureAdminAction } from "@/lib/auth";
import { config } from "@/lib/config";
import {
  buildFeedbackUrl,
  createFeedbackToken,
  feedbackExpiryDate,
  feedbackOrderNumber,
  hashFeedbackToken,
} from "@/lib/feedback";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { sendSms } from "@/lib/sms/service";

const eligibleOrderStatuses = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

const inviteSchema = z.object({
  orderId: z.string().cuid(),
});

export type FeedbackInviteState = {
  success: boolean;
  message?: string;
};

export async function sendFeedbackInviteAction(
  _previousState: FeedbackInviteState,
  formData: FormData,
): Promise<FeedbackInviteState> {
  const { userId } = await ensureAdminAction();
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: "سفارش انتخاب‌شده معتبر نیست." };

  const token = createFeedbackToken();
  const tokenHash = hashFeedbackToken(token);
  const expiresAt = feedbackExpiryDate();

  const invitation = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: parsed.data.orderId },
      select: {
        id: true,
        phone: true,
        fullName: true,
        status: true,
        feedback: { select: { id: true, status: true } },
      },
    });

    if (!order) throw new Error("سفارش پیدا نشد.");
    if (!eligibleOrderStatuses.includes(order.status as (typeof eligibleOrderStatuses)[number])) {
      throw new Error("فقط برای سفارش‌های پرداخت‌شده یا تکمیل‌شده می‌توان نظرسنجی فرستاد.");
    }
    if (order.feedback?.status === "SUBMITTED") {
      throw new Error("این مشتری قبلاً بازخورد خود را برای این سفارش ثبت کرده است.");
    }

    const feedback = await tx.orderFeedback.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        tokenHash,
        expiresAt,
        sendCount: 1,
      },
      update: {
        tokenHash,
        expiresAt,
        status: "PENDING",
        sendCount: { increment: 1 },
      },
      select: { id: true, sendCount: true },
    });

    return { order, feedback };
  });

  const feedbackUrl = buildFeedbackUrl(token, config.NEXT_PUBLIC_APP_URL || "https://www.oilbar.ir");
  const orderNumber = feedbackOrderNumber(invitation.order.id);
  const smsResult = await sendSms({
    phone: invitation.order.phone,
    eventType: "purchase_feedback_invite",
    templateName: "purchase_feedback_invite",
    dedupeKey: `purchase_feedback:${invitation.feedback.id}:${invitation.feedback.sendCount}`,
    message: `از خریدتان از اویل‌بار راضی بودید؟ لطفاً نظر کوتاه خود را برای سفارش ${orderNumber} ثبت کنید: ${feedbackUrl}`,
  });

  const delivery = smsResult as { success: boolean; sandbox?: boolean; skipped?: boolean; error?: string };
  const actuallySent = delivery.success && !delivery.sandbox && !delivery.skipped;

  if (actuallySent) {
    await prisma.orderFeedback.update({
      where: { id: invitation.feedback.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  }

  await prisma.adminAuditLog.create({
    data: {
      actorUserId: userId,
      targetType: "OrderFeedback",
      targetId: invitation.feedback.id,
      action: actuallySent ? "SEND_FEEDBACK_INVITE" : "FEEDBACK_INVITE_NOT_SENT",
      summary: actuallySent
        ? `لینک نظرسنجی سفارش ${orderNumber} برای مشتری ارسال شد.`
        : `ارسال لینک نظرسنجی سفارش ${orderNumber} تکمیل نشد.`,
      metadata: {
        orderId: invitation.order.id,
        sendCount: invitation.feedback.sendCount,
        smsError: delivery.error ?? null,
      },
    },
  }).catch((error) => logger.warn("Feedback invitation audit log failed", {
    orderId: invitation.order.id,
    error: error instanceof Error ? error.message : "unknown",
  }));

  revalidatePath("/admin");

  if (!actuallySent) {
    return {
      success: false,
      message: delivery.sandbox
        ? "سامانه پیامک در حالت آزمایشی است و پیامک واقعی ارسال نشد."
        : delivery.error ?? "پیامک ارسال نشد؛ تنظیمات یا گزارش سرویس پیامک را بررسی کنید.",
    };
  }

  return { success: true, message: `لینک نظرسنجی برای ${invitation.order.fullName} ارسال شد.` };
}
