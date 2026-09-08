const CLAIMABLE_SHIPMENT_STATUSES = new Set(["PENDING", "READY_TO_SHIP", "FAILED"]);
const RECONCILABLE_SHIPMENT_STATUSES = new Set(["SUBMITTING", "SUBMITTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "UNKNOWN"]);
export const TRACKING_SYNC_PROMOTABLE_SHIPMENT_STATUSES = [
  "PENDING",
  "READY_TO_SHIP",
  "SUBMITTING",
  "SUBMITTED",
  "FAILED",
  "UNKNOWN",
] as const;
const TRACKING_SYNC_PROMOTABLE_STATUS_SET = new Set<string>(TRACKING_SYNC_PROMOTABLE_SHIPMENT_STATUSES);

export function canClaimShipmentCreation(input: { status: string; externalShipmentId?: string | null }) {
  return !input.externalShipmentId && CLAIMABLE_SHIPMENT_STATUSES.has(input.status);
}

export function canReconcileShipmentTracking(status: string) {
  return RECONCILABLE_SHIPMENT_STATUSES.has(status);
}

export function shipmentCreateFailureStatus(input: { providerAccepted: boolean; outcomeUnknown: boolean }) {
  return input.providerAccepted || input.outcomeUnknown ? "UNKNOWN" as const : "FAILED" as const;
}

export function shipmentStatusAfterTrackingSync(status: string) {
  return TRACKING_SYNC_PROMOTABLE_STATUS_SET.has(status) ? "SUBMITTED" : status;
}
