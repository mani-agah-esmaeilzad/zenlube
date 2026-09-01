import assert from "node:assert/strict";
import test from "node:test";

import { formatTehranLocalDateTime, parseTehranLocalDateTime } from "@/lib/iran-datetime";

test("Tehran datetime parser preserves the admin's local wall time", () => {
  const value = parseTehranLocalDateTime("2026-09-01T18:45");
  assert.equal(value?.toISOString(), "2026-09-01T15:15:00.000Z");
  assert.equal(formatTehranLocalDateTime(value), "2026-09-01T18:45");
});

test("Tehran datetime parser supports empty optional values and rejects malformed values", () => {
  assert.equal(parseTehranLocalDateTime(""), null);
  assert.throws(() => parseTehranLocalDateTime("09/01/2026"));
});
