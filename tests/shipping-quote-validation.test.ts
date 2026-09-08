import assert from "node:assert/strict";
import test from "node:test";

import {
  findReplacementShippingOption,
  inspectShippingQuoteSnapshot,
  pendingOrderCartMatches,
} from "@/lib/shipping/quote-validation";
import {
  canClaimShipmentCreation,
  canReconcileShipmentTracking,
  shipmentCreateFailureStatus,
  shipmentStatusAfterTrackingSync,
} from "@/lib/shipping/shipment-state";

const snapshot = {
  ownerUserId: "user-1",
  selectedOrderId: null,
  selectedOrderUserId: null,
  status: "READY",
  currency: "IRR",
  expiresAt: new Date("2030-01-01T00:10:00.000Z"),
  fingerprint: "fingerprint-1",
  cartId: "cart-1",
};

test("quote validation rejects expiration, address/cart tampering and wrong ownership", () => {
  assert.equal(inspectShippingQuoteSnapshot(snapshot, { userId: "user-1", fingerprint: "fingerprint-1", cartId: "cart-1", now: new Date("2030-01-01T00:00:00.000Z") }).valid, true);
  assert.equal(inspectShippingQuoteSnapshot(snapshot, { userId: "user-1", now: new Date("2030-01-01T00:10:00.000Z") }).code, "QUOTE_EXPIRED");
  assert.equal(inspectShippingQuoteSnapshot(snapshot, { userId: "user-1", fingerprint: "tampered", now: new Date("2030-01-01T00:00:00.000Z") }).code, "QUOTE_STALE");
  assert.equal(inspectShippingQuoteSnapshot(snapshot, { userId: "user-2", now: new Date("2030-01-01T00:00:00.000Z") }).code, "QUOTE_NOT_FOUND");
});

test("quote validation permits reuse only by the order that already selected it", () => {
  const selected = { ...snapshot, selectedOrderId: "order-1", selectedOrderUserId: "user-1" };
  assert.equal(inspectShippingQuoteSnapshot(selected, { userId: "user-1", orderId: "order-1", now: new Date("2030-01-01T00:00:00.000Z") }).valid, true);
  assert.equal(inspectShippingQuoteSnapshot(selected, { userId: "user-1", orderId: "order-2", now: new Date("2030-01-01T00:00:00.000Z") }).code, "QUOTE_USED");
  assert.equal(inspectShippingQuoteSnapshot(selected, { userId: "user-1", now: new Date("2030-01-01T00:00:00.000Z") }).code, "QUOTE_USED");
});

test("payment retry refreshes only the previously selected carrier service", () => {
  const options = [
    { id: "post-1", carrierCode: "POST", serviceCode: "pishtaz" },
    { id: "tipax-1", carrierCode: "TIPAX", serviceCode: "standard" },
  ];
  assert.equal(findReplacementShippingOption(options, { carrierCode: "POST", serviceCode: "pishtaz" })?.id, "post-1");
  assert.equal(findReplacementShippingOption(options, { carrierCode: "POST", serviceCode: "special" }), null);
});

test("payment retry refuses to silently reuse a quote after cart lines or prices change", () => {
  const ordered = [
    { productId: "oil", quantity: 2, unitPriceRials: 1_000_000 },
    { productId: "filter", quantity: 1, unitPriceRials: 300_000 },
  ];
  assert.equal(pendingOrderCartMatches(ordered, [...ordered].reverse()), true);
  assert.equal(pendingOrderCartMatches(ordered, [{ ...ordered[0], quantity: 3 }, ordered[1]]), false);
  assert.equal(pendingOrderCartMatches(ordered, [{ ...ordered[0], unitPriceRials: 1_100_000 }, ordered[1]]), false);
});

test("shipment creation claim allows explicit retry but blocks duplicate and ambiguous submission", () => {
  assert.equal(canClaimShipmentCreation({ status: "READY_TO_SHIP", externalShipmentId: null }), true);
  assert.equal(canClaimShipmentCreation({ status: "FAILED", externalShipmentId: null }), true);
  assert.equal(canClaimShipmentCreation({ status: "SUBMITTING", externalShipmentId: null }), false);
  assert.equal(canClaimShipmentCreation({ status: "UNKNOWN", externalShipmentId: null }), false);
  assert.equal(canClaimShipmentCreation({ status: "FAILED", externalShipmentId: "external-1" }), false);
});

test("ambiguous shipment creates stay non-retryable until reconciliation", () => {
  assert.equal(shipmentCreateFailureStatus({ providerAccepted: false, outcomeUnknown: false }), "FAILED");
  assert.equal(shipmentCreateFailureStatus({ providerAccepted: false, outcomeUnknown: true }), "UNKNOWN");
  assert.equal(shipmentCreateFailureStatus({ providerAccepted: true, outcomeUnknown: false }), "UNKNOWN");

  assert.equal(canReconcileShipmentTracking("SUBMITTING"), true);
  assert.equal(canReconcileShipmentTracking("UNKNOWN"), true);
  assert.equal(canReconcileShipmentTracking("DELIVERED"), true);
  assert.equal(canReconcileShipmentTracking("FAILED"), false);
  assert.equal(canReconcileShipmentTracking("CANCELLED"), false);

  assert.equal(shipmentStatusAfterTrackingSync("SUBMITTING"), "SUBMITTED");
  assert.equal(shipmentStatusAfterTrackingSync("UNKNOWN"), "SUBMITTED");
  assert.equal(shipmentStatusAfterTrackingSync("PICKED_UP"), "PICKED_UP");
  assert.equal(shipmentStatusAfterTrackingSync("IN_TRANSIT"), "IN_TRANSIT");
  assert.equal(shipmentStatusAfterTrackingSync("DELIVERED"), "DELIVERED");
});
