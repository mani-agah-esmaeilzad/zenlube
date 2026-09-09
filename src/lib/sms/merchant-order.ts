import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { normalizeIranPhone, validateIranPhone } from "@/lib/phone";
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
  options: { eventType: string; dedupeKey: string },
) => Promise<MerchantOrderSmsResult>;

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
  },
): Promise<MerchantOrderSmsResult> {
  const phone = resolveMerchantOrderSmsPhone(dependencies?.phone ?? config.MERCHANT_ORDER_SMS_PHONE);
  if (!phone) {
    logger.info("Merchant order SMS skipped because the recipient is not configured", { orderId });
    return { success: true, skipped: true };
  }

  const send = dependencies?.send ?? sendTemplateSms;
  try {
    const result = await send(
      phone,
      "merchant_order_created",
      { orderNumber: smsOrderNumber(orderId) },
      { eventType: "merchant_order_created", dedupeKey: `merchant_order_created:${orderId}` },
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
