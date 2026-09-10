import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

import { mapOrderDetail } from "./mappers";
import { mapOrderSmsFeedback } from "./order-sms";
import type { OrdersTabData } from "./types";

const DEFAULT_PER_PAGE = 12;

export async function getOrdersTabData(options?: Partial<OrdersTabData["filters"]>): Promise<OrdersTabData> {
  const rawPage = options?.page ?? 1;
  const rawPerPage = options?.perPage ?? DEFAULT_PER_PAGE;

  const filters = {
    status: options?.status ?? "all",
    query: options?.query ?? null,
    shipping: options?.shipping ?? "all",
    page: rawPage > 0 ? rawPage : 1,
    perPage: rawPerPage > 0 ? rawPerPage : DEFAULT_PER_PAGE,
  } as OrdersTabData["filters"];

  const where: Prisma.OrderWhereInput = {};
  if (filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters.query) {
    where.OR = [
      { id: { contains: filters.query, mode: "insensitive" } },
      { fullName: { contains: filters.query, mode: "insensitive" } },
      { email: { contains: filters.query, mode: "insensitive" } },
      { phone: { contains: filters.query, mode: "insensitive" } },
    ];
  }
  if (filters.shipping === "POST" || filters.shipping === "TIPAX") {
    where.shippingCarrierCode = filters.shipping;
  } else if (filters.shipping === "UNSHIPPED") {
    where.status = "PAID";
  } else if (filters.shipping === "SHIPPED") {
    where.status = { in: ["SHIPPED", "DELIVERED"] };
  } else if (filters.shipping === "TRACKING") {
    where.shippingTrackingCode = { not: null };
  }

  const skip = (filters.page - 1) * filters.perPage;

  const [orders, total, grouped, revenueLast30] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
        paymentEvents: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            gateway: true,
            authority: true,
            status: true,
            createdAt: true,
          },
        },
        shipment: true,
      },
      skip,
      take: filters.perPage,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const statusCounts = grouped.reduce<Record<string, number>>((acc, group) => {
    acc[group.status] = group._count.status;
    return acc;
  }, {});

  const totalPages = Math.max(1, Math.ceil(total / filters.perPage));

  const notificationKeys = orders.map((order) => ({
    status: order.status === "PENDING" ? null : `order_status:${order.id}:${order.status}`,
    tracking: order.shippingTrackingCode?.trim()
      ? `tracking:${order.id}:${order.shippingTrackingCode.trim()}`
      : null,
    merchant: `merchant_order_created:${order.id}`,
  }));
  const dedupeKeys = notificationKeys.flatMap(({ status, tracking, merchant }) =>
    [status, tracking, merchant].filter((key): key is string => key !== null),
  );
  const smsLogs = dedupeKeys.length
    ? await prisma.smsLog.findMany({
        where: { dedupeKey: { in: dedupeKeys } },
        select: { dedupeKey: true, status: true, errorMessage: true },
      })
    : [];
  const smsLogsByKey = new Map(smsLogs.map((log) => [log.dedupeKey, log]));

  return {
    orders: orders.map((order, index) => {
      const keys = notificationKeys[index];
      return {
        ...mapOrderDetail(order),
        smsNotifications: {
          status: keys.status ? mapOrderSmsFeedback(smsLogsByKey.get(keys.status)) : null,
          tracking: keys.tracking ? mapOrderSmsFeedback(smsLogsByKey.get(keys.tracking)) : null,
          merchant: mapOrderSmsFeedback(smsLogsByKey.get(keys.merchant)),
        },
      };
    }),
    filters,
    pagination: {
      page: filters.page,
      perPage: filters.perPage,
      total,
      totalPages,
    },
    statusCounts,
    revenueLast30: Number(revenueLast30._sum.total ?? 0),
  };
}
