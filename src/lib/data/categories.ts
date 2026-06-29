import prisma from "../prisma";
import { createPageInfo } from "../pagination";

export async function getHighlightedCategories() {
  return prisma.category.findMany({
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

export async function getPaginatedCategoriesWithProductCount({ page = 1, pageSize = 12 }: { page?: number; pageSize?: number }) {
  const skip = (page - 1) * pageSize;
  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({
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
    prisma.category.count(),
  ]);

  return {
    items,
    pageInfo: createPageInfo(page, pageSize, total),
  };
}

export async function getAllCategoriesLite() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });
}
