import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProductGalleryItems,
  buildProductQuickFacts,
  buildProductSpecRows,
  extractEnglishProductLabel,
} from "@/lib/product-detail";

type ProductArg = Parameters<typeof buildProductSpecRows>[0];

function createProduct(overrides: Partial<ProductArg> = {}): ProductArg {
  return {
    id: "prod_1",
    name: "روغن موتور ایدلوب مدل MASTER TECH 5W-30 SN C3 حجم چهار لیتر",
    slug: "aidlube-master-tech-5w30",
    sku: "AID-530-4L",
    description: "روغن موتور تمام سنتتیک برای موتورهای بنزینی.",
    price: "60000000" as unknown as ProductArg["price"],
    stock: 3,
    viscosity: "5W-30",
    oilType: "تمام سنتتیک",
    imageUrl: "https://example.com/main.webp",
    isFeatured: false,
    isBestseller: true,
    categoryId: "cat_1",
    brandId: "brand_1",
    originCountry: "آلمان",
    approvals: "API SN, ACEA C3",
    temperatureRange: "-30 تا +40",
    packagingSizeLit: "4" as unknown as ProductArg["packagingSizeLit"],
    warranty: "ضمانت اصالت کالا",
    technicalSpecs: {
      partNumber: "MT-530-4L",
      engineType: "بنزینی و دیزلی",
      gallery: ["https://example.com/detail-1.webp"],
    },
    tags: [],
    averageRating: "4.7" as unknown as ProductArg["averageRating"],
    reviewCount: 28,
    reorderThreshold: 10,
    videos: ["https://example.com/detail-2.webp", "https://example.com/video.mp4"],
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: {
      id: "brand_1",
      name: "ایدلوب",
      slug: "aidlube",
      description: null,
      imageUrl: null,
      website: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    category: {
      id: "cat_1",
      name: "روغن موتور",
      slug: "engine-oil",
      description: null,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    carMappings: [
      {
        id: "mapping_1",
        productId: "prod_1",
        carId: "car_1",
        note: "برای موتور 1.5 توربو مناسب است.",
        createdAt: new Date(),
        car: {
          id: "car_1",
          slug: "mg-gt",
          manufacturer: "ام جی",
          model: "GT",
          isActive: true,
          generation: "توربو",
          engineCode: "15T",
          engineType: "1.5 لیتر توربو",
          yearFrom: 2023,
          yearTo: 2024,
          oilCapacityLit: null,
          viscosity: null,
          specification: null,
          imageUrl: null,
          overviewDetails: null,
          engineDetails: null,
          gearboxDetails: null,
          maintenanceInfo: null,
          notebookSections: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
    ...overrides,
  };
}

test("extractEnglishProductLabel returns the latin model fragment", () => {
  assert.equal(
    extractEnglishProductLabel("روغن موتور ایدلوب مدل MASTER TECH 5W-30 SN C3 حجم چهار لیتر"),
    "MASTER TECH 5W-30 SN C3",
  );
});

test("buildProductSpecRows returns ordered real specs and flattens technical specs", () => {
  const rows = buildProductSpecRows(createProduct());

  assert.deepEqual(rows.slice(0, 5), [
    { label: "برند", value: "ایدلوب" },
    { label: "دسته‌بندی", value: "روغن موتور" },
    { label: "گرانروی SAE", value: "5W-30" },
    { label: "حجم", value: "۴ لیتر" },
    { label: "نوع محصول", value: "تمام سنتتیک" },
  ]);
  assert.equal(rows.some((row) => row.label === "شماره فنی" && row.value === "MT-530-4L"), true);
});

test("buildProductQuickFacts includes compatible car count without inventing data", () => {
  const facts = buildProductQuickFacts(createProduct());
  assert.equal(facts.some((fact) => fact.label === "خودروهای سازگار" && fact.value.includes("ام جی GT")), true);
});

test("buildProductGalleryItems collects unique image urls only", () => {
  const items = buildProductGalleryItems(createProduct());
  assert.deepEqual(
    items.map((item) => item.src),
    [
      "https://example.com/main.webp",
      "https://example.com/detail-2.webp",
      "https://example.com/detail-1.webp",
    ],
  );
});
