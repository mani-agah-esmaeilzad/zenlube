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
  assert.throws(() => parseTorobProductRequest({ page: 1 }), /sort parameter/);
  assert.throws(() => parseTorobProductRequest({}), /page parameter/);
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
  assert.equal(product.spec["گرانروی"], "5W-30");
  assert.match(product.date_added, /\+03:30$/);
  assert.equal(rialToTorobToman(1_234_567), 123_457);
  assert.equal(buildTorobResponse([product], 1, 1).api_version, "torob_api_v3");
});
