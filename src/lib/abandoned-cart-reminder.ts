export type AbandonedCartReminderEligibilityInput = {
  status: string;
  lastActivityAt: Date;
  hasPhone: boolean;
  hasAvailableItems: boolean;
  latestOrderAt?: Date | null;
  now?: Date;
};

export function isAbandonedCartReminderEligible(input: AbandonedCartReminderEligibilityInput) {
  const now = input.now ?? new Date();
  const hasCartStatus = ["CART_ACTIVE", "CHECKOUT_ACTIVE", "CART_ABANDONED", "CHECKOUT_ABANDONED"].includes(input.status);
  const customerOrderedAfterCartActivity = Boolean(
    input.latestOrderAt && input.latestOrderAt.getTime() >= input.lastActivityAt.getTime(),
  );

  return hasCartStatus && input.hasPhone && input.hasAvailableItems && !customerOrderedAfterCartActivity && now.getTime() >= input.lastActivityAt.getTime();
}

export function buildAbandonedCartReminderMessage(customerName: string | null | undefined, cartUrl: string) {
  const firstName = customerName?.trim().split(/\s+/)[0]?.replace(/[^\p{L}\p{M}'’-]/gu, "") || "همراه";
  return `${firstName} عزیز، سبد خریدت در اویل‌بار هنوز منتظرته. اگر هنوز قصد خرید داری، از اینجا ادامه بده: ${cartUrl}`;
}
