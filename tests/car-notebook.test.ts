import test from "node:test";
import assert from "node:assert/strict";

import { buildNotebookData, buildNotebookProductPanels } from "@/lib/car-notebook";
import type { ProductWithRelations } from "@/types/catalog";

function createNotebookProduct(overrides: Partial<ProductWithRelations> & {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  brandName?: string;
}): ProductWithRelations {
  const now = new Date();

  return {
    id: overrides.id,
    slug: overrides.slug,
    name: overrides.name,
    description: "محصول تستی سازگار با خودرو",
    sku: `${overrides.slug}-sku`,
    price: "1000000" as unknown as ProductWithRelations["price"],
    stock: 3,
    viscosity: null,
    oilType: null,
    imageUrl: null,
    isFeatured: false,
    isBestseller: false,
    categoryId: `cat-${overrides.categorySlug}`,
    brandId: `brand-${overrides.categorySlug}`,
    originCountry: null,
    approvals: null,
    temperatureRange: null,
    packagingSizeLit: null,
    warranty: null,
    technicalSpecs: null,
    tags: [],
    averageRating: "4.5" as unknown as ProductWithRelations["averageRating"],
    reviewCount: 12,
    reorderThreshold: 0,
    videos: [],
    createdAt: now,
    updatedAt: now,
    brand: {
      id: `brand-${overrides.categorySlug}`,
      name: overrides.brandName ?? "برند تست",
      slug: `brand-${overrides.categorySlug}`,
      description: null,
      imageUrl: null,
      website: null,
      createdAt: now,
      updatedAt: now,
    },
    category: {
      id: `cat-${overrides.categorySlug}`,
      name: overrides.categoryName,
      slug: overrides.categorySlug,
      description: null,
      imageUrl: null,
      createdAt: now,
      updatedAt: now,
    },
    carMappings: [],
    ...overrides,
  } as ProductWithRelations;
}

test("buildNotebookData keeps engine oil and gearbox sections separated", () => {
  const notebook = buildNotebookData({
    title: "ام جی 360",
    years: "2016 تا 2018",
    oilCapacity: "۴.۱ لیتر",
    car: {
      manufacturer: "ام جی",
      model: "360",
      viscosity: "5W-30",
      specification: "API SN",
      engineDetails: [
        "ویسکوزیته پیشنهادی روغن موتور: 5W-30",
        "استاندارد روغن موتور: API SN",
      ].join("\n"),
      gearboxDetails: [
        "نوع گیربکس: اتومات",
        "سطح کیفیت روغن گیربکس: ATF AW-1",
      ].join("\n"),
      maintenanceInfo: "روغن گیربکس هر ۴۰٬۰۰۰ کیلومتر تعویض شود.",
      notebookSections: [
        {
          categoryId: 1,
          id: "engine-oil",
          title: "روغن موتور",
          tag: "روانکار",
          sourceTitle: "روغن موتور",
          description: "ویسکوزیته پیشنهادی روغن موتور: 5W-30",
          sourceUrl: "https://example.com/engine",
        },
        {
          categoryId: 3,
          id: "gearbox-oil",
          title: "روغن گیربکس",
          tag: "گیربکس",
          sourceTitle: "روغن گیربکس",
          description: "نوع گیربکس: اتومات\nسطح کیفیت روغن گیربکس: ATF AW-1",
          sourceUrl: "https://example.com/gearbox",
        },
      ],
    },
    maintenanceTasks: [
      {
        id: "task_1",
        title: "تعویض روغن گیربکس",
        intervalKm: 40000,
        intervalMonths: null,
        priority: 1,
      },
    ],
    recommendedProductsCount: 2,
  });

  const enginePage = notebook.pages.find((page) => page.id === "engine-oil");
  const gearboxPage = notebook.pages.find((page) => page.id === "gearbox-oil");

  assert.ok(enginePage);
  assert.ok(gearboxPage);
  assert.equal(enginePage?.highlights?.find((item) => item.label === "ویسکوزیته")?.value, "5W-30");
  assert.equal(gearboxPage?.highlights?.find((item) => item.label === "نوع گیربکس")?.value, "اتومات");
  assert.equal(gearboxPage?.highlights?.some((item) => item.label === "روغن موتور"), false);
  assert.equal(notebook.pages.some((page) => page.id === "maintenance"), false);
});

test("buildNotebookProductPanels maps products to the matching notebook category only", () => {
  const pages = [
    {
      id: "engine-oil",
      title: "روغن موتور",
      description: "اطلاعات روغن موتور",
      tag: "روانکار",
    },
    {
      id: "gearbox-oil",
      title: "روغن گیربکس",
      description: "اطلاعات روغن گیربکس",
      tag: "گیربکس",
    },
    {
      id: "fuel-filter",
      title: "فیلتر بنزین",
      description: "اطلاعات فیلتر بنزین",
      tag: "سوخت",
    },
  ];

  const panels = buildNotebookProductPanels({
    carSlug: "mg-360",
    carName: "ام جی 360",
    pages,
    products: [
      createNotebookProduct({
        id: "prod_engine",
        slug: "engine-oil-test",
        name: "روغن موتور تست",
        categorySlug: "engine-oil",
        categoryName: "روغن موتور",
      }),
      createNotebookProduct({
        id: "prod_gear",
        slug: "gear-oil-test",
        name: "روغن گیربکس تست",
        categorySlug: "gear-oil",
        categoryName: "روغن گیربکس",
      }),
      createNotebookProduct({
        id: "prod_air",
        slug: "air-filter-test",
        name: "فیلتر هوا تست",
        categorySlug: "air-filter",
        categoryName: "فیلتر هوا",
      }),
    ],
  });

  const enginePanel = panels.find((panel) => panel.pageId === "engine-oil");
  const gearboxPanel = panels.find((panel) => panel.pageId === "gearbox-oil");
  const fuelFilterPanel = panels.find((panel) => panel.pageId === "fuel-filter");

  assert.deepEqual(enginePanel?.products.map((product) => product.slug), ["engine-oil-test"]);
  assert.deepEqual(gearboxPanel?.products.map((product) => product.slug), ["gear-oil-test"]);
  assert.equal(fuelFilterPanel?.hasCatalogCategory, false);
  assert.equal(fuelFilterPanel?.products.length, 0);
});
