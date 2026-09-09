import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";

import {
  buildTorobProduct,
  buildTorobResponse,
  parseTorobProductRequest,
  rialToTorobToman,
  verifyTorobJwt,
} from "@/lib/torob";

function createToken(privateKey: ReturnType<typeof generateKeyPairSync>["privateKey"], payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "EdDSA", typ: "JWT", v: 1 })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const content = `${header}.${body}`;
  return `${content}.${sign(null, Buffer.from(content), privateKey).toString("base64url")}`;
}

test("Torob request parser accepts every official request shape and rejects missing sort", () => {
  assert.deepEqual(parseTorobProductRequest({ page: 2, sort: "date_updated_desc" }), { type: "page", page: 2, sort: "date_updated_desc" });
  assert.deepEqual(parseTorobProductRequest({ page_urls: ["https://www.oilbar.ir/products/a"] }), { type: "urls", values: ["https://www.oilbar.ir/products/a"] });
  assert.deepEqual(parseTorobProductRequest({ page_uniques: ["p1"] }), { type: "uniques", values: ["p1"] });
  assert.deepEqual(parseTorobProductRequest({ sort: "product_id_desc" }), { type: "cursor", sort: "product_id_desc" });
  assert.deepEqual(parseTorobProductRequest({ cursor: "opaque", sort: "product_id_desc" }), {
    type: "cursor",
    cursor: "opaque",
    sort: "product_id_desc",
  });
  assert.throws(() => parseTorobProductRequest({ page: 1 }), /sort parameter/);
  assert.throws(() => parseTorobProductRequest({}), /page parameter/);
  assert.throws(() => parseTorobProductRequest({ page: 1, sort: "product_id_desc" }), /must not include/);
  assert.throws(() => parseTorobProductRequest({ cursor: "opaque", sort: "date_added_desc" }), /require product_id_desc/);
});

test("Torob JWT verification validates Ed25519 signature, time, and exact audience", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const now = new Date("2026-09-01T12:00:00.000Z");
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const token = createToken(privateKey, { aud: "www.oilbar.ir", nbf: nowSeconds - 5, exp: nowSeconds + 60 });

  assert.equal(verifyTorobJwt(token, "www.oilbar.ir", { now, publicKey }).aud, "www.oilbar.ir");
  assert.throws(() => verifyTorobJwt(token, "oilbar.ir", { now, publicKey }), /دامنه/);
  assert.throws(() => verifyTorobJwt(token, "www.oilbar.ir", { now: new Date(now.getTime() + 120_000), publicKey }), /منقضی/);
});

test("Torob products use absolute URLs, integer Toman prices, discount, and required fields", () => {
  const product = buildTorobProduct({
    id: "prod_1",
    name: "روغن موتور تست",
    slug: "test-oil",
    description: "توضیح محصول",
    price: 2_000_000,
    stock: 5,
    imageUrl: "/products/test.png",
    viscosity: "5W-30",
    oilType: "تمام سنتتیک",
    packagingSizeLit: 4,
    warranty: null,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
    brand: { name: "Oilbar" },
    category: { name: "روغن موتور" },
    promotion: { isActive: true, kind: "SALE", specialPrice: 1_750_000 },
  }, "https://www.oilbar.ir", new Date("2026-09-01T12:00:00Z"));

  assert.equal(product.page_url, "https://www.oilbar.ir/products/test-oil");
  assert.deepEqual(product.image_links, ["https://www.oilbar.ir/products/test.png"]);
  assert.equal(product.current_price, 175_000);
  assert.equal(product.old_price, 200_000);
  assert.equal(product.availability, true);
  assert.equal(product.category_name, "روغن موتور خودرو");
  assert.equal(product.spec["گرانروی"], "5W-30");
  assert.match(product.date_added, /\+03:30$/);
  assert.equal(rialToTorobToman(1_234_567), 123_457);
  assert.equal(buildTorobResponse([product], 1, 1).api_version, "torob_api_v3");
  assert.deepEqual(buildTorobResponse([product], null, 2, null), {
    api_version: "torob_api_v3",
    current_page: 2,
    total: null,
    max_pages: null,
    next_cursor: null,
    products: [product],
  });
});

test("each Torob product exports only its own primary image", () => {
  const sharedFields = {
    description: null,
    price: 1_000_000,
    stock: 2,
    viscosity: null,
    oilType: null,
    packagingSizeLit: null,
    warranty: null,
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
    category: { name: "مکمل سوخت" },
  };
  const persiaSign = buildTorobProduct({
    ...sharedFields,
    id: "persia-sign",
    name: "اکتان بوستر پرشیا ساین",
    slug: "persia-sign-octane",
    imageUrl: "/products/persia-sign/octane.webp",
    brand: { name: "پرشیا ساین" },
  }, "https://www.oilbar.ir");
  const xado = buildTorobProduct({
    ...sharedFields,
    id: "xado",
    name: "اکتان بوستر زادو",
    slug: "xado-octane",
    imageUrl: "/products/xado/octane.jpg",
    brand: { name: "زادو" },
  }, "https://www.oilbar.ir");

  assert.deepEqual(persiaSign.image_links, ["https://www.oilbar.ir/products/persia-sign/octane.webp"]);
  assert.deepEqual(xado.image_links, ["https://www.oilbar.ir/products/xado/octane.jpg"]);
  assert.equal(persiaSign.image_links.includes(xado.image_links[0]), false);
});

test("Torob unavailable and unpriced products never expose a sale price or a free offer", () => {
  const product = {
    id: "unavailable-product",
    name: "اکتان تست",
    slug: "test-octane",
    price: 10_000_000,
    stock: 0,
    packagingSizeLit: 0.355,
    technicalSpecs: { weight: 0.5, count: 1, invalid: Number.NaN },
    imageUrl: "/products/test.png",
    brand: { name: "تست" },
    category: { name: "مکمل سوخت" },
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
    promotion: { isActive: true, specialPrice: 9_000_000 },
  };

  for (const values of [{ stock: 0 }, { stock: 1, price: 0 }, { stock: 1, price: 1 }]) {
    const result = buildTorobProduct({ ...product, ...values }, "https://www.oilbar.ir");
    assert.equal(result.availability, false);
    assert.equal(result.current_price, 0);
    assert.equal("old_price" in result, false);
    assert.equal(result.page_unique, product.id);
    assert.deepEqual(result.image_links, ["https://www.oilbar.ir/products/test.png"]);
    assert.equal(result.spec["حجم بسته‌بندی (لیتر)"], "0.355");
    assert.equal(result.spec.weight, "0.5");
    assert.equal(result.spec.count, 1);
    assert.equal("invalid" in result.spec, false);
  }
});
