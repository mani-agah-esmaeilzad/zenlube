import { revalidatePath } from "next/cache";

const STOREFRONT_CATALOG_PATHS = ["/", "/products", "/brands", "/categories", "/cars"] as const;
const STOREFRONT_ACCOUNT_PATHS = ["/cart", "/cart/checkout", "/account"] as const;

function revalidatePaths(paths: Iterable<string>) {
  for (const path of new Set(paths)) {
    revalidatePath(path);
  }
}

export function revalidateAdminSurface() {
  revalidatePath("/admin");
}

export function revalidateStorefrontCatalog() {
  revalidatePaths(STOREFRONT_CATALOG_PATHS);
}

export function revalidateStorefrontContent() {
  revalidatePaths(["/", "/blog"]);
}

export function revalidateStorefrontCategory(categorySlugs: Array<string | null | undefined> = []) {
  revalidatePaths([
    ...STOREFRONT_CATALOG_PATHS,
    ...categorySlugs.filter(Boolean).map((slug) => `/categories/${slug}`),
  ]);
}

export function revalidateStorefrontBrand(brandSlugs: Array<string | null | undefined> = []) {
  revalidatePaths([
    ...STOREFRONT_CATALOG_PATHS,
    ...brandSlugs.filter(Boolean).map((slug) => `/brands/${slug}`),
  ]);
}

export function revalidateStorefrontProduct(input: {
  brandSlugs?: Array<string | null | undefined>;
  carSlugs?: Array<string | null | undefined>;
  categorySlugs?: Array<string | null | undefined>;
  productSlugs?: Array<string | null | undefined>;
}) {
  revalidatePaths([
    ...STOREFRONT_CATALOG_PATHS,
    ...STOREFRONT_ACCOUNT_PATHS,
    ...(input.productSlugs ?? []).filter(Boolean).map((slug) => `/products/${slug}`),
    ...(input.categorySlugs ?? []).filter(Boolean).map((slug) => `/categories/${slug}`),
    ...(input.brandSlugs ?? []).filter(Boolean).map((slug) => `/brands/${slug}`),
    ...(input.carSlugs ?? []).filter(Boolean).map((slug) => `/cars/${slug}`),
  ]);
}
