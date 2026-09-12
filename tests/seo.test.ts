import assert from "node:assert/strict";
import test from "node:test";

import { buildArticleStructuredData, buildBreadcrumbStructuredData, buildCarPageMetadata, buildCollectionMetadata, buildPageMetadata, buildProductPageMetadata, buildProductStructuredData, buildStoreStructuredData, buildWebsiteStructuredData, serializeStructuredData, summarizeSeoDescription } from "@/lib/seo";
import { cleanProductDescription } from "@/lib/product-description";

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

test("buildProductStructuredData omits both fake ratings and hidden prices for unavailable products", () => {
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
  assert.equal("offers" in structuredData, false);
});

test("collection pagination is self-canonical and strips default and tracking parameters", () => {
  const metadata = buildCollectionMetadata({ pathname: "/products", title: "فروشگاه", description: "روانکار خودرو", searchParams: { page: "2", pageSize: "12", sort: "latest", utm_source: "instagram" }, maxPageSize: 12 });
  assert.equal(metadata.alternates?.canonical, "https://www.oilbar.ir/products?page=2");
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.match(String(metadata.title), /۲/);
});

test("single category and brand collections are indexable but combinations and searches are not", () => {
  const common = { pathname: "/products", title: "فروشگاه", description: "روانکار خودرو" };
  const category = buildCollectionMetadata({ ...common, searchParams: { category: "engine-oil", page: "3" }, indexableFilter: "category" });
  assert.equal(category.alternates?.canonical, "https://www.oilbar.ir/products?category=engine-oil&page=3");
  assert.deepEqual(category.robots, { index: true, follow: true });
  const brand = buildCollectionMetadata({ ...common, searchParams: { brand: "aidlube" }, indexableFilter: "brand" });
  assert.deepEqual(brand.robots, { index: true, follow: true });
  for (const params of [{ category: "engine-oil", brand: "aidlube" }, { search: "MG6" }, { sort: "price-asc" }, { inStock: "1" }, { viscosity: "5W-30" }, { pageSize: "24" }]) {
    assert.deepEqual(buildCollectionMetadata({ ...common, searchParams: params, indexableFilter: "category" }).robots, { index: false, follow: true });
  }
});

test("collection canonical normalizes invalid page and keeps non-default page sizes", () => {
  const common = { pathname: "/blog", title: "وبلاگ", description: "راهنما", defaultPageSize: 10, maxPageSize: 30 };
  for (const page of ["-2", "NaN", "0", "0.5", "1e300", "999999999999"]) {
    assert.equal(buildCollectionMetadata({ ...common, searchParams: { page } }).alternates?.canonical, "https://www.oilbar.ir/blog");
  }
  assert.equal(buildCollectionMetadata({ ...common, searchParams: { page: "2", pageSize: "20" } }).alternates?.canonical, "https://www.oilbar.ir/blog?page=2&pageSize=20");
});

test("website schema identifies the existing Persian brand on the canonical homepage", () => {
  const website = buildWebsiteStructuredData();
  assert.equal(website["@type"], "WebSite");
  assert.equal(website.name, "اویل‌بار");
  assert.equal(website.alternateName, "Oilbar");
  assert.equal(website.url, "https://www.oilbar.ir");
  assert.deepEqual(website.publisher, { "@id": "https://www.oilbar.ir/#organization" });
  assert.equal("potentialAction" in website, false, "Do not add obsolete sitelinks search box markup");
});

test("product descriptions remove import boilerplate but preserve customer information", () => {
  assert.equal(cleanProductDescription("اکتان بوستر برای کاهش ناک. این رکورد برای بسته حجم ۴۵۰ میلی‌لیتر ساخته شده و تصویر آن از محصول واقعی همین خانواده انتخاب شده است. طبق دوز روی بسته مصرف شود."), "اکتان بوستر برای کاهش ناک. طبق دوز روی بسته مصرف شود.");
  assert.equal(cleanProductDescription("ویسکوزیته 5W-30 و استاندارد ACEA C3."), "ویسکوزیته 5W-30 و استاندارد ACEA C3.");
  assert.equal(cleanProductDescription(null), "");
});

test("SEO summaries are bounded plain text and product metadata has a useful fallback", () => {
  const summary = summarizeSeoDescription(`<b>روغن موتور</b> ${"اطلاعات فنی محصول ".repeat(30)}`);
  assert.ok(summary.length <= 170);
  assert.equal(summary.includes("<b>"), false);
  assert.equal(summary.endsWith("…"), true);
  assert.ok(buildProductPageMetadata({ baseUrl: "https://www.oilbar.ir", name: "محصول", slug: "test" }).description);
});

test("JSON-LD cannot terminate its script tag even with merchant supplied text", () => {
  const value = { description: '</script><script>alert("x")</script>\u2028\u2029' };
  const json = serializeStructuredData(value);
  assert.equal(json.includes("<"), false);
  assert.deepEqual(JSON.parse(json), value);
});

test("schema keeps numeric prices in IRR and includes only visible technical facts", () => {
  const data = buildProductStructuredData({ baseUrl: "https://www.oilbar.ir", brandName: "ایدلوب", name: "روغن", slug: "روغن", inStock: true, price: 10_000_000, reviewCount: 0, specifications: [{ label: "گرانروی SAE", value: "5W-30" }] });
  assert.equal((data.offers as Record<string, unknown>).priceCurrency, "IRR");
  assert.equal((data.offers as Record<string, unknown>).price, 10_000_000);
  assert.equal(data.url, "https://www.oilbar.ir/products/%D8%B1%D9%88%D8%BA%D9%86");
  assert.deepEqual(data.additionalProperty, [{ "@type": "PropertyValue", name: "گرانروی SAE", value: "5W-30" }]);
});

test("car metadata differentiates engine and year and does not recommend engine oil for EVs", () => {
  const car = { slug: "mg6", manufacturer: "ام جی", model: "MG6", engineCode: "18K4G", yearFrom: 2012, yearTo: 2016, viscosity: "5W-30", specification: "API SN" };
  const metadata = buildCarPageMetadata(car);
  assert.match(String(metadata.title), /18K4G.*2012/);
  assert.match(metadata.description ?? "", /5W-30/);
  assert.equal(metadata.alternates?.canonical, "https://www.oilbar.ir/cars/mg6");
  const electric = buildCarPageMetadata({ ...car, model: "MG4", engineType: "تمام‌برقی" });
  assert.equal(String(electric.title).includes("روغن مناسب"), false);
  assert.equal(electric.description?.includes("5W-30"), false);
});

test("article and store schema use real author dates and existing public contact details", () => {
  const article = buildArticleStructuredData({ title: "راهنما", slug: "guide", excerpt: "انتخاب روغن", authorName: "تیم تحریریه Oilbar", publishedAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02"), coverImage: "/guide.webp" });
  assert.equal(article.datePublished, "2026-01-01T00:00:00.000Z");
  assert.deepEqual(article.image, ["https://www.oilbar.ir/guide.webp"]);
  assert.equal(article.author["@type"], "Organization");
  const store = buildStoreStructuredData();
  assert.equal(store.telephone, "+989190810910");
  assert.equal(store.address.addressLocality, "کرج");
  assert.equal(buildPageMetadata({ title: "تماس", description: "تماس", pathname: "/support" }).alternates?.canonical, "https://www.oilbar.ir/support");
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

test("buildProductPageMetadata exposes only the current product image to social crawlers", () => {
  const metadata = buildProductPageMetadata({
    baseUrl: "https://oilbar.ir/",
    description: "افزاینده اکتان و تمیزکننده سیستم سوخت",
    imageUrl: "/products/persia-sign/up-to-5-450ml-original.webp",
    name: "اکتان بوستر پرشیا ساین Up to 5",
    slug: "persia-sign-up-to-5-octane-booster-450ml",
  });

  const canonical = "https://www.oilbar.ir/products/persia-sign-up-to-5-octane-booster-450ml";
  const primaryImage = "https://www.oilbar.ir/products/persia-sign/up-to-5-450ml-original.webp";

  assert.equal(metadata.alternates?.canonical, canonical);
  assert.equal(metadata.openGraph?.url, canonical);
  assert.deepEqual(metadata.openGraph?.images, [
    { url: primaryImage, alt: "اکتان بوستر پرشیا ساین Up to 5" },
  ]);
  assert.deepEqual(metadata.twitter?.images, [primaryImage]);
});
