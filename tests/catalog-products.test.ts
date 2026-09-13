import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";

import { catalogProducts } from "../prisma/product-data/catalog-products";
import {
  isUniumCatalogPlaceholder,
  UNIUM_INITIAL_COMMERCE,
} from "../prisma/product-data/unium-seed-policy";
import {
  isPersiaSignPackCatalogPlaceholder,
  PERSIA_SIGN_PACK_INITIAL_COMMERCE,
} from "../prisma/product-data/persia-sign-pack-seed-policy";

const productsBySlug = new Map(catalogProducts.map((product) => [product.slug, product]));

function countsBy(field: "categorySlug" | "brandSlug") {
  return catalogProducts.reduce<Record<string, number>>((counts, product) => {
    counts[product[field]] = (counts[product[field]] ?? 0) + 1;
    return counts;
  }, {});
}

test("complete requested catalog contains 126 unique products", () => {
  assert.equal(catalogProducts.length, 126);
  assert.equal(new Set(catalogProducts.map((product) => product.slug)).size, 126);
  assert.equal(new Set(catalogProducts.map((product) => product.sku)).size, 126);

  assert.deepEqual(countsBy("categorySlug"), {
    "engine-oil": 34,
    "gear-oil": 41,
    accessories: 48,
    "brake-oil": 3,
  });
});

test("every product has complete content, a source and a repository image", () => {
  for (const product of catalogProducts) {
    assert.ok(product.name.length > 10, product.slug);
    assert.ok(product.description.length >= 100, product.slug);
    assert.ok(product.productSourceUrl.startsWith("http"), product.slug);
    assert.ok(Object.keys(product.technicalSpecs).length >= 5, product.slug);
    assert.equal(
      existsSync(path.join(process.cwd(), "public", product.imageUrl.replace(/^\/+/, ""))),
      true,
      `Missing image: ${product.imageUrl} (${product.slug})`,
    );
  }
});

test("brand quantities match the supplied inventory list", () => {
  const expected = {
    aidlube: 9,
    bareliz: 23,
    aisin: 4,
    fosser: 14,
    zic: 25,
    xado: 32,
    caspian: 12,
    woofer: 2,
    "persia-sign": 4,
    unium: 1,
  };
  assert.deepEqual(countsBy("brandSlug"), expected);
});

test("ambiguous labels are normalized without creating duplicate products", () => {
  assert.equal(catalogProducts.filter((product) => product.brandSlug === "persia-sign").length, 4);
  assert.ok(productsBySlug.has("bareliz-atf-dct-1l"));
  assert.ok(productsBySlug.has("fosser-dexron-d-vi-1l"));
  assert.ok(productsBySlug.has("xado-atomic-atf-3-4-5-1l"));
  assert.equal(catalogProducts.some((product) => /\bdat\b/i.test(product.name)), false);
});

test("Persia Sign economic packs have independent product identities", () => {
  const packSlugs = [
    "persia-sign-up-to-5-octane-booster-450ml-pack-2",
    "persia-sign-up-to-5-octane-booster-450ml-pack-3",
    "persia-sign-up-to-5-octane-booster-450ml-pack-4",
  ];

  for (const packSlug of packSlugs) {
    const product = productsBySlug.get(packSlug);
    assert.equal(product?.brandSlug, "persia-sign");
    assert.ok(product?.name.includes("پک"), packSlug);
    assert.equal(product?.imageUrl, `/products/persia-sign/up-to-5-450ml-pack-${packSlug.at(-1)}.webp`);
    assert.equal(product?.technicalSpecs["حجم هر عدد"], "۴۵۰ میلی‌لیتر");
  }
});

test("Persia Sign pack commerce values initialize only untouched catalog placeholders", () => {
  assert.deepEqual(PERSIA_SIGN_PACK_INITIAL_COMMERCE, {
    "persia-sign-up-to-5-octane-booster-450ml-pack-2": {
      priceRials: 29_000_000,
      stock: 1,
      shippingWeightGrams: 1_200,
    },
    "persia-sign-up-to-5-octane-booster-450ml-pack-3": {
      priceRials: 42_000_000,
      stock: 1,
      shippingWeightGrams: 1_800,
    },
    "persia-sign-up-to-5-octane-booster-450ml-pack-4": {
      priceRials: 54_000_000,
      stock: 1,
      shippingWeightGrams: 2_400,
    },
  });
  assert.equal(
    isPersiaSignPackCatalogPlaceholder({ priceRials: 0, stock: 0, shippingWeightGrams: null }),
    true,
  );
  assert.equal(
    isPersiaSignPackCatalogPlaceholder({ priceRials: 29_000_000, stock: 1, shippingWeightGrams: 1_200 }),
    false,
  );
});

test("Unium octane booster uses the official BA-29EX product identity", () => {
  const product = productsBySlug.get("unium-octane-booster-ba29ex-355ml");

  assert.equal(product?.brandSlug, "unium");
  assert.equal(product?.sku, "UNI-OCT-BA29EX-355");
  assert.equal(product?.imageUrl, "/products/unium/octane-booster-ba29ex-355ml.png");
  assert.equal(product?.technicalSpecs["حجم درج‌شده روی بسته"], "۳۵۵ میلی‌لیتر");
  assert.equal(product?.productSourceUrl, "https://www.petrosharlub.com/product/150");
});

test("Unium commerce values initialize only the untouched catalog placeholder", () => {
  assert.deepEqual(UNIUM_INITIAL_COMMERCE, {
    priceRials: 10_000_000,
    stock: 1,
    shippingWeightGrams: 500,
  });
  assert.equal(
    isUniumCatalogPlaceholder({ priceRials: 0, stock: 0, shippingWeightGrams: null }),
    true,
  );

  assert.equal(
    isUniumCatalogPlaceholder({ priceRials: 12_500_000, stock: 7, shippingWeightGrams: 540 }),
    false,
  );
  assert.equal(
    isUniumCatalogPlaceholder({ priceRials: 0, stock: 0, shippingWeightGrams: 620 }),
    false,
    "an admin-set shipping weight makes the row managed and must be preserved",
  );
});

test("MG product mappings are strict and exclude the electric MG4", () => {
  for (const product of catalogProducts) {
    const mappingSlugs = product.carMappings.map((mapping) => mapping.carSlug);
    assert.equal(new Set(mappingSlugs).size, mappingSlugs.length, product.slug);
    assert.equal(mappingSlugs.includes("hyundai-1106-mg4-ev"), false, product.slug);
  }

  assert.deepEqual(
    productsBySlug.get("zic-dctf-multi-1l")?.carMappings.map((mapping) => mapping.carSlug),
    ["hyundai-67-mg6-new", "hyundai-62-mg-gs", "hyundai-68-mg-rx5"],
  );
  assert.deepEqual(
    productsBySlug.get("aisin-afw-plus-4l")?.carMappings.map((mapping) => mapping.carSlug),
    ["hyundai-61-mg-350", "hyundai-27-mg-550-1-8l-turbo", "hyundai-66-mg6-1-8t"],
  );
});
