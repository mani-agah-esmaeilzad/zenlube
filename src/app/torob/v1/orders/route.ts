import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { TOROB_ATTRIBUTION_MAX_AGE_SECONDS } from "@/lib/torob-attribution";
import { absoluteStorefrontUrl, rialToTorobToman, verifyTorobJwt } from "@/lib/torob";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

function isUtcIsoTimestamp(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

function getSafeTokenAudience(token: string) {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return "missing";
    const payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8")) as { aud?: unknown };
    if (typeof payload.aud !== "string") return typeof payload.aud;
    return /^[a-z0-9.-]+(?::\d+)?$/i.test(payload.aud) && payload.aud.length <= 255
      ? payload.aud
      : "non-hostname audience";
  } catch {
    return "unreadable";
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-torob-token");
  const tokenVersion = request.headers.get("x-torob-token-version");
  const host = request.headers.get("host");
  if (!token || tokenVersion !== "1" || !host) {
    logger.warn("Torob order API request rejected: authentication headers missing or invalid", {
      hasToken: Boolean(token),
      tokenVersion,
      host,
    });
    return json({ success: false, message: "Missing or invalid Torob authentication headers" }, 401);
  }

  try {
    verifyTorobJwt(token, host);
  } catch (error) {
    logger.warn("Torob order API request rejected: JWT verification failed", {
      host,
      reason: error instanceof Error ? error.message : "unknown verification error",
      ...(error instanceof Error && error.message.includes("دامنه توکن") ? { tokenAudience: getSafeTokenAudience(token) } : {}),
    });
    return json({ success: false, message: "Invalid Torob JWT" }, 401);
  }

  const settings = await prisma.torobOrderTrackingSettings.findUnique({ where: { id: "default" }, select: { enabled: true } });
  if (!settings?.enabled) return json({ success: false, message: "Order tracking is disabled" }, 403);

  const url = new URL(request.url);
  const timestampValues = url.searchParams.getAll("purchase_timestamp_gt");
  const limitValues = url.searchParams.getAll("limit");
  if (timestampValues.length !== 1 || !isUtcIsoTimestamp(timestampValues[0])) {
    return json({ success: false, message: "purchase_timestamp_gt must be a valid UTC ISO 8601 timestamp" }, 400);
  }
  if (limitValues.length !== 1 || !/^\d+$/.test(limitValues[0] ?? "")) {
    return json({ success: false, message: "limit must be an integer between 1 and 1000" }, 400);
  }
  const limit = Number(limitValues[0]);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
    return json({ success: false, message: "limit must be an integer between 1 and 1000" }, 400);
  }

  const cursor = new Date(timestampValues[0]);
  const sevenDaysAgo = new Date(Date.now() - TOROB_ATTRIBUTION_MAX_AGE_SECONDS * 1000);
  const orders = await prisma.order.findMany({
    where: {
      torobClid: { not: null },
      status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] },
      OR: [
        { createdAt: { gt: cursor } },
        { AND: [{ updatedAt: { gt: cursor } }, { createdAt: { gte: sevenDaysAgo } }] },
      ],
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: limit,
    select: {
      id: true,
      torobClid: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      total: true,
      discountAmount: true,
      shippingCost: true,
      phone: true,
      items: { select: { quantity: true, price: true, product: { select: { slug: true } } } },
    },
  });

  const baseUrl = config.NEXT_PUBLIC_APP_URL;
  return json({
    success: true,
    data: orders.map((order) => {
      const itemsSubtotalRials = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
      const orderValueRials = Math.max(0, itemsSubtotalRials - Number(order.discountAmount));
      return {
        purchase_timestamp: order.createdAt.toISOString(),
        last_updated_timestamp: order.updatedAt.toISOString(),
        torob_clid: order.torobClid,
        status: order.status === "CANCELLED" ? "cancelled" : "completed",
        order_value: rialToTorobToman(orderValueRials),
        shipping_amount: rialToTorobToman(Number(order.shippingCost)),
        phone_number: order.phone,
        products: order.items.map((item) => ({
          product_url: absoluteStorefrontUrl(`/products/${encodeURIComponent(item.product.slug)}`, baseUrl),
          product_price: rialToTorobToman(Number(item.price)),
          quantity: item.quantity,
        })),
      };
    }),
  });
}
