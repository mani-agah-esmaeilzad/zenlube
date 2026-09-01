import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";

import { catalogProducts } from "../prisma/product-data/catalog-products";

const productsBySlug = new Map(catalogProducts.map((product) => [product.slug, product]));

function countsBy(field: "categorySlug" | "brandSlug") {
  return catalogProducts.reduce<Record<string, number>>((counts, product) => {
    counts[product[field]] = (counts[product[field]] ?? 0) + 1;
    return counts;
  }, {});
}

test("complete requested catalog contains 122 unique products", () => {
  assert.equal(catalogProducts.length, 122);
  assert.equal(new Set(catalogProducts.map((product) => product.slug)).size, 122);
  assert.equal(new Set(catalogProducts.map((product) => product.sku)).size, 122);

  assert.deepEqual(countsBy("categorySlug"), {
    "engine-oil": 34,
    "gear-oil": 41,
    accessories: 44,
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
    "persia-sign": 1,
  };
  assert.deepEqual(countsBy("brandSlug"), expected);
});

test("ambiguous labels are normalized without creating duplicate products", () => {
  assert.equal(catalogProducts.filter((product) => product.brandSlug === "persia-sign").length, 1);
  assert.ok(productsBySlug.has("bareliz-atf-dct-1l"));
  assert.ok(productsBySlug.has("fosser-dexron-d-vi-1l"));
  assert.ok(productsBySlug.has("xado-atomic-atf-3-4-5-1l"));
  assert.equal(catalogProducts.some((product) => /\bdat\b/i.test(product.name)), false);
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
