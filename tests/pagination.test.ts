import assert from "node:assert/strict";
import test from "node:test";

import { getPaginationParams } from "@/lib/pagination";

test("pagination keeps normal page sizes and offsets unchanged", () => {
  assert.deepEqual(getPaginationParams({ page: "3", pageSize: "24" }), { page: 3, pageSize: 24, skip: 48 });
  assert.deepEqual(getPaginationParams({}), { page: 1, pageSize: 12, skip: 0 });
  assert.deepEqual(getPaginationParams({ page: "2", pageSize: "500" }, { maxPageSize: 48 }), { page: 2, pageSize: 48, skip: 48 });
  assert.deepEqual(getPaginationParams({ page: "2.9", pageSize: "12.9" }), { page: 2, pageSize: 12, skip: 12 });
});

test("invalid and fractional pagination never produces negative offsets or zero page sizes", () => {
  for (const value of ["0.5", "0", "-2", "", "NaN", "Infinity", "1e300"]) {
    const result = getPaginationParams({ page: value, pageSize: value });
    assert.ok(result.page >= 1, value);
    assert.ok(result.pageSize >= 1, value);
    assert.ok(result.skip >= 0 && result.skip <= 2_147_483_647, value);
    assert.ok(Number.isSafeInteger(result.skip), value);
  }
  assert.deepEqual(getPaginationParams({ page: "0.5", pageSize: "0.5" }), { page: 1, pageSize: 12, skip: 0 });
  assert.deepEqual(getPaginationParams({ page: ["1", "2"], pageSize: ["12", "24"] }), { page: 1, pageSize: 12, skip: 0 });
});

test("extreme page numbers fall back to the first page before Prisma's offset overflows", () => {
  for (const pageSize of [1, 12, 48, 100]) {
    const maxPage = Math.floor(2_147_483_647 / pageSize) + 1;
    assert.deepEqual(getPaginationParams({ page: String(maxPage + 1), pageSize: String(pageSize) }, { maxPageSize: 100 }), { page: 1, pageSize, skip: 0 });
    assert.equal(getPaginationParams({ page: String(maxPage), pageSize: String(pageSize) }, { maxPageSize: 100 }).skip, (maxPage - 1) * pageSize);
  }
});
