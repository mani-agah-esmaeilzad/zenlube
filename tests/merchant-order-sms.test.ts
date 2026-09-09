import test from "node:test";
import assert from "node:assert/strict";

import { notifyMerchantOfNewOrder, resolveMerchantOrderSmsPhone } from "@/lib/sms/merchant-order";

test("resolveMerchantOrderSmsPhone normalizes a configured Iranian mobile", () => {
  assert.equal(resolveMerchantOrderSmsPhone("۰۹۱۲ ۳۴۵ ۶۷۸۹"), "+989123456789");
  assert.equal(resolveMerchantOrderSmsPhone(""), null);
  assert.equal(resolveMerchantOrderSmsPhone("02112345678"), null);
});

test("notifyMerchantOfNewOrder sends a deduplicated minimal notification", async () => {
  const calls: Array<{
    phone: string;
    templateName: string;
    tokens: Record<string, string | number | null | undefined>;
    options: { eventType: string; dedupeKey: string };
  }> = [];
  const orderId = "cm1234567890abcdefgh";

  const result = await notifyMerchantOfNewOrder(orderId, {
    phone: "09123456789",
    send: async (phone, templateName, tokens, options) => {
      calls.push({ phone, templateName, tokens, options });
      return { success: true };
    },
  });

  assert.equal(result.success, true);
  assert.deepEqual(calls, [{
    phone: "+989123456789",
    templateName: "merchant_order_created",
    tokens: { orderNumber: "CM12345678" },
    options: {
      eventType: "merchant_order_created",
      dedupeKey: `merchant_order_created:${orderId}`,
    },
  }]);
});

test("notifyMerchantOfNewOrder never throws when the SMS provider fails", async () => {
  const result = await notifyMerchantOfNewOrder("cm1234567890abcdefgh", {
    phone: "09123456789",
    send: async () => {
      throw new Error("provider response containing internal details");
    },
  });

  assert.deepEqual(result, { success: false, error: "ارسال اعلان سفارش جدید ناموفق بود." });
});

test("notifyMerchantOfNewOrder skips safely when no recipient is configured", async () => {
  let sent = false;
  const result = await notifyMerchantOfNewOrder("cm1234567890abcdefgh", {
    phone: "",
    send: async () => {
      sent = true;
      return { success: true };
    },
  });

  assert.deepEqual(result, { success: true, skipped: true });
  assert.equal(sent, false);
});
