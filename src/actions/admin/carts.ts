"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAuditLog } from "@/lib/admin-audit";
import { classifyCartActivity, getLatestCartActivity } from "@/lib/cart-activity";
import { config } from "@/lib/config";
import { isAbandonedCartReminderEligible } from "@/lib/abandoned-cart-reminder";
import { logger } from "@/lib/logger";
import { normalizeIranPhone, validateIranPhone } from "@/lib/phone";
import prisma from "@/lib/prisma";
import { sendSms } from "@/lib/sms/service";
import { ensureAdminAction } from "@/lib/auth";

const MAX_CART_REMINDERS_PER_SEND = 50;
const selectionSchema = z.array(z.string().cuid()).min(1).max(MAX_CART_REMINDERS_PER_SEND);
const cartReminderEvent = "abandoned_cart_reminder";

export type AbandonedCartSmsResult = {
  success: boolean;
  message: string;
  sent?: number;
  skipped?: number;
  failed?: number;
};

export async function sendAbandonedCartRemindersAction(cartIds: string[]): Promise<AbandonedCartSmsResult> {
  try {
    const { userId } = await ensureAdminAction();
    const parsed = selectionSchema.safeParse(cartIds);
    if (!parsed.success) {
      return { success: false, message: `در هر نوبت از ۱ تا ${MAX_CART_REMINDERS_PER_SEND} سبد انتخاب کنید.` };
    }

    const selectedIds = [...new Set(parsed.data)];
    if (selectedIds.length !== parsed.data.length) {
      return { success: false, message: "سبد انتخاب‌شده تکراری است؛ صفحه را تازه کنید و دوباره تلاش کنید." };
    }

    const carts = await prisma.cart.findMany({
      where: { id: { in: selectedIds }, items: { some: {} } },
      select: {
        id: true,
        createdAt: true,
        lastCartSeenAt: true,
        checkoutStartedAt: true,
        checkoutLastSeenAt: true,
        items: { select: { updatedAt: true, product: { select: { stock: true } } } },
        user: {
          select: {
            name: true,
            phone: true,
            orders: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
          },
        },
      },
    });

    const byId = new Map(carts.map((cart) => [cart.id, cart]));
    const now = new Date();
    const appUrl = (config.NEXT_PUBLIC_APP_URL || "https://www.oilbar.ir").replace(/\/$/, "");
    let sent = 0;
    let skipped = selectedIds.length - carts.length;
    let failed = 0;

    const sendOne = async (cartId: string) => {
      const cart = byId.get(cartId);
      if (!cart) return;

      const latestItemUpdatedAt = cart.items.reduce<Date | null>(
        (latest, item) => (!latest || item.updatedAt > latest ? item.updatedAt : latest),
        null,
      );
      const activity = {
        lastCartSeenAt: cart.lastCartSeenAt,
        checkoutStartedAt: cart.checkoutStartedAt,
        checkoutLastSeenAt: cart.checkoutLastSeenAt,
        latestItemUpdatedAt,
      };
      const status = classifyCartActivity(activity, now);
      const lastActivityAt = getLatestCartActivity(activity) ?? cart.createdAt;
      const phone = cart.user.phone ?? "";
      const eligible = isAbandonedCartReminderEligible({
        status,
        lastActivityAt,
        hasPhone: validateIranPhone(phone),
        hasAvailableItems: cart.items.some((item) => item.product.stock > 0),
        latestOrderAt: cart.user.orders[0]?.createdAt,
        now,
      });
      if (!eligible) {
        skipped += 1;
        return;
      }

      const customerName = cart.user.name?.trim().split(/\s+/)[0]?.replace(/[^\p{L}\p{M}'’-]/gu, "") || "همراه";
      const message = `${customerName} عزیز، سبد خریدت در اویل‌بار هنوز منتظرته. اگر هنوز قصد خرید داری، از اینجا ادامه بده: ${appUrl}/cart`;
      const dedupeKey = `${cartReminderEvent}:${cart.id}:${lastActivityAt.toISOString()}`;

      try {
        const result = await sendSms({
          phone: normalizeIranPhone(phone),
          eventType: cartReminderEvent,
          templateName: cartReminderEvent,
          dedupeKey,
          message,
        });
        if (!result.success) failed += 1;
        else if (("skipped" in result && result.skipped) || ("sandbox" in result && result.sandbox)) skipped += 1;
        else sent += 1;
      } catch (error) {
        failed += 1;
        logger.warn("Abandoned-cart reminder failed", {
          cartId: cart.id,
          error: error instanceof Error ? error.message : "unknown",
        });
      }
    };

    // Keep provider load predictable while allowing a small, bounded batch.
    for (let index = 0; index < selectedIds.length; index += 3) {
      await Promise.all(selectedIds.slice(index, index + 3).map(sendOne));
    }

    await createAuditLog({
      actorUserId: userId,
      targetType: "abandoned_cart_sms",
      targetId: "bulk",
      action: "SEND_ABANDONED_CART_REMINDERS",
      summary: `یادآوری پیامکی سبد خرید: ${sent} ارسال، ${skipped} رد یا تکراری، ${failed} ناموفق.`,
      metadata: { selected: selectedIds.length, sent, skipped, failed },
    }).catch((error) => logger.warn("Abandoned-cart reminder audit log failed", {
      error: error instanceof Error ? error.message : "unknown",
    }));

    revalidatePath("/admin");
    const message = failed > 0
      ? `${sent} پیامک پذیرفته شد؛ ${skipped} سبد رد یا تکراری بود و ${failed} مورد ناموفق ماند.`
      : `${sent} پیامک پذیرفته شد؛ ${skipped} سبد به‌دلیل شرایط ارسال یا ارسال قبلی کنار گذاشته شد.`;
    return { success: failed === 0, message, sent, skipped, failed };
  } catch (error) {
    logger.warn("Abandoned-cart reminder action failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return { success: false, message: "ارسال یادآوری انجام نشد؛ دوباره تلاش کنید یا گزارش پیامک را بررسی کنید." };
  }
}
