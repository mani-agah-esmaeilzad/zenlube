import assert from "node:assert/strict";
import test from "node:test";

import prisma from "@/lib/prisma";
import { deleteOrderPermanently } from "@/services/admin/mutations";

test("permanent admin deletion removes notification logs, order relations and keeps an audit record", async (t) => {
  const originalTransaction = prisma.$transaction;
  const calls: string[] = [];
  const auditRows: Array<Record<string, unknown>> = [];
  const tx = {
    order: {
      findUnique: async () => ({ id: "order-123", status: "CANCELLED", total: { toString: () => "1200000" } }),
      delete: async () => { calls.push("order.delete"); },
    },
    smsLog: {
      deleteMany: async () => { calls.push("smsLog.deleteMany"); },
    },
    adminAuditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        calls.push("adminAuditLog.create");
        auditRows.push(data);
      },
    },
  };

  Object.assign(prisma, {
    $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
  });
  t.after(() => Object.assign(prisma, { $transaction: originalTransaction }));

  const result = await deleteOrderPermanently("order-123", "admin-1");

  assert.deepEqual(result, { mode: "deleted" });
  assert.deepEqual(calls, ["smsLog.deleteMany", "order.delete", "adminAuditLog.create"]);
  assert.equal(auditRows[0]?.actorUserId, "admin-1");
  assert.equal(auditRows[0]?.action, "DELETE_PERMANENTLY");
});

test("permanent admin deletion refuses an unknown order", async (t) => {
  const originalTransaction = prisma.$transaction;
  const tx = {
    order: { findUnique: async () => null },
  };
  Object.assign(prisma, {
    $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
  });
  t.after(() => Object.assign(prisma, { $transaction: originalTransaction }));

  await assert.rejects(deleteOrderPermanently("missing-order"), /سفارش پیدا نشد/);
});
