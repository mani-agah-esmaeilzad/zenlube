import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { kmcModelHubs, kmcModelLinks } from "@/lib/kmc-model-hubs";

const expectedSlugs = ["kmc-j7", "kmc-k7", "kmc-x5", "kmc-t8", "kmc-t9"];

test("production KMC models have complete and local comprehensive guides", () => {
  assert.deepEqual(kmcModelHubs.map((hub) => hub.slug), expectedSlugs);
  assert.equal(new Set(kmcModelHubs.map((hub) => hub.slug)).size, kmcModelHubs.length);
  assert.deepEqual(kmcModelLinks.map((link) => link.href), expectedSlugs.map((slug) => `/cars/${slug}`));

  for (const hub of kmcModelHubs) {
    assert.ok(hub.title.includes("مشخصات"), hub.slug);
    assert.ok(hub.description.length >= 90, hub.slug);
    assert.ok(hub.intro.length >= 110, hub.slug);
    assert.ok(hub.specifications.length >= 10, hub.slug);
    assert.ok(hub.ownershipNotes.length >= 3, hub.slug);
    assert.ok(hub.faqs.length >= 4, hub.slug);
    assert.ok(hub.variants.length === 1, hub.slug);
    assert.ok(hub.relatedGuides.length >= 3, hub.slug);
    assert.ok(existsSync(path.join(process.cwd(), "public", hub.image)), `${hub.slug} must use a local image`);
    assert.equal(hub.image.startsWith("/vehicles/kmc/"), true, hub.slug);

    for (const variant of hub.variants) {
      assert.match(variant.href, /^\/cars\/[a-z0-9-]+$/);
      assert.ok(variant.oil.length > 20);
      assert.ok(variant.gearbox.length > 3);
    }
  }
});

test("KMC seed activates the exact five production records and keeps verified oil values", () => {
  const seed = readFileSync(path.join(process.cwd(), "prisma", "seed-kmc-car-guides.ts"), "utf8");

  for (const slug of [
    "hyundai-766-kmc-jac-j7-1-5t-6dct",
    "hyundai-44-kmc-k7-1-5t-6dct",
    "hyundai-1033-kmc-x5-1-5t-6dct",
    "hyundai-29-jac-kmc-t8-2-0t-6mt",
    "hyundai-999-kmc-t9-2-0t-gdi-8-at",
  ]) {
    assert.ok(seed.includes(slug), slug);
  }

  assert.match(seed, /oilCapacityLit: 4,/);
  assert.match(seed, /oilCapacityLit: 5\.1,/);
  assert.match(seed, /oilCapacityLit: 4\.5,/);
  assert.match(seed, /oilCapacityLit: 5\.7,/);
  assert.match(seed, /oilCapacityLit: 4\.7,/);
  assert.match(seed, /isActive: true/);
  assert.match(seed, /notebookSections: buildNotebookSections\(car\)/);
  assert.match(seed, /slug: "hyundai-766-kmc-jac-j7-1-5t-6dct"[\s\S]*?minimumApi: "SN",/);
  assert.match(seed, /slug: "hyundai-44-kmc-k7-1-5t-6dct"[\s\S]*?minimumApi: null,/);
  assert.equal(seed.includes("prisma.productCar"), false, "KMC SEO/guide seeding must not alter product-page compatibility relations");
});
