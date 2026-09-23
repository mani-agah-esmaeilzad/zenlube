import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";

import { Prisma } from "@/generated/prisma";
import { config } from "@/lib/config";
import prisma from "@/lib/prisma";
import { sendSms } from "@/lib/sms/service";

type SmsRow = {
  id: string;
  status: string;
  message?: string;
  dedupeKey?: string;
  providerResponse?: unknown;
  createdAt?: Date;
};
type UpdateWhere = {
  id: string;
  status: string | { in: string[] };
  providerResponse?: { path: string[]; equals: string };
};

const notification = {
  phone: "09123456789",
  message: "Test order notification",
  eventType: "status_processing",
  dedupeKey: "order_status:order-123:PAID",
};

function setup(t: TestContext, initialStatus?: string) {
  const originalConfig = { ...config };
  const originalSandbox = process.env.SMS_SANDBOX_MODE;
  const originalLogMethods = {
    create: prisma.smsLog.create,
    findUnique: prisma.smsLog.findUnique,
    updateMany: prisma.smsLog.updateMany,
  };
  Object.assign(config, {
    SMS_PROVIDER: "smsir", SMS_ENABLED: true, SMS_SANDBOX_MODE: false,
    SMSIR_API_KEY: "test-key", SMSIR_LINE_NUMBER: 300000,
  });
  process.env.SMS_SANDBOX_MODE = "false";
  t.after(() => {
    Object.assign(config, originalConfig);
    if (originalSandbox === undefined) delete process.env.SMS_SANDBOX_MODE;
    else process.env.SMS_SANDBOX_MODE = originalSandbox;
    t.mock.restoreAll();
    Object.assign(prisma.smsLog, originalLogMethods);
  });

  const rows = new Map<string, SmsRow>();
  if (initialStatus) {
    rows.set(notification.dedupeKey, {
      id: "existing-log", dedupeKey: notification.dedupeKey, status: initialStatus,
      createdAt: new Date("2000-01-01"),
    });
  }
  const create = async ({ data }: { data: SmsRow }) => {
    const key = data.dedupeKey ?? data.id;
    if (rows.has(key)) {
      throw new Prisma.PrismaClientKnownRequestError("Unique dedupe key", { code: "P2002", clientVersion: "test" });
    }
    rows.set(key, { ...data });
    return { id: data.id };
  };
  const findUnique = async ({ where }: { where: { dedupeKey: string } }) => {
    const row = rows.get(where.dedupeKey);
    return row ? { ...row } : null;
  };
  const updateMany = async ({ where, data }: { where: UpdateWhere; data: Partial<SmsRow> }) => {
    const row = [...rows.values()].find((candidate) => candidate.id === where.id);
    if (!row) return { count: 0 };
    const matchesStatus = typeof where.status === "string" ? row.status === where.status : where.status.in.includes(row.status);
    const matchesToken = !where.providerResponse
      || (row.providerResponse as { claimToken?: string })?.claimToken === where.providerResponse.equals;
    if (!matchesStatus || !matchesToken) return { count: 0 };
    Object.assign(row, data);
    return { count: 1 };
  };
  // Prisma delegates use proxy properties without method descriptors, so
  // install these in-memory implementations directly and restore them above.
  Object.assign(prisma.smsLog, { create, findUnique, updateMany });
  return rows;
}

function accepted() {
  return Response.json({ status: 1, data: { messageIds: [12345] } });
}

function heldProvider(t: TestContext) {
  let finish!: (response: Response) => void;
  let started!: () => void;
  const waiting = new Promise<void>((resolve) => { started = resolve; });
  const pending = new Promise<Response>((resolve) => { finish = resolve; });
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    started();
    return pending;
  });
  return { fetchMock, waiting, finish };
}

for (const initialStatus of [undefined, "failed", "disabled", "sandbox"]) {
  test(`SMS claim allows only one concurrent provider call (${initialStatus ?? "new"})`, async (t) => {
    const rows = setup(t, initialStatus);
    const provider = heldProvider(t);
    const first = sendSms(notification);
    const competing = sendSms(notification);
    await provider.waiting;
    const duplicate = await competing;
    assert.equal(duplicate.skipped, true);
    assert.equal(provider.fetchMock.mock.callCount(), 1);
    provider.finish(accepted());
    assert.equal((await first).success, true);
    assert.equal(rows.get(notification.dedupeKey)?.status, "sent");
    await sendSms(notification);
    assert.equal(provider.fetchMock.mock.callCount(), 1);
  });
}

test("an old sending claim is not retried because the provider may have accepted it", async (t) => {
  setup(t, "sending");
  const fetchMock = t.mock.method(globalThis, "fetch", async () => accepted());
  const result = await sendSms(notification);
  assert.equal(result.skipped, true);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("an explicit manual resend can send a previously completed merchant notification again", async (t) => {
  const rows = setup(t, "sent");
  const fetchMock = t.mock.method(globalThis, "fetch", async () => accepted());
  const result = await sendSms({ ...notification, forceResend: true });

  assert.equal(result.success, true);
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(rows.get(notification.dedupeKey)?.status, "sent");
});

for (const failure of ["timeout", "network", "server-error", "malformed-success"]) {
  test(`ambiguous SMS ${failure} is recorded and cannot be retried`, async (t) => {
    const rows = setup(t);
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      if (failure === "timeout") throw new DOMException("Timed out", "TimeoutError");
      if (failure === "network") throw new TypeError("fetch failed");
      if (failure === "server-error") return Response.json({ message: "Gateway failed" }, { status: 502 });
      return new Response("not valid JSON");
    });
    assert.equal((await sendSms(notification)).success, false);
    assert.equal(rows.get(notification.dedupeKey)?.status, "uncertain");
    assert.equal((await sendSms(notification)).success, false);
    assert.equal(fetchMock.mock.callCount(), 1);
  });
}

for (const provider of ["smsir", "melipayamak"]) {
  test(`${provider} explicit rejection can be retried after correction`, async (t) => {
    const rows = setup(t);
    Object.assign(config, {
      SMS_PROVIDER: provider, MELIPAYAMAK_USERNAME: "test", MELIPAYAMAK_PASSWORD: "test", MELIPAYAMAK_FROM: "5000",
    });
    let rejected = true;
    const fetchMock = t.mock.method(globalThis, "fetch", async () => rejected
      ? Response.json({ message: "Invalid line", error: "Invalid line" }, { status: 400 })
      : provider === "smsir" ? accepted() : Response.json({ messageId: "12345" }));
    assert.equal((await sendSms(notification)).success, false);
    assert.equal(rows.get(notification.dedupeKey)?.status, "failed");
    rejected = false;
    assert.equal((await sendSms(notification)).success, true);
    assert.equal(rows.get(notification.dedupeKey)?.status, "sent");
    assert.equal(fetchMock.mock.callCount(), 2);
  });
}

test("a late result cannot overwrite another claim's delivery state", async (t) => {
  const rows = setup(t);
  const provider = heldProvider(t);
  const sending = sendSms(notification);
  await provider.waiting;
  const row = rows.get(notification.dedupeKey)!;
  row.providerResponse = { claimToken: "newer-attempt" };
  provider.finish(accepted());
  await sending;
  assert.equal(row.status, "sending");
  assert.deepEqual(row.providerResponse, { claimToken: "newer-attempt" });
});

test("a failed reservation never calls the SMS provider", async (t) => {
  setup(t);
  Object.assign(prisma.smsLog, { create: async () => { throw new Error("Database unavailable"); } });
  const fetchMock = t.mock.method(globalThis, "fetch", async () => accepted());
  await assert.rejects(sendSms(notification), /Database unavailable/);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("missing SMS credentials are retryable without attempting network delivery", async (t) => {
  const rows = setup(t);
  Object.assign(config, { SMSIR_API_KEY: undefined, SMS_API_KEY: undefined });
  const fetchMock = t.mock.method(globalThis, "fetch", async () => accepted());
  assert.equal((await sendSms(notification)).success, false);
  assert.equal(rows.get(notification.dedupeKey)?.status, "failed");
  assert.equal(fetchMock.mock.callCount(), 0);
  Object.assign(config, { SMSIR_API_KEY: "corrected-key" });
  assert.equal((await sendSms(notification)).success, true);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("feedback invitation logs never persist the private survey token", async (t) => {
  const rows = setup(t);
  t.mock.method(globalThis, "fetch", async () => accepted());
  const secretToken = "a".repeat(43);
  const dedupeKey = "purchase_feedback:feedback-123:1";

  const result = await sendSms({
    phone: notification.phone,
    eventType: "purchase_feedback_invite",
    templateName: "purchase_feedback_invite",
    dedupeKey,
    message: `نظر شما: https://www.oilbar.ir/feedback/${secretToken}`,
  });

  assert.equal(result.success, true);
  assert.equal(rows.get(dedupeKey)?.message?.includes(secretToken), false);
  assert.match(rows.get(dedupeKey)?.message ?? "", /محافظت‌شده/);
});
