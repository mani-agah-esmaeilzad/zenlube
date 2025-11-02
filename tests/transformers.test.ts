import test from "node:test";
import assert from "node:assert/strict";

import { toNumber } from "@/services/admin/transformers";

test("toNumber converts decimals and strings to numbers", () => {
  assert.equal(toNumber(5), 5);
  assert.equal(toNumber("42"), 42);
  assert.equal(toNumber(null), 0);
});

test("toNumber converts Prisma decimal-like objects", () => {
  const decimal = { toString: () => "19.5" } as unknown as Parameters<typeof toNumber>[0];
  assert.equal(toNumber(decimal), 19.5);
});
