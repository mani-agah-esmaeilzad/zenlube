export const MANUAL_MAHEX_SHIPPING_OPTION_ID = "manual:MAHEX_COD";
export const MANUAL_PICKUP_SHIPPING_OPTION_ID = "manual:PICKUP";

export const MANUAL_FREE_SHIPPING_THRESHOLD_RIALS = 100_000_000;

export function isManualSubmittedShippingOptionId(value: string) {
  return value === MANUAL_MAHEX_SHIPPING_OPTION_ID || value === MANUAL_PICKUP_SHIPPING_OPTION_ID;
}

export function manualServiceCodeForSubmittedShippingOptionId(value: string) {
  if (value === MANUAL_MAHEX_SHIPPING_OPTION_ID) return "MAHEX_COD";
  if (value === MANUAL_PICKUP_SHIPPING_OPTION_ID) return "PICKUP";
  return null;
}
