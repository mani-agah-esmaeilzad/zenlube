import type { Metadata } from "next";

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
};

type ProductPageMetadataInput = {
  baseUrl: string;
  description?: string | null;
  imageUrl?: string | null;
  name: string;
  slug: string;
};

function normalizeBaseUrl(baseUrl: string) {
  const trimmedBaseUrl = baseUrl.replace(/\/$/, "");

  try {
    const url = new URL(trimmedBaseUrl);
    if (url.hostname === "oilbar.ir") url.hostname = "www.oilbar.ir";
    return url.toString().replace(/\/$/, "");
  } catch {
    return trimmedBaseUrl;
  }
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
  const description = input.description?.trim() || undefined;
  const imageUrl = input.imageUrl
    ? new URL(input.imageUrl, `${baseUrl}/`).toString()
    : undefined;
  const images = imageUrl ? [{ url: imageUrl, alt: input.name }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: productUrl },
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
  const productUrl = `${baseUrl}/products/${input.slug}`;

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: input.brandName,
    },
  };

  if (Number.isFinite(input.price) && input.price > 0) {
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
    structuredData.description = input.description;
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
