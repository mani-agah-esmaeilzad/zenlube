export type ShippingQuoteSnapshot = {
  ownerUserId: string;
  selectedOrderId?: string | null;
  selectedOrderUserId?: string | null;
  status: string;
  currency: string;
  expiresAt: Date;
  fingerprint: string;
  cartId: string;
};

export type ShippingQuoteExpectation = {
  userId: string;
  orderId?: string;
  fingerprint?: string;
  cartId?: string;
  now?: Date;
};

export type ShippingServiceIdentity = {
  carrierCode: string;
  serviceCode: string;
};

export function findReplacementShippingOption<T extends ShippingServiceIdentity>(
  options: readonly T[],
  selected: ShippingServiceIdentity,
) {
  return options.find((option) =>
    option.carrierCode === selected.carrierCode && option.serviceCode === selected.serviceCode) ?? null;
}

export function pendingOrderCartMatches(
  orderItems: ReadonlyArray<{ productId: string; quantity: number; unitPriceRials: number }>,
  currentItems: ReadonlyArray<{ productId: string; quantity: number; unitPriceRials: number }>,
) {
  if (orderItems.length !== currentItems.length) return false;
  const currentByProduct = new Map(currentItems.map((item) => [item.productId, item]));
  return orderItems.every((item) => {
    const current = currentByProduct.get(item.productId);
    return Boolean(current && current.quantity === item.quantity && current.unitPriceRials === item.unitPriceRials);
  });
}

export function inspectShippingQuoteSnapshot(snapshot: ShippingQuoteSnapshot, expected: ShippingQuoteExpectation) {
  if (snapshot.ownerUserId !== expected.userId) {
    return { valid: false as const, code: "QUOTE_NOT_FOUND", message: "روش ارسال انتخاب‌شده معتبر نیست.", retryable: false };
  }
  if (snapshot.selectedOrderUserId && snapshot.selectedOrderUserId !== expected.userId) {
    return { valid: false as const, code: "QUOTE_USED", message: "این قیمت ارسال قبلاً استفاده شده است.", retryable: false };
  }
  if (snapshot.selectedOrderId && snapshot.selectedOrderId !== expected.orderId) {
    return { valid: false as const, code: "QUOTE_USED", message: "این قیمت ارسال قبلاً استفاده شده است.", retryable: false };
  }
  if (!["READY", "PARTIAL"].includes(snapshot.status) || snapshot.currency !== "IRR") {
    return { valid: false as const, code: "QUOTE_INVALID", message: "قیمت ارسال انتخاب‌شده معتبر نیست.", retryable: false };
  }
  if (snapshot.expiresAt <= (expected.now ?? new Date())) {
    return { valid: false as const, code: "QUOTE_EXPIRED", message: "اعتبار قیمت ارسال تمام شده؛ دوباره استعلام بگیرید.", retryable: true };
  }
  if ((expected.fingerprint && snapshot.fingerprint !== expected.fingerprint) || (expected.cartId && snapshot.cartId !== expected.cartId)) {
    return { valid: false as const, code: "QUOTE_STALE", message: "سبد یا آدرس تغییر کرده؛ قیمت ارسال را دوباره محاسبه کنید.", retryable: true };
  }
  return { valid: true as const };
}
