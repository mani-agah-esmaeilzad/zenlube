import prisma from "@/lib/prisma";

import { mapOrderDetail } from "./mappers";
import type { OrdersTabData } from "./types";

const DEFAULT_PER_PAGE = 12;

export async function getOrdersTabData(options?: Partial<OrdersTabData["filters"]>): Promise<OrdersTabData> {
  const rawPage = options?.page ?? 1;
  const rawPerPage = options?.perPage ?? DEFAULT_PER_PAGE;

  const filters = {
    status: options?.status ?? "all",
    query: options?.query ?? null,
    page: rawPage > 0 ? rawPage : 1,
    perPage: rawPerPage > 0 ? rawPerPage : DEFAULT_PER_PAGE,
  } as OrdersTabData["filters"];

  const where = {
    ...(filters.status !== "all" ? { status: filters.status } : {}),
    ...(filters.query
      ? {
          OR: [
            { id: { contains: filters.query, mode: "insensitive" } },
            { fullName: { contains: filters.query, mode: "insensitive" } },
            { email: { contains: filters.query, mode: "insensitive" } },
            { phone: { contains: filters.query, mode: "insensitive" } },
          ],
        }
      : {}),
  } as const;

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

  return {
    orders: orders.map(mapOrderDetail),
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
