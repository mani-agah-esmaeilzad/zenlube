import type { OrderStatus } from "@/generated/prisma";

import { sendTemplateSms } from "@/lib/sms/service";

type NotificationPlan = {
  dedupeKey: string;
  eventType: "order_status_changed" | "tracking_code_added";
  templateName: string;
  tokens: Record<string, string>;
};

type OrderStatusNotificationInput = {
  orderId: string;
  orderNumber: string;
  previousStatus: OrderStatus;
  nextStatus: OrderStatus;
  trackingCode?: string | null;
  retryUndelivered?: boolean;
};

type OrderTrackingNotificationInput = {
  orderId: string;
  orderNumber: string;
  previousTrackingCode?: string | null;
  nextTrackingCode?: string | null;
  retryUndelivered?: boolean;
};

function normalizedTrackingCode(value?: string | null) {
  const normalized = value?.trim();
  return normalized || null;
}

export function buildOrderStatusNotification(
  input: OrderStatusNotificationInput,
): NotificationPlan | null {
  if ((!input.retryUndelivered && input.previousStatus === input.nextStatus) || input.nextStatus === "PENDING") {
    return null;
  }

  const trackingCode = normalizedTrackingCode(input.trackingCode);
  const templateName =
    input.nextStatus === "PAID"
      ? "status_paid"
      : input.nextStatus === "PREPARING"
        ? "status_preparing"
        : input.nextStatus === "SHIPPED"
          ? trackingCode
            ? "status_shipped"
            : "status_shipped_pending_tracking"
          : input.nextStatus === "DELIVERED"
            ? "status_delivered"
            : "status_cancelled";

  return {
    templateName,
    eventType: "order_status_changed",
    dedupeKey: `order_status:${input.orderId}:${input.nextStatus}`,
    tokens: {
      orderNumber: input.orderNumber,
      ...(trackingCode ? { trackingCode } : {}),
    },
  };
}

export function buildOrderTrackingNotification(
  input: OrderTrackingNotificationInput,
): NotificationPlan | null {
  const previousTrackingCode = normalizedTrackingCode(input.previousTrackingCode);
  const nextTrackingCode = normalizedTrackingCode(input.nextTrackingCode);

  if (!nextTrackingCode || (!input.retryUndelivered && previousTrackingCode === nextTrackingCode)) {
    return null;
  }

  return {
    templateName: "tracking_code_added",
    eventType: "tracking_code_added",
    dedupeKey: `tracking:${input.orderId}:${nextTrackingCode}`,
    tokens: {
      orderNumber: input.orderNumber,
      trackingCode: nextTrackingCode,
    },
  };
}

async function sendNotification(phone: string, notification: NotificationPlan | null) {
  if (!notification) return { success: true, skipped: true } as const;

  return sendTemplateSms(
    phone,
    notification.templateName,
    notification.tokens,
    {
      eventType: notification.eventType,
      dedupeKey: notification.dedupeKey,
    },
  );
}

export function notifyCustomerOfOrderStatusChange(
  phone: string,
  input: OrderStatusNotificationInput,
) {
  return sendNotification(phone, buildOrderStatusNotification(input));
}

export function notifyCustomerOfTrackingCode(
  phone: string,
  input: OrderTrackingNotificationInput,
) {
  return sendNotification(phone, buildOrderTrackingNotification(input));
}
