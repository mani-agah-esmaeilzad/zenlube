import assert from "node:assert/strict";
import test from "node:test";

import { getEditorialGuideLinks } from "@/lib/blog-topic-clusters";

test("fuel-system articles link to the editorial hub and never link to themselves", () => {
  const links = getEditorialGuideLinks("xado-atomex-energy-drive-guide");

  assert.ok(links.some((link) => link.href === "/fuel-system-revival"));
  assert.equal(links.some((link) => link.href === "/blog/xado-atomex-energy-drive-guide"), false);
  assert.ok(links.length >= 3);
});

test("unrelated magazine articles do not receive fuel-system links", () => {
  assert.deepEqual(getEditorialGuideLinks("mg6-engine-oil-guide"), []);
});
