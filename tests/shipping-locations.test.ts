import assert from "node:assert/strict";
import test from "node:test";

import prisma from "@/lib/prisma";
import { syncShippingLocations, validateShippingLocationSnapshot } from "@/lib/shipping/locations";
import { amadastProvider } from "@/lib/shipping/providers/amadast";
import type { ProviderLocationTree } from "@/lib/shipping/types";

const validTree: ProviderLocationTree = {
  provinces: [{ externalId: 1, externalParentId: 0, name: "البرز" }],
  cities: [{ externalId: 10, externalParentId: 1, name: "کرج" }],
};

test("shipping location snapshots require every province and a valid unambiguous hierarchy", () => {
  assert.doesNotThrow(() => validateShippingLocationSnapshot(validTree));
  for (const tree of [
    { provinces: [], cities: [] },
    { ...validTree, cities: [] },
    { ...validTree, cities: [{ ...validTree.cities[0]!, externalParentId: 2 }] },
    { ...validTree, provinces: [...validTree.provinces, { externalId: 2, externalParentId: 0, name: "تهران" }] },
    { ...validTree, cities: [...validTree.cities, ...validTree.cities] },
    { ...validTree, cities: [{ ...validTree.cities[0]!, name: "  " }] },
    { ...validTree, provinces: [{ ...validTree.provinces[0]!, externalParentId: 10 }] },
  ]) assert.throws(() => validateShippingLocationSnapshot(tree));
});

test("failed and incomplete location downloads never open a database transaction", async (t) => {
  const originalTransaction = prisma.$transaction;
  const transaction = t.mock.fn(async () => {
    throw new Error("Unexpected database write");
  });
  Object.assign(prisma, { $transaction: transaction });
  t.after(() => Object.assign(prisma, { $transaction: originalTransaction }));
  await assert.rejects(syncShippingLocations({
    ...amadastProvider,
    listLocations: async () => { throw new Error("province download failed"); },
  }, 10_000), /province download failed/);
  await assert.rejects(syncShippingLocations({
    ...amadastProvider,
    listLocations: async () => ({ ...validTree, cities: [] }),
  }, 10_000));
  assert.equal(transaction.mock.callCount(), 0);
});

test("a complete snapshot preserves known codes and replaces provider mappings in one bounded transaction", async (t) => {
  let downloaded = false;
  const queries: string[] = [];
  let replacedProvider: unknown;
  let createdMaps: Array<{ providerKey: string; externalId: string; locationCode: string }> = [];
  let retirementFilter: unknown;
  const originalTransaction = prisma.$transaction;
  const transaction = t.mock.fn(async (run: unknown, options: unknown) => {
    assert.equal(downloaded, true);
    assert.deepEqual(options, { maxWait: 2_000, timeout: 8_000 });
    assert.equal(typeof run, "function");
    return (run as (tx: unknown) => Promise<unknown>)({
      $executeRaw: async (query: TemplateStringsArray) => { queries.push(query.join("?")); return 1; },
      shippingProviderLocationMap: {
        findMany: async () => [
          { externalId: "1", locationCode: "known-province" },
          { externalId: "10", locationCode: "known-city" },
          { externalId: "11", locationCode: "retired-city" },
        ],
        deleteMany: async ({ where }: { where: unknown }) => { replacedProvider = where; return { count: 3 }; },
        createMany: async ({ data }: { data: typeof createdMaps }) => { createdMaps = data; return { count: data.length }; },
      },
      shippingLocation: {
        updateMany: async ({ where }: { where: unknown }) => { retirementFilter = where; return { count: 1 }; },
      },
    });
  });
  Object.assign(prisma, { $transaction: transaction });
  t.after(() => Object.assign(prisma, { $transaction: originalTransaction }));
  const result = await syncShippingLocations({
    ...amadastProvider,
    listLocations: async () => { downloaded = true; return validTree; },
  }, 10_000);

  assert.deepEqual(result, { provinces: 1, cities: 1 });
  assert.equal(transaction.mock.callCount(), 1);
  assert.equal(queries.filter((query) => query.includes('INSERT INTO "ShippingLocation"')).length, 1);
  assert.deepEqual(replacedProvider, { providerKey: "amadast" });
  assert.deepEqual(createdMaps.map((row) => [row.externalId, row.locationCode]), [["1", "known-province"], ["10", "known-city"]]);
  assert.deepEqual(retirementFilter, {
    code: { in: ["known-province", "known-city", "retired-city"] },
    providerMaps: { none: {} },
  });
});
