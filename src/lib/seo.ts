import type { Metadata } from "next";
import { getPaginationParams } from "./pagination";
import { cleanProductDescription } from "./product-description";

export const SITE_URL = "https://www.oilbar.ir";
export type SeoSearchParams = Record<string, string | string[] | undefined>;

type BreadcrumbStructuredDataItem = {
  name: string;
  url: string;
};

type ProductStructuredDataInput = {
  averageRating?: number | null;
  baseUrl: string;
  brandName: string;
  categoryName?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  inStock: boolean;
  name: string;
  price: number;
  reviewCount: number;
  sku?: string | null;
  slug: string;
  specifications?: Array<{ label: string; value: string }>;
};

type ProductPageMetadataInput = {
  baseUrl: string;
  description?: string | null;
  imageUrl?: string | null;
  name: string;
  slug: string;
};

export function normalizeBaseUrl(baseUrl: string) {
  const trimmedBaseUrl = baseUrl.replace(/\/$/, "");

  try {
    const url = new URL(trimmedBaseUrl);
    if (url.hostname === "oilbar.ir") url.hostname = "www.oilbar.ir";
    return url.toString().replace(/\/$/, "");
  } catch {
    return trimmedBaseUrl;
  }
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function summarizeSeoDescription(description: string, maxLength = 170) {
  const text = cleanProductDescription(description).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  const prefix = text.slice(0, maxLength - 1);
  const wordEnd = prefix.lastIndexOf(" ");
  return `${prefix.slice(0, wordEnd > maxLength / 2 ? wordEnd : prefix.length)}…`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  pathname: string;
  imageUrl?: string | null;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = new URL(input.pathname, `${SITE_URL}/`).toString();
  const description = summarizeSeoDescription(input.description);
  const images = input.imageUrl ? [{ url: new URL(input.imageUrl, `${SITE_URL}/`).toString(), alt: input.title }] : undefined;
  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    robots: { index: !input.noindex, follow: true },
    openGraph: { type: input.type ?? "website", locale: "fa_IR", siteName: "Oilbar", url, title: input.title, description, images },
    twitter: { card: images ? "summary_large_image" : "summary", title: input.title, description, images: images?.map(image => image.url) },
  };
}

/** Index primary collections; keep searches, sort orders and combined filters out of the index. */
export function buildCollectionMetadata(input: {
  pathname: string;
  title: string;
  description: string;
  searchParams: SeoSearchParams;
  defaultPageSize?: number;
  maxPageSize?: number;
  indexableFilter?: "category" | "brand";
}): Metadata {
  const { page, pageSize } = getPaginationParams(input.searchParams, {
    defaultPageSize: input.defaultPageSize ?? 12,
    maxPageSize: input.maxPageSize ?? 48,
  });
  const query = new URLSearchParams();
  const filterKeys = ["category", "brand", "car", "viscosity", "oilType", "search", "minPrice", "maxPrice", "minRating", "inStock", "manufacturer", "model"];
  const activeFilters = filterKeys.filter(key => {
    const value = input.searchParams[key];
    if (key === "inStock" && value !== "1") return false;
    return typeof value === "string" && value.trim().length > 0;
  });
  for (const key of activeFilters) query.set(key, (input.searchParams[key] as string).trim());
  const sort = input.searchParams.sort;
  const alternativeSort = typeof sort === "string" && sort !== "latest" && sort.length > 0;
  if (alternativeSort) query.set("sort", sort);
  if (page > 1) query.set("page", String(page));
  const alternativePageSize = pageSize !== (input.defaultPageSize ?? 12);
  if (alternativePageSize) query.set("pageSize", String(pageSize));
  const noindex = alternativeSort || alternativePageSize || activeFilters.some(key => key !== input.indexableFilter);
  return buildPageMetadata({
    title: page > 1 ? `${input.title} | صفحه ${page.toLocaleString("fa-IR")}` : input.title,
    description: input.description,
    pathname: `${input.pathname}${query.size ? `?${query}` : ""}`,
    noindex,
  });
}

export function buildStoreStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "@id": `${SITE_URL}/#organization`,
    name: "Oilbar",
    alternateName: "اویل‌بار",
    url: SITE_URL,
    logo: `${SITE_URL}/oilbar-logo-optimized.png`,
    telephone: "+989190810910",
    email: "support@oilbar.ir",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressRegion: "البرز",
      addressLocality: "کرج",
      streetAddress: "عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی، اتوسرویس مانی",
    },
  };
}

export function buildWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "اویل‌بار",
    alternateName: "Oilbar",
    url: SITE_URL,
    inLanguage: "fa-IR",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function buildArticleStructuredData(input: {
  title: string; slug: string; excerpt: string; authorName: string;
  publishedAt: Date; updatedAt: Date; coverImage?: string | null;
}) {
  const url = `${SITE_URL}/blog/${encodeURIComponent(input.slug)}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: input.title,
    description: summarizeSeoDescription(input.excerpt),
    inLanguage: "fa-IR",
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    author: { "@type": input.authorName === "تیم تحریریه Oilbar" ? "Organization" : "Person", name: input.authorName },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(input.coverImage ? { image: [new URL(input.coverImage, `${SITE_URL}/`).toString()] } : {}),
  };
}

export function buildCarPageMetadata(car: {
  slug: string; manufacturer: string; model: string; generation?: string | null;
  engineCode?: string | null; engineType?: string | null;
  yearFrom?: number | null; yearTo?: number | null;
  viscosity?: string | null; specification?: string | null;
}) {
  const identity = [car.manufacturer, car.model, car.generation, car.engineCode].filter(Boolean).join(" ");
  const years = car.yearFrom || car.yearTo ? ` (${[car.yearFrom, car.yearTo].filter(Boolean).join("–")})` : "";
  const electric = /برقی|الکتریکی|electric/i.test(car.engineType ?? "");
  return buildPageMetadata({
    pathname: `/cars/${encodeURIComponent(car.slug)}`,
    title: electric ? `دفترچه و نگهداری ${identity}${years} | اویل‌بار` : `روغن مناسب ${identity}${years} و دفترچه فنی | اویل‌بار`,
    description: electric
      ? `دفترچه و اطلاعات نگهداری ${identity}${years}؛ بررسی سیستم‌های خودرو و محصولات مصرفی مرتبط. این خودرو موتور تمام‌برقی دارد و روغن موتور احتراقی برای آن کاربرد ندارد.`
      : `راهنمای انتخاب روغن ${identity}${years}.${car.viscosity ? ` گرانروی ثبت‌شده: ${car.viscosity}.` : ""}${car.specification ? ` استاندارد: ${car.specification}.` : ""} حجم سرویس، اطلاعات گیربکس و محصولات سازگار را بررسی کنید.`,
  });
}

/**
 * Keeps product crawlers pinned to the current product's canonical URL and
 * primary image. Without product-level social metadata, image crawlers may
 * treat images from the related-products rail as gallery media.
 */
export function buildProductPageMetadata(input: ProductPageMetadataInput): Metadata {
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  const productUrl = `${baseUrl}/products/${encodeURIComponent(input.slug)}`;
  const title = `${input.name} | Oilbar`;
  const description = summarizeSeoDescription(input.description || `مشخصات، کاربرد و موجودی ${input.name} در فروشگاه اویل‌بار.`);
  const imageUrl = input.imageUrl
    ? new URL(input.imageUrl, `${baseUrl}/`).toString()
    : undefined;
  const images = imageUrl ? [{ url: imageUrl, alt: input.name }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: productUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName: "Oilbar",
      url: productUrl,
      title,
      description,
      images,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function buildBreadcrumbStructuredData(items: BreadcrumbStructuredDataItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductStructuredData(input: ProductStructuredDataInput) {
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  const productUrl = `${baseUrl}/products/${encodeURIComponent(input.slug)}`;

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: input.name,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: input.brandName,
    },
  };

  // Unavailable products have no visible price; do not advertise an old price to crawlers.
  if (input.inStock && Number.isFinite(input.price) && input.price > 0) {
    structuredData.offers = {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: Math.round(input.price),
      availability: input.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Oilbar",
      },
    };
  }

  if (input.description) {
    structuredData.description = cleanProductDescription(input.description);
  }

  if (input.imageUrl) {
    structuredData.image = [new URL(input.imageUrl, `${baseUrl}/`).toString()];
  }

  if (input.sku) {
    structuredData.sku = input.sku;
  }

  if (input.categoryName) {
    structuredData.category = input.categoryName;
  }

  if (input.specifications?.length) {
    structuredData.additionalProperty = input.specifications.map(row => ({ "@type": "PropertyValue", name: row.label, value: row.value }));
  }

  if (input.reviewCount > 0 && input.averageRating != null) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(input.averageRating.toFixed(1)),
      reviewCount: input.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return structuredData;
}
