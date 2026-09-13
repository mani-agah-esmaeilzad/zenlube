import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOrderStatusNotification,
  buildOrderTrackingNotification,
} from "@/lib/sms/order-notifications";
import { renderSmsTemplate } from "@/lib/sms/service";

const baseStatusInput = {
  orderId: "order-123",
  orderNumber: "ORDER-123",
  previousStatus: "PENDING" as const,
  nextStatus: "PAID" as const,
};

test("order status notifications skip no-op updates and non-customer PENDING state", () => {
  assert.equal(buildOrderStatusNotification({
    ...baseStatusInput,
    previousStatus: "PAID",
    nextStatus: "PAID",
  }), null);

  assert.equal(buildOrderStatusNotification({
    ...baseStatusInput,
    previousStatus: "CANCELLED",
    nextStatus: "PENDING",
  }), null);
});

test("order status notifications use a stable per-order status dedupe key", () => {
  const notification = buildOrderStatusNotification(baseStatusInput);

  assert.deepEqual(notification, {
    templateName: "status_paid",
    eventType: "order_status_changed",
    dedupeKey: "order_status:order-123:PAID",
    tokens: { orderNumber: "ORDER-123" },
  });
});

test("preparing status has its own customer notification", () => {
  const notification = buildOrderStatusNotification({
    ...baseStatusInput,
    previousStatus: "PAID",
    nextStatus: "PREPARING",
  });
  assert.deepEqual(notification, {
    templateName: "status_preparing",
    eventType: "order_status_changed",
    dedupeKey: "order_status:order-123:PREPARING",
    tokens: { orderNumber: "ORDER-123" },
  });
  assert.equal(
    renderSmsTemplate(notification!.templateName, notification!.tokens),
    "سفارش ORDER-123 در حال آماده‌سازی و بسته‌بندی است. به‌محض تحویل به شرکت حمل، کد پیگیری برایتان ارسال می‌شود.",
  );
});

test("saving unchanged order data can retry undelivered SMS with the original dedupe key", () => {
  const status = buildOrderStatusNotification({
    ...baseStatusInput,
    previousStatus: "PAID",
    retryUndelivered: true,
  });
  assert.equal(status?.dedupeKey, "order_status:order-123:PAID");
  const tracking = buildOrderTrackingNotification({
    orderId: "order-123",
    orderNumber: "ORDER-123",
    previousTrackingCode: "POST-9988",
    nextTrackingCode: "POST-9988",
    retryUndelivered: true,
  });
  assert.equal(tracking?.dedupeKey, "tracking:order-123:POST-9988");
  assert.equal(buildOrderStatusNotification({
    ...baseStatusInput,
    nextStatus: "PENDING",
    retryUndelivered: true,
  }), null);
});

test("shipped notification never substitutes a fake tracking code", () => {
  const withoutTracking = buildOrderStatusNotification({
    ...baseStatusInput,
    previousStatus: "PAID",
    nextStatus: "SHIPPED",
    trackingCode: null,
  });
  assert.equal(withoutTracking?.templateName, "status_shipped_pending_tracking");
  assert.equal(
    renderSmsTemplate(withoutTracking!.templateName, withoutTracking!.tokens),
    "سفارش ORDER-123 تحویل شرکت حمل شد. کد پیگیری پس از ثبت برای شما پیامک می‌شود.",
  );

  const withTracking = buildOrderStatusNotification({
    ...baseStatusInput,
    previousStatus: "PAID",
    nextStatus: "SHIPPED",
    trackingCode: "  POST-9988  ",
  });
  assert.equal(withTracking?.templateName, "status_shipped");
  assert.equal(withTracking?.tokens.trackingCode, "POST-9988");
});

test("tracking notifications only send for a newly available or changed code", () => {
  assert.equal(buildOrderTrackingNotification({
    orderId: "order-123",
    orderNumber: "ORDER-123",
    previousTrackingCode: "POST-9988",
    nextTrackingCode: "  POST-9988 ",
  }), null);

  assert.equal(buildOrderTrackingNotification({
    orderId: "order-123",
    orderNumber: "ORDER-123",
    previousTrackingCode: null,
    nextTrackingCode: "   ",
  }), null);

  const notification = buildOrderTrackingNotification({
    orderId: "order-123",
    orderNumber: "ORDER-123",
    previousTrackingCode: null,
    nextTrackingCode: "  POST-9988  ",
  });
  assert.deepEqual(notification, {
    templateName: "tracking_code_added",
    eventType: "tracking_code_added",
    dedupeKey: "tracking:order-123:POST-9988",
    tokens: { orderNumber: "ORDER-123", trackingCode: "POST-9988" },
  });
  assert.equal(
    renderSmsTemplate(notification!.templateName, notification!.tokens),
    "کد پیگیری سفارش ORDER-123: POST-9988. برای پیگیری مرسوله از همین کد استفاده کنید.",
  );
});
