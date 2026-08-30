import { Prisma } from "@/generated/prisma";
import prisma from "../prisma";
import { createPageInfo } from "../pagination";
import { storefrontVisibleProductWhere } from "../storefront-visibility";
import { createEmptyPageResult, withStorefrontDataFallback } from "./storefront-fallback";

type CategoryWithProductCount = Prisma.CategoryGetPayload<{
  include: {
    _count: {
      select: {
        products: true;
      };
    };
  };
}>;

type HeaderCategory = Prisma.CategoryGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    imageUrl: true;
    _count: {
      select: {
        products: true;
      };
    };
  };
}>;

export async function getHighlightedCategories() {
  return withStorefrontDataFallback("getHighlightedCategories", [], () =>
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: { where: storefrontVisibleProductWhere() },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  );
}

export async function getPaginatedCategoriesWithProductCount({ page = 1, pageSize = 12 }: { page?: number; pageSize?: number }) {
  return withStorefrontDataFallback(
    "getPaginatedCategoriesWithProductCount",
    createEmptyPageResult<CategoryWithProductCount>(page, pageSize),
    async () => {
      const skip = (page - 1) * pageSize;
      const [items, total] = await prisma.$transaction([
        prisma.category.findMany({
          include: {
            _count: {
              select: {
                products: { where: storefrontVisibleProductWhere() },
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
    },
  );
}

export async function getAllCategoriesLite() {
  return withStorefrontDataFallback("getAllCategoriesLite", [], () =>
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    }),
  );
}

export async function getHeaderCategories() {
  return withStorefrontDataFallback<HeaderCategory[]>("getHeaderCategories", [], async () => {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        _count: {
          select: {
            products: { where: storefrontVisibleProductWhere() },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.filter((category) => category._count.products > 0);
  });
}
