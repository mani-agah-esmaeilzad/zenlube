import prisma from "../prisma";
import { createPageInfo } from "../pagination";

export async function getBrandsWithProductCount() {
  return prisma.brand.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: { NOT: { slug: { startsWith: "deleted-" } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPaginatedBrandsWithProductCount({ page = 1, pageSize = 12 }: { page?: number; pageSize?: number }) {
  const skip = (page - 1) * pageSize;
  const [items, total] = await prisma.$transaction([
    prisma.brand.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: { NOT: { slug: { startsWith: "deleted-" } } },
            },
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.brand.count(),
  ]);

  return {
    items,
    pageInfo: createPageInfo(page, pageSize, total),
  };
}
