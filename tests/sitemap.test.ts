import assert from "node:assert/strict";
import test from "node:test";

import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";
import nextConfig from "../next.config";

test("sitemap includes the entire visible catalog and canonical category and brand collections", async (t) => {
  const updatedAt = new Date("2026-09-12T00:00:00Z");
  const products = Array.from({ length: 123 }, (_, index) => ({ slug: `product-${index}`, updatedAt, categoryId: "category-1", brandId: "brand-1" }));
  let productQuery: unknown;
  const delegates = [prisma.product, prisma.category, prisma.brand, prisma.car, prisma.blogPost];
  const originals = delegates.map(delegate => delegate.findMany);
  t.after(() => delegates.forEach((delegate, index) => Object.assign(delegate, { findMany: originals[index] })));
  Object.assign(prisma.product, { findMany: async (args: unknown) => { productQuery = args; return products; } });
  Object.assign(prisma.category, { findMany: async () => [{ id: "category-1", slug: "engine-oil", updatedAt }] });
  Object.assign(prisma.brand, { findMany: async () => [{ id: "brand-1", slug: "aidlube", updatedAt }] });
  Object.assign(prisma.car, { findMany: async () => [{ slug: "mg6", updatedAt }] });
  Object.assign(prisma.blogPost, { findMany: async () => [{ slug: "oil-guide", updatedAt }] });

  const entries = await sitemap();
  assert.equal(entries.filter(entry => entry.url.startsWith(`${SITE_URL}/products/`)).length, 123);
  assert.equal(entries.length, new Set(entries.map(entry => entry.url)).size);
  assert.ok(entries.some(entry => entry.url === `${SITE_URL}/products?category=engine-oil`));
  assert.ok(entries.some(entry => entry.url === `${SITE_URL}/products?brand=aidlube`));
  assert.ok(entries.some(entry => entry.url === `${SITE_URL}/cars/mg6`));
  for (const hub of ["mg-360", "mg-5", "mg-6", "mg-gs", "mg-rx5"]) {
    assert.ok(entries.some(entry => entry.url === `${SITE_URL}/cars/${hub}`), `Missing MG hub: ${hub}`);
  }
  assert.equal(entries.some(entry => entry.url.includes("/categories/")), false, "Do not submit redirect-only category URLs");
  const queryJson = JSON.stringify(productQuery);
  assert.match(queryJson, /deleted-/);
  assert.equal(/"(?:take|skip|price|stock)"/.test(queryJson), false, "Sitemap must not truncate or hide unavailable products");
});

test("collection sitemap dates follow real product updates without extra per-collection queries", async (t) => {
  const older = new Date("2026-08-01T00:00:00Z");
  const newer = new Date("2026-09-10T00:00:00Z");
  const newest = new Date("2026-09-11T00:00:00Z");
  const delegates = [prisma.product, prisma.category, prisma.brand, prisma.car, prisma.blogPost];
  const originals = delegates.map(delegate => delegate.findMany);
  t.after(() => delegates.forEach((delegate, index) => Object.assign(delegate, { findMany: originals[index] })));
  let queries = 0;
  const results = [
    [{ slug: "oil", updatedAt: newer, categoryId: "engine", brandId: "aidlube" }],
    [{ id: "engine", slug: "engine-oil", updatedAt: older }],
    [{ id: "aidlube", slug: "aidlube", updatedAt: older }, { id: "new-brand", slug: "new-brand", updatedAt: newest }],
    [],
    [],
  ];
  delegates.forEach((delegate, index) => Object.assign(delegate, { findMany: async () => { queries++; return results[index]; } }));
  const entries = await sitemap();
  for (const path of ["/products", "/products/oil", "/products?category=engine-oil", "/products?brand=aidlube"]) {
    assert.equal(entries.find(entry => entry.url === `${SITE_URL}${path}`)?.lastModified, newer, path);
  }
  assert.equal(entries.find(entry => entry.url === `${SITE_URL}/products?brand=new-brand`)?.lastModified, newest);
  assert.equal(entries.find(entry => entry.url === SITE_URL)?.lastModified, undefined, "Do not fabricate today's date for unchanged static content");
  assert.equal(queries, 5);
});

test("robots advertises the canonical sitemap and preserves Torob feed access", () => {
  const data = robots();
  assert.equal(data.sitemap, `${SITE_URL}/sitemap.xml`);
  assert.equal(data.host, SITE_URL);
  assert.ok(JSON.stringify(data.rules).includes("/api/torob/products"));
  assert.equal(JSON.stringify(data.rules).includes("/sign-in"), false, "Google must be allowed to read the private page noindex directive");
});

test("private pages and public feeds are not indexable without blocking product discovery", async () => {
  const headers = await nextConfig.headers?.();
  const signIn = headers?.find(rule => rule.source === "/sign-in");
  assert.deepEqual(signIn?.headers, [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]);
  const torobFeed = headers?.find(rule => rule.source === "/api/:path*");
  assert.deepEqual(torobFeed?.headers, [{ key: "X-Robots-Tag", value: "noindex, follow" }]);
  assert.equal(headers?.some(rule => rule.source === "/products/:path*"), false);
});
