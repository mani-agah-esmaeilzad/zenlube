import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";

import {
  aidlubeEngineOils,
  aidlubeManagedMgCarSlugs,
} from "../prisma/product-data/aidlube-engine-oils";
import { formatCatalogPrice, hasPublishedPrice } from "@/lib/utils";
import { productCreateSchema } from "@/lib/validators";

const productBySlug = new Map(aidlubeEngineOils.map((product) => [product.slug, product]));

test("AIDLUBE catalog contains the six requested, uniquely identifiable products", () => {
  assert.equal(aidlubeEngineOils.length, 6);
  assert.equal(new Set(aidlubeEngineOils.map((product) => product.slug)).size, 6);
  assert.equal(new Set(aidlubeEngineOils.map((product) => product.sku)).size, 6);

  for (const product of aidlubeEngineOils) {
    assert.equal(product.approvals.length > 0, true, product.slug);
    assert.equal(product.description.length > 100, true, product.slug);
    assert.equal(product.packagingSizeLit > 0, true, product.slug);
    assert.equal(
      existsSync(path.join(process.cwd(), "public", product.imageUrl.replace(/^\/+/, ""))),
      true,
      `Missing local image for ${product.slug}`,
    );
  }
});

test("MG mappings follow the strict SAE, API, ACEA and engine-family matrix", () => {
  const expected = new Map<string, string[]>([
    ["aidlube-master-tech-10w40-sn-a3-b4-4l", []],
    ["aidlube-high-max-10w40-sl-4l", []],
    ["aidlube-master-tech-5w30-sn-c3-4l", ["hyundai-62-mg-gs", "hyundai-68-mg-rx5"]],
    [
      "aidlube-master-select-5w40-sn-a3-b4-4l",
      ["hyundai-27-mg-550-1-8l-turbo", "hyundai-66-mg6-1-8t", "hyundai-67-mg6-new"],
    ],
    ["aidlube-eco-advance-0w20-sn-gf5-4l", []],
    ["aidlube-master-tech-5w30-sn-c3-5l", ["hyundai-62-mg-gs", "hyundai-68-mg-rx5"]],
  ]);

  const managedCars = new Set<string>(aidlubeManagedMgCarSlugs);
  for (const [slug, carSlugs] of expected) {
    const product = productBySlug.get(slug);
    assert.ok(product, slug);
    assert.deepEqual(
      product.carMappings.map((mapping) => mapping.carSlug),
      carSlugs,
      slug,
    );
    for (const carSlug of carSlugs) {
      assert.equal(managedCars.has(carSlug), true, carSlug);
      assert.notEqual(carSlug, "hyundai-1106-mg4-ev");
    }
  }
});

test("0W-20 SN/GF-5 is not presented as C5/SP or mapped to newer MG models", () => {
  const product = productBySlug.get("aidlube-eco-advance-0w20-sn-gf5-4l");
  assert.ok(product);
  assert.equal(product.approvals.includes("ILSAC GF-5"), true);
  assert.equal(product.approvals.includes("ACEA C5"), false);
  assert.equal(product.approvals.includes("API SP"), false);
  assert.deepEqual(product.carMappings, []);
});

test("admin product validation accepts repository-owned images but rejects traversal", () => {
  const baseProduct = {
    name: "روغن موتور ایدلوب",
    slug: "aidlube-test-oil",
    price: 0,
    stock: 0,
    imageUrl: "/products/aidlube/test-image.webp",
    categoryId: "cmqz8a22w0000k004y0gtq7pf",
    brandId: "cmqz9ek7w0001ie04jogiwppl",
  };

  assert.equal(productCreateSchema.safeParse(baseProduct).success, true);
  assert.equal(
    productCreateSchema.safeParse({ ...baseProduct, imageUrl: "/products/../secret.png" }).success,
    false,
  );
});

test("catalog price placeholder is used until the admin sets a positive price", () => {
  assert.equal(hasPublishedPrice(0), false);
  assert.equal(formatCatalogPrice(0), "قیمت در حال به‌روزرسانی");
  assert.equal(hasPublishedPrice("1250000"), true);
  assert.notEqual(formatCatalogPrice("1250000"), "قیمت در حال به‌روزرسانی");
});
