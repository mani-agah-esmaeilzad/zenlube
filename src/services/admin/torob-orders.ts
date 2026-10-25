import { config } from "@/lib/config";
import prisma from "@/lib/prisma";

export async function getTorobOrdersTabData() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [settings, attributedOrders, eligibleOrders] = await Promise.all([
    prisma.torobOrderTrackingSettings.findUnique({ where: { id: "default" } }),
    prisma.order.count({ where: { torobClid: { not: null } } }),
    prisma.order.count({
      where: {
        torobClid: { not: null },
        status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] },
        createdAt: { gte: sevenDaysAgo },
      },
    }),
  ]);
  const baseUrl = config.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return {
    enabled: settings?.enabled ?? false,
    endpointUrl: `${baseUrl}/torob/v1/orders`,
    attributedOrders,
    eligibleOrders,
  };
}
