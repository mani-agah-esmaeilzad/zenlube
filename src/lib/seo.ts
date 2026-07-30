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

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
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
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: Math.round(input.price),
      availability: input.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (input.description) {
    structuredData.description = input.description;
  }

  if (input.imageUrl) {
    structuredData.image = [input.imageUrl];
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
