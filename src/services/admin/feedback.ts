import type { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

import type { FeedbackTabData } from "./types";

const DEFAULT_PER_PAGE = 15;
const eligibleStatuses = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

export async function getFeedbackTabData(
  options?: Partial<FeedbackTabData["filters"]>,
): Promise<FeedbackTabData> {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const perPage = options?.perPage && options.perPage > 0 ? Math.min(options.perPage, 50) : DEFAULT_PER_PAGE;
  const filters: FeedbackTabData["filters"] = {
    query: options?.query?.trim() || null,
    status: options?.status ?? "all",
    page,
    perPage,
  };

  const and: Prisma.OrderWhereInput[] = [];
  if (filters.query) {
    and.push({
      OR: [
        { id: { contains: filters.query, mode: "insensitive" } },
        { fullName: { contains: filters.query, mode: "insensitive" } },
        { phone: { contains: filters.query, mode: "insensitive" } },
        { email: { contains: filters.query, mode: "insensitive" } },
      ],
    });
  }
  if (filters.status === "not_sent") {
    and.push({ OR: [{ feedback: { is: null } }, { feedback: { is: { status: "PENDING" } } }] });
  } else if (filters.status === "sent") {
    and.push({ feedback: { is: { status: "SENT" } } });
  } else if (filters.status === "submitted") {
    and.push({ feedback: { is: { status: "SUBMITTED" } } });
  }

  const where: Prisma.OrderWhereInput = {
    status: { in: [...eligibleStatuses] },
    ...(and.length ? { AND: and } : {}),
  };

  const [orders, total, eligible, sent, submitted, rating] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: { select: { name: true } },
          },
        },
        feedback: {
          select: {
            id: true,
            status: true,
            overallRating: true,
            productQualityRating: true,
            deliveryRating: true,
            recommend: true,
            comment: true,
            sendCount: true,
            sentAt: true,
            expiresAt: true,
            submittedAt: true,
          },
        },
      },
    }),
    prisma.order.count({ where: { status: { in: [...eligibleStatuses] } } }),
    prisma.order.count({ where: { status: { in: [...eligibleStatuses] } } }),
    prisma.orderFeedback.count({ where: { status: "SENT" } }),
    prisma.orderFeedback.count({ where: { status: "SUBMITTED" } }),
    prisma.orderFeedback.aggregate({
      where: { status: "SUBMITTED" },
      _avg: { overallRating: true },
    }),
  ]);

  return {
    orders: orders.map((order) => ({
      ...order,
      total: Number(order.total),
      items: order.items.map((item) => ({ name: item.product.name, quantity: item.quantity })),
    })),
    filters,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
    metrics: {
      eligible,
      sent,
      submitted,
      averageRating: rating._avg.overallRating == null ? null : Number(rating._avg.overallRating),
    },
  };
}
