const LOCAL_PATH_PATTERN = /^\/(?!\/)(?!.*(?:\.\.|\\))[A-Za-z0-9_\-./%]+$/;
const OILBAR_HOSTS = new Set(["oilbar.ir", "www.oilbar.ir", "api.oilbar.ir"]);

export const LOCAL_IMAGE_PLACEHOLDERS = {
  product: "/images/placeholders/product.svg",
  category: "/images/placeholders/category.svg",
  brand: "/images/placeholders/brand.svg",
  banner: "/images/placeholders/banner.svg",
  blog: "/images/placeholders/blog.svg",
  gallery: "/images/placeholders/image.svg",
  vehicle: "/vehicles/placeholders/car.svg",
  generic: "/images/placeholders/image.svg",
} as const;

export function isLocalAssetPath(value: string | null | undefined): value is string {
  return typeof value === "string" && LOCAL_PATH_PATTERN.test(value.trim());
}

export function isOilbarHostedUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    return OILBAR_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

export function isAllowedOilbarImageSource(value: string | null | undefined): boolean {
  return isLocalAssetPath(value) || isOilbarHostedUrl(value);
}

export function safeImageSrc(
  value: string | null | undefined,
  fallback: string | null = LOCAL_IMAGE_PLACEHOLDERS.generic,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (isLocalAssetPath(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (OILBAR_HOSTS.has(url.hostname)) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    // Invalid image sources should fall back to local placeholders.
  }

  return fallback;
}

export function localVehicleImagePathForSlug(slug: string | null | undefined) {
  const safeSlug = (slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!safeSlug) return LOCAL_IMAGE_PLACEHOLDERS.vehicle;
  const brand = safeSlug.split("-")[0] || "cars";
  return `/vehicles/${brand}/${safeSlug}.webp`;
}

export function safeVehicleImageSrc(value: string | null | undefined, slug: string | null | undefined) {
  if (!value) return null;
  if (isLocalAssetPath(value)) return value.trim();

  try {
    const url = new URL(value);
    if (url.hostname === "cdn-sth1.bama.ir") {
      return localVehicleImagePathForSlug(slug);
    }
    if (OILBAR_HOSTS.has(url.hostname)) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    // Invalid image sources should fall back to local placeholders.
  }

  return LOCAL_IMAGE_PLACEHOLDERS.vehicle;
}

export function safeAbsoluteImageUrl(
  value: string | null | undefined,
  baseUrl: string,
  fallback: string | null = null,
) {
  const safeSource = safeImageSrc(value, fallback);
  return safeSource ? new URL(safeSource, `${baseUrl.replace(/\/$/, "")}/`).toString() : undefined;
}
