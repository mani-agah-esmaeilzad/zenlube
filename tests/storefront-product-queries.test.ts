import assert from "node:assert/strict";
import test from "node:test";

import prisma from "@/lib/prisma";
import { getAllProductsWithFilters, getBestsellerProducts, getFeaturedProducts } from "@/lib/data/products";

test("homepage product queries preserve card relations without fetching unused reviews", async (t) => {
  const original = prisma.product.findMany;
  t.after(() => Object.assign(prisma.product, { findMany: original }));
  const queries: Array<{ include: Record<string, unknown>; take: number }> = [];
  Object.assign(prisma.product, { findMany: async (args: typeof queries[number]) => { queries.push(args); return []; } });
  await getFeaturedProducts(8);
  await getBestsellerProducts(8);
  assert.equal(queries.length, 2);
  for (const query of queries) {
    assert.equal(query.take, 8);
    assert.equal("reviews" in query.include, false);
    for (const relation of ["brand", "category", "promotion", "carMappings"]) assert.ok(query.include[relation]);
  }
});

test("product pagination has a unique tie-breaker even for simultaneously imported products", async (t) => {
  const originals = { findMany: prisma.product.findMany, count: prisma.product.count, transaction: prisma.$transaction };
  t.after(() => {
    Object.assign(prisma.product, { findMany: originals.findMany, count: originals.count });
    Object.assign(prisma, { $transaction: originals.transaction });
  });
  let queries: Array<{ orderBy: Array<Record<string, string>>; skip: number; take: number; where?: Record<string, unknown> }> = [];
  let countCall = 0;
  Object.assign(prisma.product, {
    findMany: async (args: typeof queries[number]) => { queries.push(args); return []; },
    count: async () => (countCall++ % 2 === 0 ? 20 : 103),
  });
  Object.assign(prisma, { $transaction: async (operations: Array<Promise<unknown>>) => Promise.all(operations) });
  for (const sort of ["latest", "price-asc", "price-desc", "rating", "bestseller"] as const) {
    queries = [];
    await getAllProductsWithFilters({ page: 2, pageSize: 12, sort });
    assert.equal(queries.length, 2, sort);
    assert.notDeepEqual(queries[0]?.orderBy.at(0), { stock: "desc" }, sort);
    assert.deepEqual(queries[0]?.orderBy.at(-1), { id: "desc" }, sort);
    assert.deepEqual(queries[1]?.orderBy.at(-1), { id: "desc" }, sort);
    assert.equal(queries[0]?.skip, 12);
    assert.equal(queries[0]?.take, 8);
    assert.equal(queries[1]?.skip, 0);
    assert.equal(queries[1]?.take, 4);
  }
});
