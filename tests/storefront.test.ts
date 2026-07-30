import test from "node:test";
import assert from "node:assert/strict";

import {
  buildArchivedProductSlug,
  isArchivedProductSlug,
  isStorefrontVisibleProduct,
  storefrontVisibleCarWhere,
  storefrontVisibleProductWhere,
} from "@/lib/storefront-visibility";

test("buildArchivedProductSlug creates the shared archived prefix", () => {
  assert.equal(buildArchivedProductSlug("prod_123"), "deleted-prod_123");
});

test("isArchivedProductSlug detects archived storefront slugs", () => {
  assert.equal(isArchivedProductSlug("deleted-prod_123"), true);
  assert.equal(isArchivedProductSlug("oilbar-5w30"), false);
  assert.equal(isArchivedProductSlug(null), false);
});

test("isStorefrontVisibleProduct accepts only active storefront products", () => {
  assert.equal(isStorefrontVisibleProduct({ slug: "oilbar-5w30" }), true);
  assert.equal(isStorefrontVisibleProduct({ slug: "deleted-prod_123" }), false);
  assert.equal(isStorefrontVisibleProduct(null), false);
});

test("storefrontVisibleProductWhere composes visibility with existing filters", () => {
  assert.deepEqual(storefrontVisibleProductWhere({ slug: "oilbar-5w30" }), {
    AND: [
      { slug: "oilbar-5w30" },
      {
        NOT: {
          slug: {
            startsWith: "deleted-",
          },
        },
      },
    ],
  });
});

test("storefrontVisibleCarWhere keeps only active cars and composes filters", () => {
  assert.deepEqual(storefrontVisibleCarWhere({ slug: "hyundai-elantra" }), {
    AND: [
      { slug: "hyundai-elantra" },
      {
        isActive: true,
      },
    ],
  });
});
