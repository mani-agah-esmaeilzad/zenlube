export const CHECKOUT_ACTIVE_WINDOW_MS = 15 * 60 * 1000;
export const CART_ACTIVE_WINDOW_MS = 30 * 60 * 1000;

export type CartActivityStatus =
  | "CHECKOUT_ACTIVE"
  | "CHECKOUT_ABANDONED"
  | "CART_ACTIVE"
  | "CART_ABANDONED";

export type CartActivitySnapshot = {
  lastCartSeenAt?: Date | null;
  checkoutStartedAt?: Date | null;
  checkoutLastSeenAt?: Date | null;
  latestItemUpdatedAt?: Date | null;
};

function isRecent(value: Date | null | undefined, cutoff: number) {
  return Boolean(value && value.getTime() >= cutoff);
}

export function getLatestCartActivity(snapshot: CartActivitySnapshot) {
  const candidates = [
    snapshot.checkoutLastSeenAt,
    snapshot.lastCartSeenAt,
    snapshot.latestItemUpdatedAt,
    snapshot.checkoutStartedAt,
  ].filter((value): value is Date => Boolean(value));

  return candidates.length
    ? new Date(Math.max(...candidates.map((value) => value.getTime())))
    : null;
}

export function classifyCartActivity(snapshot: CartActivitySnapshot, now = new Date()): CartActivityStatus {
  const checkoutCutoff = now.getTime() - CHECKOUT_ACTIVE_WINDOW_MS;
  const cartCutoff = now.getTime() - CART_ACTIVE_WINDOW_MS;

  if (isRecent(snapshot.checkoutLastSeenAt, checkoutCutoff)) {
    return "CHECKOUT_ACTIVE";
  }

  if (snapshot.checkoutStartedAt) {
    return "CHECKOUT_ABANDONED";
  }

  if (isRecent(snapshot.lastCartSeenAt, cartCutoff) || isRecent(snapshot.latestItemUpdatedAt, cartCutoff)) {
    return "CART_ACTIVE";
  }

  return "CART_ABANDONED";
}
