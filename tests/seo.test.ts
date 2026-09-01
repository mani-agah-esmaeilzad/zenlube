import assert from "node:assert/strict";
import test from "node:test";

import { buildBreadcrumbStructuredData, buildProductStructuredData } from "@/lib/seo";

test("buildBreadcrumbStructuredData creates an ordered breadcrumb list", () => {
  assert.deepEqual(
    buildBreadcrumbStructuredData([
      { name: "خانه", url: "https://www.oilbar.ir" },
      { name: "فروشگاه", url: "https://www.oilbar.ir/products" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "خانه",
          item: "https://www.oilbar.ir",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "فروشگاه",
          item: "https://www.oilbar.ir/products",
        },
      ],
    },
  );
});

test("buildProductStructuredData adds real aggregate rating only when reviews exist", () => {
  const structuredData = buildProductStructuredData({
    averageRating: 4.6,
    baseUrl: "https://www.oilbar.ir/",
    brandName: "Shell",
    categoryName: "روغن موتور",
    description: "روغن موتور فول سنتتیک",
    imageUrl: "https://cdn.example.com/oil.jpg",
    inStock: true,
    name: "روغن موتور 5W-30",
    price: 1280000,
    reviewCount: 18,
    sku: "SH-530",
    slug: "shell-5w-30",
  });

  assert.deepEqual(structuredData.aggregateRating, {
    "@type": "AggregateRating",
    ratingValue: 4.6,
    reviewCount: 18,
    bestRating: 5,
    worstRating: 1,
  });
  assert.deepEqual(structuredData.offers, {
    "@type": "Offer",
    priceCurrency: "IRR",
    price: 1280000,
    availability: "https://schema.org/InStock",
    url: "https://www.oilbar.ir/products/shell-5w-30",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: "Oilbar",
    },
  });
});

test("buildProductStructuredData omits aggregate rating without real reviews", () => {
  const structuredData = buildProductStructuredData({
    baseUrl: "https://www.oilbar.ir",
    brandName: "Total",
    inStock: false,
    name: "روغن گیربکس",
    price: 980000,
    reviewCount: 0,
    slug: "total-gear-oil",
  });

  assert.equal("aggregateRating" in structuredData, false);
  assert.deepEqual(structuredData.offers, {
    "@type": "Offer",
    priceCurrency: "IRR",
    price: 980000,
    availability: "https://schema.org/OutOfStock",
    url: "https://www.oilbar.ir/products/total-gear-oil",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: "Oilbar",
    },
  });
});

test("buildProductStructuredData omits an offer until a real product price is set", () => {
  const structuredData = buildProductStructuredData({
    averageRating: null,
    baseUrl: "https://www.oilbar.ir",
    brandName: "ایدلوب",
    categoryName: "روغن موتور",
    description: "محصول در انتظار قیمت‌گذاری مدیر است.",
    imageUrl: "/products/aidlube/example.png",
    inStock: false,
    name: "روغن موتور ایدلوب",
    price: 0,
    reviewCount: 0,
    sku: "AID-TEST",
    slug: "aidlube-test",
  });

  assert.equal("offers" in structuredData, false);
});
