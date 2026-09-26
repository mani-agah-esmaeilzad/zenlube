import type { Prisma } from "@/generated/prisma";
import {
  CART_ACTIVE_WINDOW_MS,
  CHECKOUT_ACTIVE_WINDOW_MS,
  classifyCartActivity,
  getLatestCartActivity,
} from "@/lib/cart-activity";
import prisma from "@/lib/prisma";
import { resolveProductPricing } from "@/lib/pricing";

import type { CartActivityFilter, CartsTabData } from "./types";

const DEFAULT_PER_PAGE = 15;

function getStatusWhere(filter: CartActivityFilter, now: Date): Prisma.CartWhereInput | null {
  const checkoutCutoff = new Date(now.getTime() - CHECKOUT_ACTIVE_WINDOW_MS);
  const cartCutoff = new Date(now.getTime() - CART_ACTIVE_WINDOW_MS);

  switch (filter) {
    case "checkout_active":
      return { checkoutLastSeenAt: { gte: checkoutCutoff } };
    case "checkout_abandoned":
      return {
        checkoutStartedAt: { not: null },
        OR: [{ checkoutLastSeenAt: null }, { checkoutLastSeenAt: { lt: checkoutCutoff } }],
      };
    case "cart_active":
      return {
        checkoutStartedAt: null,
        AND: [
          { OR: [{ checkoutLastSeenAt: null }, { checkoutLastSeenAt: { lt: checkoutCutoff } }] },
          {
            OR: [
              { lastCartSeenAt: { gte: cartCutoff } },
              { items: { some: { updatedAt: { gte: cartCutoff } } } },
            ],
          },
        ],
      };
    case "cart_abandoned":
      return {
        checkoutStartedAt: null,
        AND: [
          { OR: [{ checkoutLastSeenAt: null }, { checkoutLastSeenAt: { lt: checkoutCutoff } }] },
          { OR: [{ lastCartSeenAt: null }, { lastCartSeenAt: { lt: cartCutoff } }] },
          { items: { none: { updatedAt: { gte: cartCutoff } } } },
        ],
      };
    default:
      return null;
  }
}

function makeCartWhere(
  status: CartActivityFilter,
  query: string | null | undefined,
  now: Date,
): Prisma.CartWhereInput {
  const conditions: Prisma.CartWhereInput[] = [{ items: { some: {} } }];
  const statusWhere = getStatusWhere(status, now);
  if (statusWhere) conditions.push(statusWhere);

  if (query) {
    conditions.push({
      user: {
        is: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
          ],
        },
      },
    });
  }

  return { AND: conditions };
}

export async function getCartsTabData(
  options?: Partial<CartsTabData["filters"]>,
): Promise<CartsTabData> {
  const now = new Date();
  const page = options?.page && options.page > 0 ? Math.floor(options.page) : 1;
  const perPage = options?.perPage && options.perPage > 0
    ? Math.min(Math.floor(options.perPage), 50)
    : DEFAULT_PER_PAGE;
  const filters: CartsTabData["filters"] = {
    query: options?.query?.trim() || null,
    status: options?.status ?? "all",
    page,
    perPage,
  };
  const where = makeCartWhere(filters.status, filters.query, now);
  const baseWhere: Prisma.CartWhereInput = { items: { some: {} } };

  const [carts, total, allTotal, checkoutActive, checkoutAbandoned, cartActive, cartAbandoned] = await Promise.all([
    prisma.cart.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        createdAt: true,
        lastCartSeenAt: true,
        checkoutStartedAt: true,
        checkoutLastSeenAt: true,
        items: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            productId: true,
            quantity: true,
            updatedAt: true,
            product: {
              select: {
                name: true,
                slug: true,
                imageUrl: true,
                stock: true,
                price: true,
                brand: { select: { name: true } },
                promotion: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            orders: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true, status: true, createdAt: true },
            },
          },
        },
      },
    }),
    prisma.cart.count({ where }),
    prisma.cart.count({ where: baseWhere }),
    prisma.cart.count({ where: { AND: [baseWhere, getStatusWhere("checkout_active", now)!] } }),
    prisma.cart.count({ where: { AND: [baseWhere, getStatusWhere("checkout_abandoned", now)!] } }),
    prisma.cart.count({ where: { AND: [baseWhere, getStatusWhere("cart_active", now)!] } }),
    prisma.cart.count({ where: { AND: [baseWhere, getStatusWhere("cart_abandoned", now)!] } }),
  ]);

  return {
    carts: carts.map((cart) => {
      const latestItemUpdatedAt = cart.items[0]?.updatedAt ?? null;
      const items = cart.items.map((item) => {
        const unitPrice = resolveProductPricing(item.product, now).effectivePrice;
        return {
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          slug: item.product.slug,
          imageUrl: item.product.imageUrl,
          brandName: item.product.brand.name,
          quantity: item.quantity,
          stock: item.product.stock,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
          updatedAt: item.updatedAt,
        };
      });

      return {
        id: cart.id,
        user: {
          id: cart.user.id,
          name: cart.user.name,
          email: cart.user.email,
          phone: cart.user.phone,
        },
        status: classifyCartActivity({
          lastCartSeenAt: cart.lastCartSeenAt,
          checkoutStartedAt: cart.checkoutStartedAt,
          checkoutLastSeenAt: cart.checkoutLastSeenAt,
          latestItemUpdatedAt,
        }, now),
        itemCount: items.length,
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        total: items.reduce((sum, item) => sum + item.lineTotal, 0),
        createdAt: cart.createdAt,
        lastActivityAt: getLatestCartActivity({
          lastCartSeenAt: cart.lastCartSeenAt,
          checkoutStartedAt: cart.checkoutStartedAt,
          checkoutLastSeenAt: cart.checkoutLastSeenAt,
          latestItemUpdatedAt,
        }) ?? cart.createdAt,
        checkoutStartedAt: cart.checkoutStartedAt,
        items,
        latestOrder: cart.user.orders[0] ?? null,
      };
    }),
    filters,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
    metrics: {
      total: allTotal,
      checkoutActive,
      checkoutAbandoned,
      cartActive,
      cartAbandoned,
    },
  };
}
