export const PERSIA_SIGN_PACK_INITIAL_COMMERCE = {
  "persia-sign-up-to-5-octane-booster-450ml-pack-2": {
    priceRials: 29_000_000,
    stock: 1,
    shippingWeightGrams: 1_200,
  },
  "persia-sign-up-to-5-octane-booster-450ml-pack-3": {
    priceRials: 42_000_000,
    stock: 1,
    shippingWeightGrams: 1_800,
  },
  "persia-sign-up-to-5-octane-booster-450ml-pack-4": {
    priceRials: 54_000_000,
    stock: 1,
    shippingWeightGrams: 2_400,
  },
} as const;

export type PersiaSignPackSlug = keyof typeof PERSIA_SIGN_PACK_INITIAL_COMMERCE;

export function isPersiaSignPackCatalogPlaceholder({
  priceRials,
  stock,
  shippingWeightGrams,
}: {
  priceRials: number;
  stock: number;
  shippingWeightGrams: number | null;
}) {
  return priceRials === 0 && stock === 0 && shippingWeightGrams === null;
}
