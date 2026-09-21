import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { mgModelHubs, mgModelHubPaths } from "@/lib/mg-model-hubs";

test("important MG models have complete, uniquely addressable SEO hubs", () => {
  assert.deepEqual(mgModelHubs.map((hub) => hub.slug), ["mg-5", "mg-6", "mg-gs", "mg-rx5"]);
  assert.equal(new Set(mgModelHubs.map((hub) => hub.slug)).size, mgModelHubs.length);
  assert.equal(new Set(mgModelHubPaths).size, mgModelHubPaths.length);

  for (const hub of mgModelHubs) {
    assert.ok(hub.title.includes("مشخصات"), hub.slug);
    assert.ok(hub.description.length >= 100, hub.slug);
    assert.ok(hub.intro.length >= 120, hub.slug);
    assert.ok(hub.specifications.length >= 10, hub.slug);
    assert.ok(hub.ownershipNotes.length >= 3, hub.slug);
    assert.ok(hub.faqs.length >= 4, hub.slug);
    assert.ok(hub.variants.length >= 1, hub.slug);
    assert.ok(existsSync(path.join(process.cwd(), "public", hub.image)), `${hub.slug} must use a local image`);

    for (const variant of hub.variants) {
      assert.match(variant.href, /^\/cars\/[a-z0-9-]+$/);
      assert.ok(variant.oil.length > 10);
      assert.ok(variant.gearbox.length > 2);
    }
  }
});
