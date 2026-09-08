import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { Prisma, PrismaClient } from "../../src/generated/prisma";
import {
  requestZarinpalPayment,
  verifyZarinpalPayment,
  ZarinpalServiceError,
  type ZarinpalRequestResult,
  type ZarinpalVerifyResult,
} from "./zarinpal.service";
import { sendPaymentSuccessSms } from "./sms";

const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 3001);
const REQUEST_TTL_MS = 2 * 60 * 1000;
const REDIRECT_TTL_MS = 30 * 60 * 1000;
const ACTIVE_STATUSES = ["pending", "initiated", "redirected"] as const;
const RECONCILIATION_STATUS = "reconciliation_required";
const VERIFY_PENDING_STATUS = "verification_pending";
const REQUEST_UNKNOWN_STATUS = "request_outcome_unknown";
const SETTLED_STATUSES = ["paid", "verified", RECONCILIATION_STATUS] as const;
const BLOCKING_STATUSES = ["paid", "verified", RECONCILIATION_STATUS, VERIFY_PENDING_STATUS, REQUEST_UNKNOWN_STATUS] as const;

type JsonObject = Record<string, unknown>;
type OrderPaymentItem = { productId: string; quantity: number };

function log(level: "info" | "warn" | "error", message: string, meta?: JsonObject) {
  const body = meta ? ` ${JSON.stringify(meta)}` : "";
  console[level](`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${body}`);
}

function frontendBaseUrl() {
  return (process.env.FRONTEND_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://oilbar.ir").replace(/\/$/, "");
}

function callbackUrlForOrder(orderId: string) {
  const configured = process.env.ZARINPAL_CALLBACK_URL;
  if (!configured) throw new Error("ZARINPAL_CALLBACK_URL تنظیم نشده است.");
  const url = new URL(configured);
  url.searchParams.set("orderId", orderId);
  return url.toString();
}

function successPath(orderId: string, options?: { review?: boolean; refId?: string }) {
  const params = new URLSearchParams({ orderId });
  if (options?.review) params.set("review", "1");
  if (options?.refId) params.set("refId", options.refId);
  return `/checkout/success?${params.toString()}`;
}

function failurePath(reason: string, orderId?: string | null) {
  const params = new URLSearchParams({ reason });
  if (orderId) params.set("orderId", orderId);
  return `/checkout/failed?${params.toString()}`;
}

function amountText(amount: unknown) {
  return typeof amount === "object" && amount && "toString" in amount ? amount.toString() : String(amount);
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function paymentUrlFromJson(value: Prisma.JsonValue | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const paymentUrl = (value as Record<string, unknown>).paymentUrl;
  if (typeof paymentUrl !== "string") return null;
  try {
    const parsed = new URL(paymentUrl);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function isFreshAttempt(attempt: { status: string; updatedAt: Date }, now = Date.now()) {
  const ttl = attempt.status === "pending" ? REQUEST_TTL_MS : REDIRECT_TTL_MS;
  return attempt.updatedAt.getTime() > now - ttl;
}

function json(response: ServerResponse, status: number, data: JsonObject) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

function redirect(response: ServerResponse, path: string) {
  response.writeHead(302, { Location: `${frontendBaseUrl()}${path}` });
  response.end();
}

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as JsonObject;
}

function requireSecret(request: IncomingMessage) {
  const expected = process.env.PAYMENT_SERVICE_SECRET;
  return !expected || request.headers["x-oilbar-payment-secret"] === expected;
}

function orderNumber(orderId: string) {
  return orderId.slice(-8).toUpperCase();
}

function aggregateOrderItems(items: OrderPaymentItem[]) {
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  return [...quantities.entries()]
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((left, right) => left.productId.localeCompare(right.productId));
}

async function lockAndConsumeInventory(tx: Prisma.TransactionClient, items: OrderPaymentItem[]) {
  const aggregated = aggregateOrderItems(items);
  if (!aggregated.length) throw new Error("سفارش هیچ قلم کالایی ندارد.");
  const productIds = aggregated.map((item) => item.productId);
  const lockedProducts = await tx.$queryRaw<Array<{ id: string; stock: number }>>(
    Prisma.sql`SELECT "id", "stock" FROM "Product" WHERE "id" IN (${Prisma.join(productIds)}) ORDER BY "id" FOR UPDATE`,
  );
  const stocks = new Map(lockedProducts.map((product) => [product.id, product.stock]));
  for (const item of aggregated) {
    const stock = stocks.get(item.productId);
    if (stock == null || stock < item.quantity) throw new Error(`موجودی محصول ${item.productId} کافی نیست.`);
  }
  for (const item of aggregated) {
    const updated = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count !== 1) throw new Error(`موجودی محصول ${item.productId} همزمان تغییر کرد.`);
  }
}

async function consumeCouponUsage(tx: Prisma.TransactionClient, couponId: string | null) {
  if (!couponId) return;
  const coupons = await tx.$queryRaw<Array<{
    id: string;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    usageLimit: number | null;
    usedCount: number;
  }>>(
    Prisma.sql`SELECT "id", "isActive", "startsAt", "endsAt", "usageLimit", "usedCount" FROM "Coupon" WHERE "id" = ${couponId} FOR UPDATE`,
  );
  const coupon = coupons[0];
  const now = new Date();
  if (!coupon || !coupon.isActive || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now)
    || (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)) {
    throw new Error("ظرفیت کد تخفیف در زمان نهایی‌سازی پرداخت تکمیل شده است.");
  }
  const updated = await tx.coupon.updateMany({
    where: { id: coupon.id, usedCount: coupon.usedCount },
    data: { usedCount: { increment: 1 } },
  });
  if (updated.count !== 1) throw new Error("ظرفیت کد تخفیف همزمان تغییر کرد.");
}

async function consumeOnlyOrderedCartQuantities(tx: Prisma.TransactionClient, userId: string, items: OrderPaymentItem[]) {
  const carts = await tx.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT "id" FROM "Cart" WHERE "userId" = ${userId} FOR UPDATE`,
  );
  const cart = carts[0];
  if (!cart) return;
  let changed = false;
  for (const item of aggregateOrderItems(items)) {
    const cartItem = await tx.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
      select: { id: true, quantity: true },
    });
    if (!cartItem) continue;
    changed = true;
    if (cartItem.quantity <= item.quantity) await tx.cartItem.delete({ where: { id: cartItem.id } });
    else await tx.cartItem.update({ where: { id: cartItem.id }, data: { quantity: { decrement: item.quantity } } });
  }
  if (changed) await tx.cart.update({ where: { id: cart.id }, data: { version: { increment: 1 } } });
}

async function handlePaymentRequest(request: IncomingMessage, response: ServerResponse) {
  if (!requireSecret(request)) {
    json(response, 401, { success: false, message: "دسترسی غیرمجاز است." });
    return;
  }
  const body = await readJson(request);
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  if (!orderId) {
    json(response, 400, { success: false, message: "شناسه سفارش نامعتبر است." });
    return;
  }

  const claim = await prisma.$transaction(async (tx) => {
    const lockedOrders = await tx.$queryRaw<Array<{ status: string; paidAt: Date | null }>>(
      Prisma.sql`SELECT "status"::text, "paidAt" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`,
    );
    const lockedOrder = lockedOrders[0];
    if (!lockedOrder) return { kind: "not-found" as const };
    if (lockedOrder.status !== "PENDING" || lockedOrder.paidAt) return { kind: "invalid" as const };
    const blocked = await tx.paymentTransaction.findFirst({
      where: { orderId, status: { in: [...BLOCKING_STATUSES] } },
      orderBy: { updatedAt: "desc" },
      select: { status: true },
    });
    if (blocked) return { kind: "review" as const, status: blocked.status };

    const active = await tx.paymentTransaction.findFirst({
      where: { orderId, status: { in: [...ACTIVE_STATUSES] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, authority: true, requestResponse: true, status: true, updatedAt: true },
    });
    const fresh = active ? isFreshAttempt(active) : false;
    const reusableUrl = active && active.status !== "pending" && fresh ? paymentUrlFromJson(active.requestResponse) : null;
    if (active && reusableUrl) return { kind: "reused" as const, paymentUrl: reusableUrl, authority: active.authority };
    if (active && fresh) return { kind: "in-progress" as const };
    if (active) {
      const abandoned = await tx.paymentTransaction.updateMany({
        where: { id: active.id, status: { in: [...ACTIVE_STATUSES] }, updatedAt: active.updatedAt },
        data: { status: "request_abandoned", errorMessage: "درخواست پرداخت بدون پاسخ نهایی رها شد." },
      });
      if (abandoned.count !== 1) return { kind: "in-progress" as const };
    }
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return { kind: "not-found" as const };
    const transaction = await tx.paymentTransaction.create({
      data: {
        orderId: order.id,
        gateway: "zarinpal",
        amount: order.total,
        currency: "IRR",
        status: "pending",
        requestPayload: toJson({ orderId: order.id }),
      },
    });
    return { kind: "claimed" as const, order, transaction };
  });

  if (claim.kind === "not-found") return json(response, 404, { success: false, message: "سفارش پیدا نشد." });
  if (claim.kind === "invalid") return json(response, 409, { success: false, message: "این سفارش در وضعیت پرداخت‌پذیر نیست." });
  if (claim.kind === "review") return json(response, 409, {
    success: false,
    reviewRequired: true,
    paymentStatus: claim.status,
    message: "وضعیت این پرداخت در حال بررسی است؛ پرداخت جدیدی ایجاد نکنید.",
  });
  if (claim.kind === "in-progress") return json(response, 409, {
    success: false,
    message: "درخواست پرداخت قبلی در حال آماده‌سازی است؛ چند لحظه دیگر دوباره تلاش کنید.",
  });
  if (claim.kind === "reused") return json(response, 200, {
    success: true,
    paymentUrl: claim.paymentUrl,
    authority: claim.authority,
    orderId,
  });

  const { order, transaction } = claim;
  let payment: ZarinpalRequestResult | null = null;
  try {
    payment = await requestZarinpalPayment({
      amount: order.total,
      callbackUrl: callbackUrlForOrder(order.id),
      description: `پرداخت سفارش ${orderNumber(order.id)} در Oilbar`,
      email: order.email,
      phone: order.phone,
      metadata: { order_id: order.id, transaction_id: transaction.id },
    });
    await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ status: string; paidAt: Date | null }>>(
        Prisma.sql`SELECT "status"::text, "paidAt" FROM "Order" WHERE "id" = ${order.id} FOR UPDATE`,
      );
      if (locked[0]?.status !== "PENDING" || locked[0]?.paidAt) throw new Error("سفارش از وضعیت پرداخت‌پذیر خارج شد.");
      const updated = await tx.paymentTransaction.updateMany({
        where: { id: transaction.id, orderId: order.id, status: "pending" },
        data: {
          authority: payment!.authority,
          status: "initiated",
          requestPayload: toJson(payment!.payload),
          requestResponse: toJson({ paymentUrl: payment!.paymentUrl, providerResponse: payment!.response }),
          errorCode: null,
          errorMessage: null,
        },
      });
      if (updated.count !== 1) throw new Error("وضعیت درخواست پرداخت همزمان تغییر کرد.");
      await tx.order.update({ where: { id: order.id }, data: { paymentAuthority: payment!.authority } });
      await tx.paymentEvent.create({
        data: { orderId: order.id, gateway: "ZARINPAL", authority: payment!.authority, status: "PENDING", payload: toJson(payment!.response) },
      });
    });
    log("info", "Payment init response", { orderId: order.id, authority: payment.authority });
    return json(response, 200, { success: true, paymentUrl: payment.paymentUrl, authority: payment.authority, orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    const outcomeUnknown = payment !== null || (error instanceof ZarinpalServiceError && error.outcomeUnknown);
    log("error", "Payment init failed", { orderId: order.id, outcomeUnknown, error: message });
    const persisted = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${order.id} FOR UPDATE`);
      const updated = await tx.paymentTransaction.updateMany({
        where: { id: transaction.id, orderId: order.id },
        data: {
          status: outcomeUnknown ? REQUEST_UNKNOWN_STATUS : "request_failed",
          authority: payment?.authority,
          requestPayload: payment ? toJson(payment.payload) : undefined,
          requestResponse: payment ? toJson({ paymentUrl: payment.paymentUrl, providerResponse: payment.response }) : undefined,
          errorMessage: message,
        },
      });
      if (updated.count !== 1) throw new Error("درخواست پرداخت برای ثبت خطا پیدا نشد.");
      if (payment?.authority) await tx.order.update({ where: { id: order.id }, data: { paymentAuthority: payment.authority } });
      await tx.paymentEvent.create({
        data: {
          orderId: order.id,
          gateway: "ZARINPAL",
          authority: payment?.authority,
          status: outcomeUnknown ? "REQUEST_OUTCOME_UNKNOWN" : "REQUEST_FAILED",
          payload: toJson({ error: message }),
        },
      });
      return true;
    }).catch(async (persistenceError) => {
      log("error", "Could not persist payment init outcome", {
        orderId: order.id,
        error: persistenceError instanceof Error ? persistenceError.message : "unknown",
      });
      if (!outcomeUnknown) return false;
      const fallback = await prisma.paymentTransaction.updateMany({
        where: { id: transaction.id, orderId: order.id },
        data: { status: REQUEST_UNKNOWN_STATUS, errorMessage: message },
      }).catch(() => ({ count: 0 }));
      return fallback.count === 1;
    });
    return json(response, outcomeUnknown ? 503 : 502, {
      success: false,
      reviewRequired: outcomeUnknown,
      stateSaved: persisted,
      message: outcomeUnknown
        ? "نتیجه اتصال به درگاه نامشخص است؛ پرداخت دوباره انجام ندهید تا وضعیت بررسی شود."
        : "ارتباط با زرین‌پال برقرار نشد. لطفا دوباره تلاش کنید.",
    });
  }
}

async function markCanceledExact(input: { authority: string; orderId: string; payload: JsonObject; reason: string; transactionId: string }) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ status: string }>>(
      Prisma.sql`SELECT "status"::text FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`,
    );
    if (!locked[0]) return "missing" as const;
    const current = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!current || current.orderId !== input.orderId || current.authority !== input.authority) return "missing" as const;
    if (SETTLED_STATUSES.some((status) => status === current.status)) return current.status === "paid" ? "paid" as const : "protected" as const;
    if (current.status === VERIFY_PENDING_STATUS) return "protected" as const;
    const updated = await tx.paymentTransaction.updateMany({
      where: { id: input.transactionId, orderId: input.orderId, authority: input.authority },
      data: { status: "canceled", errorMessage: input.reason, verifyResponse: toJson(input.payload) },
    });
    if (updated.count !== 1) return "missing" as const;
    await tx.paymentEvent.create({
      data: { orderId: input.orderId, gateway: "ZARINPAL", authority: input.authority, status: "CANCELLED", payload: toJson(input.payload) },
    });
    await tx.orderStatusEvent.create({
      data: {
        orderId: input.orderId,
        status: "PAYMENT_CANCELLED",
        title: "پرداخت تکمیل نشد",
        detail: "فرآیند پرداخت تکمیل نشد؛ سفارش محفوظ است و می‌توانید دوباره تلاش کنید.",
      },
    });
    return locked[0].status === "PAID" ? "order-paid" as const : "canceled" as const;
  });
}

async function recordVerificationFailure(input: { authority: string; message: string; orderId: string; payload: JsonObject; transactionId: string }) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ status: string }>>(
      Prisma.sql`SELECT "status"::text FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`,
    );
    if (!locked[0]) return "missing" as const;
    const current = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!current || current.orderId !== input.orderId || current.authority !== input.authority) return "missing" as const;
    if (SETTLED_STATUSES.some((status) => status === current.status)) return current.status === "paid" ? "paid" as const : "protected" as const;
    const updated = await tx.paymentTransaction.updateMany({
      where: { id: input.transactionId, orderId: input.orderId, authority: input.authority },
      data: {
        status: "failed",
        errorMessage: input.message,
        verifyPayload: toJson({ query: input.payload }),
        verifyResponse: toJson({ error: input.message }),
      },
    });
    if (updated.count !== 1) return "missing" as const;
    await tx.paymentEvent.create({
      data: { orderId: input.orderId, gateway: "ZARINPAL", authority: input.authority, status: "FAILED", payload: toJson({ error: input.message }) },
    });
    await tx.orderStatusEvent.create({
      data: {
        orderId: input.orderId,
        status: "PAYMENT_VERIFY_FAILED",
        title: "تایید پرداخت ناموفق بود",
        detail: "در تایید نهایی پرداخت خطا رخ داد؛ سفارش برای تلاش دوباره محفوظ است.",
      },
    });
    return locked[0].status === "PAID" ? "order-paid" as const : "failed" as const;
  });
}

async function markVerificationPending(input: { authority: string; message: string; orderId: string; payload: JsonObject; transactionId: string }) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`);
    const current = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!current || current.orderId !== input.orderId || current.authority !== input.authority) return "missing" as const;
    if (SETTLED_STATUSES.some((status) => status === current.status)) return current.status === "paid" ? "paid" as const : "protected" as const;
    const alreadyPending = current.status === VERIFY_PENDING_STATUS;
    await tx.paymentTransaction.update({
      where: { id: input.transactionId },
      data: {
        status: VERIFY_PENDING_STATUS,
        errorMessage: input.message,
        verifyPayload: toJson({ query: input.payload }),
        verifyResponse: toJson({ error: input.message, outcomeUnknown: true }),
      },
    });
    if (!alreadyPending) {
      await tx.paymentEvent.create({
        data: { orderId: input.orderId, gateway: "ZARINPAL", authority: input.authority, status: "VERIFICATION_PENDING", payload: toJson({ error: input.message }) },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: input.orderId,
          status: "PAYMENT_VERIFICATION_PENDING",
          title: "وضعیت پرداخت در حال بررسی است",
          detail: "پاسخ قطعی تایید از درگاه دریافت نشد؛ تا روشن‌شدن وضعیت پرداخت جدیدی ایجاد نشود.",
        },
      });
    }
    return "pending" as const;
  });
}

async function checkpointVerifiedPayment(input: {
  authority: string;
  orderId: string;
  payload: JsonObject;
  transactionId: string;
  verification: ZarinpalVerifyResult;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`);
    const current = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!current || current.orderId !== input.orderId || current.authority !== input.authority) return "missing" as const;
    if (current.status === "paid") return "paid" as const;
    if (current.status === "verified" || current.status === RECONCILIATION_STATUS) return "protected" as const;
    const updated = await tx.paymentTransaction.updateMany({
      where: { id: input.transactionId, orderId: input.orderId, authority: input.authority },
      data: {
        status: "verified",
        refId: input.verification.refId,
        cardPan: input.verification.cardPan,
        paidAt: new Date(),
        errorCode: null,
        errorMessage: null,
        verifyPayload: toJson({ providerPayload: input.verification.payload, query: input.payload }),
        verifyResponse: toJson(input.verification.response),
      },
    });
    if (updated.count !== 1) return "missing" as const;
    await tx.paymentEvent.create({
      data: {
        orderId: input.orderId,
        gateway: "ZARINPAL",
        authority: input.authority,
        status: "VERIFIED",
        payload: toJson({ refId: input.verification.refId, response: input.verification.response }),
      },
    });
    return "checkpointed" as const;
  });
}

async function markPaymentForReconciliation(input: {
  authority: string;
  message: string;
  orderId: string;
  payload: JsonObject;
  transactionId: string;
  verification: ZarinpalVerifyResult;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`);
    const current = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!current || current.orderId !== input.orderId || current.authority !== input.authority) throw new Error("تراکنش دقیق این پرداخت پیدا نشد.");
    if (current.status === "paid" || current.status === RECONCILIATION_STATUS) return;
    const updated = await tx.paymentTransaction.updateMany({
      where: { id: input.transactionId, orderId: input.orderId, authority: input.authority },
      data: {
        status: RECONCILIATION_STATUS,
        refId: input.verification.refId,
        cardPan: input.verification.cardPan,
        paidAt: current.paidAt ?? new Date(),
        errorMessage: input.message,
        verifyPayload: toJson({ providerPayload: input.verification.payload, query: input.payload }),
        verifyResponse: toJson({ providerResponse: input.verification.response, settlementError: input.message }),
      },
    });
    if (updated.count !== 1) throw new Error("ثبت وضعیت بررسی پرداخت همزمان ناموفق شد.");
    await tx.paymentEvent.create({
      data: {
        orderId: input.orderId,
        gateway: "ZARINPAL",
        authority: input.authority,
        status: "RECONCILIATION_REQUIRED",
        payload: toJson({ refId: input.verification.refId, error: input.message }),
      },
    });
    await tx.orderStatusEvent.create({
      data: {
        orderId: input.orderId,
        status: "PAYMENT_RECONCILIATION_REQUIRED",
        title: "پرداخت تایید شد؛ سفارش در حال بررسی است",
        detail: "مبلغ در درگاه تایید شده، اما نهایی‌سازی سفارش به بررسی مدیر نیاز دارد. پرداخت جدید ایجاد نشود.",
      },
    });
  });
}

async function fulfillVerifiedPayment(input: { authority: string; orderId: string; transactionId: string; verification: ZarinpalVerifyResult }) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ status: string }>>(
      Prisma.sql`SELECT "status"::text FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`,
    );
    if (!locked[0]) throw new Error("سفارش پیدا نشد.");
    const current = await tx.paymentTransaction.findUnique({ where: { id: input.transactionId } });
    if (!current || current.orderId !== input.orderId || current.authority !== input.authority) throw new Error("تراکنش دقیق این پرداخت پیدا نشد.");
    if (current.status === "paid") return false;
    if (locked[0].status === "PAID") throw new Error("این سفارش با تراکنش دیگری پرداخت شده و پرداخت فعلی باید بررسی شود.");
    if (locked[0].status !== "PENDING") throw new Error(`وضعیت سفارش ${locked[0].status} اجازه تسویه خودکار نمی‌دهد.`);
    if (current.status !== "verified" || current.refId !== input.verification.refId) throw new Error("ثبت تایید درگاه کامل نیست.");

    const order = await tx.order.findUnique({ where: { id: input.orderId }, include: { items: true } });
    if (!order) throw new Error("سفارش پیدا نشد.");
    await lockAndConsumeInventory(tx, order.items);
    await consumeCouponUsage(tx, order.couponId);
    await consumeOnlyOrderedCartQuantities(tx, order.userId, order.items);

    const paidAt = new Date();
    const paymentUpdate = await tx.paymentTransaction.updateMany({
      where: {
        id: input.transactionId,
        orderId: input.orderId,
        authority: input.authority,
        status: "verified",
        refId: input.verification.refId,
      },
      data: { status: "paid", cardPan: input.verification.cardPan, paidAt, errorCode: null, errorMessage: null },
    });
    if (paymentUpdate.count !== 1) throw new Error("وضعیت تراکنش همزمان تغییر کرد.");
    const orderUpdate = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING", paidAt: null },
      data: { status: "PAID", paymentRefId: input.verification.refId, paidAt },
    });
    if (orderUpdate.count !== 1) throw new Error("وضعیت سفارش همزمان تغییر کرد.");
    await tx.paymentEvent.create({
      data: { orderId: order.id, gateway: "ZARINPAL", authority: input.authority, status: "PAID", payload: toJson(input.verification.response) },
    });
    await tx.orderStatusEvent.create({
      data: { orderId: order.id, status: "PAID", title: "پرداخت موفق", detail: `پرداخت با کد ${input.verification.refId} تایید شد.` },
    });
    return true;
  });
}

async function handlePaymentCallback(url: URL, response: ServerResponse) {
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");
  const orderId = url.searchParams.get("orderId");
  const queryPayload = Object.fromEntries(url.searchParams.entries());
  log("info", "Payment callback received", { authority, status, orderId });
  if (!authority || !orderId) return redirect(response, failurePath("missing", orderId));

  const transaction = await prisma.paymentTransaction.findUnique({ where: { authority }, include: { order: true } });
  if (!transaction || transaction.orderId !== orderId) return redirect(response, failurePath("not-found", orderId));
  if (transaction.status === "paid") {
    return redirect(
      response,
      successPath(transaction.orderId, { review: transaction.order.status !== "PAID" }),
    );
  }
  if (transaction.status === "verified" || transaction.status === RECONCILIATION_STATUS) {
    return redirect(response, successPath(transaction.orderId, { review: true }));
  }

  if (status !== "OK") {
    const result = await markCanceledExact({
      authority,
      orderId: transaction.orderId,
      payload: queryPayload,
      reason: status ?? "cancelled",
      transactionId: transaction.id,
    });
    if (result === "paid" || result === "order-paid") return redirect(response, successPath(transaction.orderId));
    if (result === "protected") return redirect(response, successPath(transaction.orderId, { review: true }));
    return redirect(response, failurePath(result === "missing" ? "not-found" : "cancelled", transaction.orderId));
  }

  let verification: ZarinpalVerifyResult;
  try {
    verification = await verifyZarinpalPayment(authority, transaction.amount);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    const outcomeUnknown = error instanceof ZarinpalServiceError && error.outcomeUnknown;
    log("error", "Payment verification failed", { orderId: transaction.orderId, authority, outcomeUnknown, error: message });
    if (outcomeUnknown) {
      const result = await markVerificationPending({
        authority,
        message,
        orderId: transaction.orderId,
        payload: queryPayload,
        transactionId: transaction.id,
      }).catch((persistenceError) => {
        log("error", "Could not persist pending verification state", {
          orderId: transaction.orderId,
          authority,
          error: persistenceError instanceof Error ? persistenceError.message : "unknown",
        });
        return "protected" as const;
      });
      return redirect(response, successPath(transaction.orderId, { review: result !== "paid" }));
    }
    const result = await recordVerificationFailure({
      authority,
      message,
      orderId: transaction.orderId,
      payload: queryPayload,
      transactionId: transaction.id,
    }).catch((persistenceError) => {
      log("error", "Could not persist verification failure", {
        orderId: transaction.orderId,
        authority,
        error: persistenceError instanceof Error ? persistenceError.message : "unknown",
      });
      return "protected" as const;
    });
    if (result === "paid" || result === "order-paid") return redirect(response, successPath(transaction.orderId));
    if (result === "protected") return redirect(response, successPath(transaction.orderId, { review: true }));
    return redirect(response, failurePath(result === "missing" ? "not-found" : "verify", transaction.orderId));
  }

  let checkpoint: Awaited<ReturnType<typeof checkpointVerifiedPayment>>;
  try {
    checkpoint = await checkpointVerifiedPayment({
      authority,
      orderId: transaction.orderId,
      payload: queryPayload,
      transactionId: transaction.id,
      verification,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    log("error", "Could not checkpoint verified payment", {
      orderId: transaction.orderId,
      authority,
      refId: verification.refId,
      error: message,
    });
    await markPaymentForReconciliation({
      authority,
      message,
      orderId: transaction.orderId,
      payload: queryPayload,
      transactionId: transaction.id,
      verification,
    }).catch((reconciliationError) => log("error", "Could not persist payment reconciliation", {
      orderId: transaction.orderId,
      authority,
      error: reconciliationError instanceof Error ? reconciliationError.message : "unknown",
    }));
    return redirect(response, successPath(transaction.orderId, { review: true }));
  }
  if (checkpoint === "paid") return redirect(response, successPath(transaction.orderId));
  if (checkpoint !== "checkpointed") {
    return redirect(response, successPath(transaction.orderId, { review: true }));
  }

  if (Number(transaction.amount) !== Number(transaction.order.total)) {
    const message = "پرداخت تایید شد، اما مبلغ تراکنش با مبلغ فعلی سفارش یکسان نیست.";
    await markPaymentForReconciliation({ authority, message, orderId: transaction.orderId, payload: queryPayload, transactionId: transaction.id, verification })
      .catch((error) => log("error", "Could not persist amount reconciliation", { orderId: transaction.orderId, error: error instanceof Error ? error.message : "unknown" }));
    return redirect(response, successPath(transaction.orderId, { review: true }));
  }

  try {
    const changed = await fulfillVerifiedPayment({ authority, orderId: transaction.orderId, transactionId: transaction.id, verification });
    if (changed) {
      await sendPaymentSuccessSms({
        prisma,
        phone: transaction.order.phone,
        orderId: transaction.orderId,
        amount: amountText(transaction.amount),
        refId: verification.refId,
      });
    }
    log("info", "Payment verified and fulfilled", { orderId: transaction.orderId, authority, refId: verification.refId });
    return redirect(response, successPath(transaction.orderId, { refId: verification.refId }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    log("error", "Verified payment requires reconciliation", { orderId: transaction.orderId, authority, refId: verification.refId, error: message });
    await markPaymentForReconciliation({ authority, message, orderId: transaction.orderId, payload: queryPayload, transactionId: transaction.id, verification })
      .catch((reconciliationError) => log("error", "Could not persist payment reconciliation", {
        orderId: transaction.orderId,
        authority,
        error: reconciliationError instanceof Error ? reconciliationError.message : "unknown",
      }));
    return redirect(response, successPath(transaction.orderId, { review: true }));
  }
}

async function handlePaymentStatus(orderId: string, response: ServerResponse) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { paymentTransactions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) return json(response, 404, { success: false, message: "سفارش پیدا نشد." });
  const payment = order.paymentTransactions[0];
  return json(response, 200, {
    success: true,
    orderId: order.id,
    orderStatus: order.status,
    paidAt: order.paidAt,
    paymentStatus: payment?.status ?? "unpaid",
    reviewRequired: payment
      ? payment.status === "paid"
        ? order.status !== "PAID"
        : BLOCKING_STATUSES.some((status) => status === payment.status)
      : false,
    refId: payment?.refId ?? order.paymentRefId,
    authority: payment?.authority ?? order.paymentAuthority,
  });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/health") return json(response, 200, { success: true, service: "oilbar-payment-service" });
    if (request.method === "POST" && url.pathname === "/api/payments/zarinpal/request") return handlePaymentRequest(request, response);
    if (request.method === "GET" && url.pathname === "/api/payments/zarinpal/callback") return handlePaymentCallback(url, response);
    const statusMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/payment-status$/);
    if (request.method === "GET" && statusMatch?.[1]) return handlePaymentStatus(statusMatch[1], response);
    return json(response, 404, { success: false, message: "مسیر پیدا نشد." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    log("error", "Unhandled payment service error", { error: message });
    return json(response, 500, { success: false, message: "خطای داخلی سرویس پرداخت." });
  }
});

server.listen(port, () => log("info", "Oilbar payment service started", { port }));
