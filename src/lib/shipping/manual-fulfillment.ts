const MANUAL_SHIPPING_STATUS_LABELS: Record<string, string> = {
  PENDING: "پس از پرداخت",
  PAID: "در حال آماده‌سازی",
  SHIPPED: "تحویل شرکت حمل",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغوشده",
};

export function manualShippingStatusLabel(orderStatus: string) {
  return MANUAL_SHIPPING_STATUS_LABELS[orderStatus] ?? "در حال بررسی";
}

export function isOrderHandedToCarrier(orderStatus: string) {
  return orderStatus === "SHIPPED" || orderStatus === "DELIVERED";
}
