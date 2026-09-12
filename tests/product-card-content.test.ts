import test from "node:test";
import assert from "node:assert/strict";

import { formatProductCardPrice, getProductCardContent } from "../src/lib/product-card-content";
import { catalogProducts } from "../prisma/product-data/catalog-products";

test("card display converts rials to Persian Toman digits without changing stored amounts", () => {
  assert.equal(formatProductCardPrice(12_000_000), "۱٬۲۰۰٬۰۰۰");
  assert.equal(formatProductCardPrice(1_234_567), "۱۲۳٬۴۵۷");
});

test("approved Persia Sign card separates short title, model and exact pack size", () => {
  const product = { name: "اکتان بوستر پرشیا ساین Up to 5 حجم ۴۵۰ میلی‌لیتر", packagingSizeLit: 0.45 };
  assert.deepEqual(getProductCardContent(product), {
    title: "اکتان بوستر پرشیا ساین", model: "Up to 5", volume: "۴۵۰ میلی‌لیتر",
  });
  assert.equal(product.name, "اکتان بوستر پرشیا ساین Up to 5 حجم ۴۵۰ میلی‌لیتر");
});

test("exact named millilitre sizes override rounded database litre fields", () => {
  assert.equal(getProductCardContent({ name: "اکتان بوستر یونیوم BA-29EX حجم ۳۵۵ میلی‌لیتر", packagingSizeLit: "0.36" }).volume, "۳۵۵ میلی‌لیتر");
  assert.equal(getProductCardContent({ name: "احیاگر گیربکس زادو EX120 حجم ۸ میلی‌لیتر", packagingSizeLit: "0.01" }).volume, "۸ میلی‌لیتر");
});

test("oil model and safety-critical viscosity and API specifications stay visible", () => {
  assert.deepEqual(getProductCardContent({
    name: "روغن موتور ایدلوب MASTER TECH 5W-30 SN C3 حجم ۴ لیتر", viscosity: "5W-30", packagingSizeLit: 4,
  }), { title: "روغن موتور ایدلوب", model: "MASTER TECH 5W-30 SN C3", volume: "۴ لیتر" });
});

test("fallback sizes and custom names remain meaningful", () => {
  assert.deepEqual(getProductCardContent({ name: "فیلتر روغن", packagingSizeLit: null }), { title: "فیلتر روغن", model: null, volume: null });
  assert.equal(getProductCardContent({ name: "مکمل سوخت", packagingSizeLit: 0.25 }).volume, "۲۵۰ میلی‌لیتر");
  assert.equal(getProductCardContent({ name: "کولانت حجم اسمی ۴ لیتر", packagingSizeLit: 4 }).volume, "۴ لیتر");
});

test("all existing catalog cards keep every identity word and leave source names untouched", () => {
  for (const product of catalogProducts) {
    const original = product.name;
    const content = getProductCardContent(product);
    assert.ok(content.title.length > 0, product.slug);
    const normalized = (text: string) => text.replace(/حجم(?:\s+اسمی)?/g, "").replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]).replace(/\s/g, "");
    const reconstructed = [content.title, content.model, content.volume].filter(Boolean).join(" ");
    assert.equal(normalized(reconstructed), normalized(original), product.slug);
    assert.equal(product.name, original, product.slug);
  }
});
