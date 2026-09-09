import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";

import { GET, POST } from "@/app/api/torob/products/route";
import prisma from "@/lib/prisma";
import { buildTorobProduct } from "@/lib/torob";
import { queryTorobProducts } from "@/lib/torob-catalog";

type Product = Parameters<typeof buildTorobProduct>[0];
type Where = Record<string, unknown>;
type Query = { where?: Where; orderBy?: Record<string, "asc" | "desc">[]; skip?: number; take?: number };

function matches(product: Product, where: Where = {}): boolean {
  return Object.entries(where).every(([key, value]) => {
    if (key === "AND") return (value as Where[]).every((condition) => matches(product, condition));
    if (key === "NOT") return !matches(product, value as Where);
    const actual = product[key as keyof Product];
    if (!value || typeof value !== "object") return actual === value;
    const filter = value as { in?: unknown[]; startsWith?: string; gt?: number; not?: unknown };
    if (filter.in) return filter.in.includes(actual);
    if (filter.startsWith != null) return String(actual).startsWith(filter.startsWith);
    if (filter.gt != null) return Number(actual) > filter.gt;
    if ("not" in filter) return actual !== filter.not;
    throw new Error(`Unsupported test filter: ${key}`);
  });
}

function setupCatalog(t: TestContext) {
  // A full catalog spans two pages and deliberately includes unavailable,
  // unpriced and imageless entries with equal import timestamps.
  const products: Product[] = Array.from({ length: 123 }, (_, index) => ({
    id: `product-${String(index).padStart(3, "0")}`,
    slug: `oil-${index}`,
    name: `روغن ${index}`,
    price: index % 3 === 0 ? 0 : 1_000_000,
    stock: index % 2 === 0 ? 0 : 1,
    imageUrl: index % 5 === 0 ? null : `/products/oil-${index}.png`,
    brand: { name: "تست" },
    category: { name: "روغن موتور" },
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-09T00:00:00Z"),
  }));
  products.push({ ...products[0], id: "archived", slug: "deleted-archived", price: 1_000_000, stock: 1 });

  const original = { findMany: prisma.product.findMany, count: prisma.product.count, transaction: prisma.$transaction };
  Object.assign(prisma.product, {
    findMany: async ({ where, orderBy, skip = 0, take }: Query) => {
      const selected = products.filter((product) => matches(product, where));
      selected.sort((left, right) => {
        for (const sort of orderBy ?? []) {
          for (const [key, direction] of Object.entries(sort)) {
            const a = left[key as keyof Product];
            const b = right[key as keyof Product];
            const compared = String(a).localeCompare(String(b));
            if (compared) return direction === "desc" ? -compared : compared;
          }
        }
        return 0;
      });
      return selected.slice(skip, take == null ? undefined : skip + take);
    },
    count: async ({ where }: Query) => products.filter((product) => matches(product, where)).length,
  });
  Object.assign(prisma, { $transaction: async (queries: Promise<unknown>[]) => Promise.all(queries) });
  t.after(() => {
    Object.assign(prisma.product, { findMany: original.findMany, count: original.count });
    Object.assign(prisma, { $transaction: original.transaction });
  });
  return products;
}

test("Torob paginated catalog retains every visible product with stable page boundaries", async (t) => {
  setupCatalog(t);
  for (const sort of ["date_added_desc", "date_updated_desc"] as const) {
    const first = await queryTorobProducts({ type: "page", page: 1, sort });
    const second = await queryTorobProducts({ type: "page", page: 2, sort });
    const beyond = await queryTorobProducts({ type: "page", page: 3, sort });
    assert.equal(first.total, 123);
    assert.equal(second.total, 123);
    assert.equal(first.products.length, 100);
    assert.equal(second.products.length, 23);
    assert.equal(second.currentPage, 2);
    assert.equal(beyond.products.length, 0);
    const ids = [...first.products, ...second.products].map((product) => product.id);
    assert.equal(new Set(ids).size, 123);
    assert.equal(ids.includes("archived"), false);
    assert.deepEqual(ids, [...ids].sort().reverse());
    assert.ok(first.products.some((product) => product.stock === 0));
    assert.ok(first.products.some((product) => Number(product.price) === 0));
    assert.ok(first.products.some((product) => product.imageUrl == null));
  }
});

test("Torob direct lookups retain unavailable products and do not truncate identifier batches", async (t) => {
  const products = setupCatalog(t);
  const identifiers = products.map((product) => product.id);
  const result = await queryTorobProducts({ type: "uniques", values: identifiers });
  assert.equal(result.products.length, 123);
  assert.deepEqual(result.products.map((product) => product.id), identifiers.filter((id) => id !== "archived"));

  const byUrl = await queryTorobProducts({
    type: "urls",
    values: ["https://www.oilbar.ir/products/oil-0?source=torob", "https://www.oilbar.ir/products/deleted-archived", "invalid-url"],
  });
  assert.equal(byUrl.total, 1);
  assert.equal(byUrl.products[0].stock, 0);
  assert.equal(buildTorobProduct(byUrl.products[0], "https://www.oilbar.ir").availability, false);
  assert.equal((await queryTorobProducts({ type: "uniques", values: ["archived", "missing"] })).total, 0);
});

test("Torob public preview exposes both pages and rejects malformed pagination", async (t) => {
  setupCatalog(t);
  const response = await GET(new Request("https://www.oilbar.ir/api/torob/products?page=2&sort=date_added_desc"));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.current_page, 2);
  assert.equal(body.total, 123);
  assert.equal(body.max_pages, 2);
  assert.equal(body.products.length, 23);
  assert.match(response.headers.get("Cache-Control") ?? "", /no-store/);
  for (const query of ["page=0&sort=date_added_desc", "page=2", "sort=invalid"]) {
    assert.equal((await GET(new Request(`https://www.oilbar.ir/api/torob/products?${query}`))).status, 400);
  }
});

test("Torob sync still requires signed authentication before querying products", async () => {
  const response = await POST(new Request("https://www.oilbar.ir/api/torob/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: 1, sort: "date_added_desc" }),
  }));
  assert.equal(response.status, 401);
});
