export const UNIUM_INITIAL_COMMERCE = {
  priceRials: 10_000_000,
  stock: 1,
  shippingWeightGrams: 500,
} as const;

export type UniumStoredCommerce = {
  priceRials: number;
  stock: number;
  shippingWeightGrams: number | null;
};

/**
 * The catalog seed deliberately creates new products without sale data. Only
 * that exact placeholder state is safe for this product-specific seed to
 * initialize. Once any commerce field has been set, later runs must leave all
 * three fields under admin control.
 */
export function isUniumCatalogPlaceholder(commerce: UniumStoredCommerce): boolean {
  return (
    commerce.priceRials === 0 &&
    commerce.stock === 0 &&
    commerce.shippingWeightGrams === null
  );
}
