import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { normalizeIranPhone, validateIranPhone } from "@/lib/phone";
import prisma from "@/lib/prisma";
import { sendTemplateSms, smsOrderNumber } from "@/lib/sms/service";

type MerchantOrderSmsResult = {
  success: boolean;
  skipped?: boolean;
  error?: string;
};

type MerchantOrderSmsSender = (
  phone: string,
  templateName: string,
  tokens: Record<string, string | number | null | undefined>,
  options: { eventType: string; dedupeKey: string; forceResend?: boolean },
) => Promise<MerchantOrderSmsResult>;

type MerchantOrderSmsDetails = {
  items: ReadonlyArray<{ name: string; quantity: number }>;
};

type MerchantOrderSmsLoader = (orderId: string) => Promise<MerchantOrderSmsDetails | null>;

const loadMerchantOrderSmsDetails: MerchantOrderSmsLoader = (orderId) => prisma.order.findUnique({
  where: { id: orderId },
  select: {
    items: {
      orderBy: { id: "asc" },
      select: {
        quantity: true,
        product: { select: { name: true } },
      },
    },
  },
}).then((order) => order
  ? { items: order.items.map((item) => ({ name: item.product.name, quantity: item.quantity })) }
  : null);

export function formatMerchantOrderItems(items: MerchantOrderSmsDetails["items"]) {
  if (!items.length) return "بدون قلم ثبت‌شده";
  return items
    .map((item) => `${item.quantity.toLocaleString("fa-IR")} عدد ${item.name.replace(/\s+/g, " ").trim()}`)
    .join("، ");
}

export function resolveMerchantOrderSmsPhone(phone = config.MERCHANT_ORDER_SMS_PHONE) {
  if (!phone?.trim()) return null;
  const normalizedPhone = normalizeIranPhone(phone);
  return validateIranPhone(normalizedPhone) ? normalizedPhone : null;
}

export async function notifyMerchantOfNewOrder(
  orderId: string,
  dependencies?: {
    phone?: string | null;
    send?: MerchantOrderSmsSender;
    loadOrder?: MerchantOrderSmsLoader;
    forceResend?: boolean;
  },
): Promise<MerchantOrderSmsResult> {
  const phone = resolveMerchantOrderSmsPhone(dependencies?.phone ?? config.MERCHANT_ORDER_SMS_PHONE);
  if (!phone) {
    logger.info("Merchant order SMS skipped because the recipient is not configured", { orderId });
    return { success: true, skipped: true };
  }

  const send = dependencies?.send ?? sendTemplateSms;
  try {
    const order = await (dependencies?.loadOrder ?? loadMerchantOrderSmsDetails)(orderId);
    if (!order) {
      logger.warn("Merchant order SMS skipped because the order was not found", { orderId });
      return { success: false, error: "سفارش برای ارسال اعلان پیدا نشد." };
    }
    const result = await send(
      phone,
      "merchant_order_created",
      {
        orderNumber: smsOrderNumber(orderId),
        items: formatMerchantOrderItems(order.items),
      },
      {
        eventType: "merchant_order_created",
        dedupeKey: `merchant_order_created:${orderId}`,
        ...(dependencies?.forceResend ? { forceResend: true } : {}),
      },
    );

    if (!result.success) {
      logger.warn("Merchant order SMS provider did not accept the notification", { orderId });
    }
    return result;
  } catch {
    // Order creation and payment must never fail because the notification service is unavailable.
    logger.warn("Merchant order SMS notification failed", { orderId });
    return { success: false, error: "ارسال اعلان سفارش جدید ناموفق بود." };
  }
}
