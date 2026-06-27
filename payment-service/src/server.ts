import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { Prisma, PrismaClient } from "../../src/generated/prisma";
import { requestZarinpalPayment, verifyZarinpalPayment } from "./zarinpal.service";
import { sendPaymentSuccessSms } from "./sms";

const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 3001);

type JsonObject = Record<string, unknown>;

function log(level: "info" | "warn" | "error", message: string, meta?: JsonObject) {
  const body = meta ? ` ${JSON.stringify(meta)}` : "";
  console[level](`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${body}`);
}

function frontendBaseUrl() {
  return (process.env.FRONTEND_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://oilbar.ir").replace(/\/$/, "");
}

function callbackUrl() {
  const value = process.env.ZARINPAL_CALLBACK_URL;
  if (!value) {
    throw new Error("ZARINPAL_CALLBACK_URL تنظیم نشده است.");
  }
  return value;
}

function amountText(amount: unknown) {
  return typeof amount === "object" && amount && "toString" in amount ? amount.toString() : String(amount);
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function json(response: ServerResponse, status: number, data: JsonObject) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(data));
}

function redirect(response: ServerResponse, path: string) {
  response.writeHead(302, { Location: `${frontendBaseUrl()}${path}` });
  response.end();
}

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as JsonObject;
}

function requireSecret(request: IncomingMessage) {
  const expected = process.env.PAYMENT_SERVICE_SECRET;
  if (!expected) return true;
  return request.headers["x-oilbar-payment-secret"] === expected;
}

function orderNumber(orderId: string) {
  return orderId.slice(-8).toUpperCase();
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

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    json(response, 404, { success: false, message: "سفارش پیدا نشد." });
    return;
  }
  if (order.status === "PAID" || order.paidAt) {
    json(response, 409, { success: false, message: "این سفارش قبلا پرداخت شده است." });
    return;
  }

  const transaction = await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      gateway: "zarinpal",
      amount: order.total,
      currency: process.env.ZARINPAL_AMOUNT_UNIT === "rial" ? "IRR" : "IRT",
      status: "pending",
      requestPayload: toJson({ orderId: order.id }),
    },
  });

  try {
    log("info", "Payment init request", { orderId: order.id, amount: amountText(order.total) });
    const payment = await requestZarinpalPayment({
      amount: order.total,
      callbackUrl: `${callbackUrl()}?orderId=${order.id}`,
      description: `پرداخت سفارش ${orderNumber(order.id)} در Oilbar`,
      email: order.email,
      phone: order.phone,
      metadata: { orderId: order.id, transactionId: transaction.id },
    });

    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          authority: payment.authority,
          requestPayload: toJson(payment.payload),
          requestResponse: toJson(payment.response),
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { paymentAuthority: payment.authority },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          gateway: "ZARINPAL",
          authority: payment.authority,
          status: "PENDING",
          payload: toJson(payment.response),
        },
      }),
    ]);

    log("info", "Payment init response", { orderId: order.id, authority: payment.authority });
    json(response, 200, { success: true, paymentUrl: payment.paymentUrl, authority: payment.authority, orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    log("error", "Payment init failed", { orderId: order.id, error: message });
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: "failed", errorMessage: message },
    });
    json(response, 502, { success: false, message: "ارتباط با زرین‌پال برقرار نشد. لطفا دوباره تلاش کنید." });
  }
}

async function markCanceled(authority: string | null, orderId: string | null, payload: JsonObject, reason: string) {
  const transaction = authority
    ? await prisma.paymentTransaction.findUnique({ where: { authority } })
    : orderId
      ? await prisma.paymentTransaction.findFirst({ where: { orderId }, orderBy: { createdAt: "desc" } })
      : null;

  if (transaction) {
    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: "canceled", errorMessage: reason, verifyResponse: toJson(payload) },
      }),
      prisma.order.update({ where: { id: transaction.orderId }, data: { status: "CANCELLED" } }),
      prisma.paymentEvent.create({
        data: {
          orderId: transaction.orderId,
          gateway: "ZARINPAL",
          authority,
          status: "CANCELLED",
          payload: toJson(payload),
        },
      }),
    ]);
  }

  return transaction?.orderId ?? orderId;
}

async function handlePaymentCallback(url: URL, response: ServerResponse) {
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");
  const orderId = url.searchParams.get("orderId");
  const queryPayload = Object.fromEntries(url.searchParams.entries());
  log("info", "Payment callback received", { authority, status, orderId });

  if (!authority) {
    redirect(response, `/checkout/failed?reason=missing&orderId=${orderId ?? ""}`);
    return;
  }

  const transaction = await prisma.paymentTransaction.findUnique({
    where: { authority },
    include: { order: { include: { items: true } } },
  });

  if (!transaction || (orderId && transaction.orderId !== orderId)) {
    redirect(response, `/checkout/failed?reason=not-found&orderId=${orderId ?? ""}`);
    return;
  }

  if (transaction.status === "paid" || transaction.status === "verified" || transaction.order.status === "PAID") {
    redirect(response, `/checkout/success?orderId=${transaction.orderId}`);
    return;
  }

  if (status !== "OK") {
    const canceledOrderId = await markCanceled(authority, transaction.orderId, queryPayload, status ?? "cancelled");
    redirect(response, `/checkout/failed?reason=cancelled&orderId=${canceledOrderId ?? ""}`);
    return;
  }

  try {
    const verification = await verifyZarinpalPayment(authority, transaction.amount);
    await prisma.$transaction(async (tx) => {
      const freshOrder = await tx.order.findUnique({
        where: { id: transaction.orderId },
        include: { items: true },
      });
      if (!freshOrder) {
        throw new Error("سفارش پیدا نشد.");
      }
      if (freshOrder.status === "PAID") {
        return;
      }

      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "paid",
          refId: verification.refId,
          cardPan: verification.cardPan,
          verifyPayload: toJson(verification.payload),
          verifyResponse: toJson(verification.response),
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: freshOrder.id },
        data: {
          status: "PAID",
          paymentRefId: verification.refId,
          paidAt: new Date(),
        },
      });

      await tx.cartItem.deleteMany({ where: { cart: { userId: freshOrder.userId } } });
      await Promise.all(
        freshOrder.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      await tx.paymentEvent.create({
        data: {
          orderId: freshOrder.id,
          gateway: "ZARINPAL",
          authority,
          status: "PAID",
          payload: toJson(verification.response),
        },
      });
    });

    await sendPaymentSuccessSms({
      prisma,
      phone: transaction.order.phone,
      orderId: transaction.orderId,
      amount: amountText(transaction.amount),
      refId: verification.refId,
    });

    log("info", "Payment verified", { orderId: transaction.orderId, refId: verification.refId });
    redirect(response, `/checkout/success?orderId=${transaction.orderId}&refId=${verification.refId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    log("error", "Payment verify failed", { orderId: transaction.orderId, authority, error: message });
    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: "failed", errorMessage: message, verifyResponse: toJson({ error: message, query: queryPayload }) },
      }),
      prisma.order.update({ where: { id: transaction.orderId }, data: { status: "CANCELLED" } }),
      prisma.paymentEvent.create({
        data: {
          orderId: transaction.orderId,
          gateway: "ZARINPAL",
          authority,
          status: "FAILED",
          payload: toJson({ error: message, query: queryPayload }),
        },
      }),
    ]);
    redirect(response, `/checkout/failed?reason=verify&orderId=${transaction.orderId}`);
  }
}

async function handlePaymentStatus(orderId: string, response: ServerResponse) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { paymentTransactions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) {
    json(response, 404, { success: false, message: "سفارش پیدا نشد." });
    return;
  }

  const payment = order.paymentTransactions[0];
  json(response, 200, {
    success: true,
    orderId: order.id,
    orderStatus: order.status,
    paidAt: order.paidAt,
    paymentStatus: payment?.status ?? "unpaid",
    refId: payment?.refId ?? order.paymentRefId,
    authority: payment?.authority ?? order.paymentAuthority,
  });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "GET" && url.pathname === "/health") {
      json(response, 200, { success: true, service: "oilbar-payment-service" });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/payments/zarinpal/request") {
      await handlePaymentRequest(request, response);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/payments/zarinpal/callback") {
      await handlePaymentCallback(url, response);
      return;
    }

    const statusMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/payment-status$/);
    if (request.method === "GET" && statusMatch?.[1]) {
      await handlePaymentStatus(statusMatch[1], response);
      return;
    }

    json(response, 404, { success: false, message: "مسیر پیدا نشد." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    log("error", "Unhandled payment service error", { error: message });
    json(response, 500, { success: false, message: "خطای داخلی سرویس پرداخت." });
  }
});

server.listen(port, () => {
  log("info", "Oilbar payment service started", { port });
});
