import { Prisma } from "@/generated/prisma";

export const STOREFRONT_ARCHIVED_PRODUCT_SLUG_PREFIX = "deleted-";

export function buildArchivedProductSlug(productId: string) {
  return `${STOREFRONT_ARCHIVED_PRODUCT_SLUG_PREFIX}${productId}`;
}

export function isArchivedProductSlug(slug: string | null | undefined) {
  return Boolean(slug?.startsWith(STOREFRONT_ARCHIVED_PRODUCT_SLUG_PREFIX));
}

export function isStorefrontVisibleProduct<T extends { slug: string | null | undefined }>(
  product: T | null | undefined,
): product is T {
  return Boolean(product && !isArchivedProductSlug(product.slug));
}

export function storefrontVisibleProductWhere(
  where: Prisma.ProductWhereInput = {},
): Prisma.ProductWhereInput {
  return {
    AND: [
      where,
      {
        NOT: {
          slug: {
            startsWith: STOREFRONT_ARCHIVED_PRODUCT_SLUG_PREFIX,
          },
        },
      },
      {
        price: {
          gt: 0,
        },
      },
    ],
  };
}

/** Products that still belong in the admin catalog, including items awaiting pricing. */
export function adminCatalogProductWhere(
  where: Prisma.ProductWhereInput = {},
): Prisma.ProductWhereInput {
  return {
    AND: [
      where,
      {
        NOT: {
          slug: {
            startsWith: STOREFRONT_ARCHIVED_PRODUCT_SLUG_PREFIX,
          },
        },
      },
    ],
  };
}

export function storefrontVisibleCarWhere(
  where: Prisma.CarWhereInput = {},
): Prisma.CarWhereInput {
  return {
    AND: [
      where,
      {
        isActive: true,
      },
    ],
  };
}
