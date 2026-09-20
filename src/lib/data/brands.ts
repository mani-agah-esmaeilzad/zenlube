import { Prisma } from "@/generated/prisma";
import { cache } from "react";
import prisma from "../prisma";
import { createPageInfo } from "../pagination";
import { storefrontVisibleProductWhere } from "../storefront-visibility";
import { createEmptyPageResult, withStorefrontDataFallback } from "./storefront-fallback";

type BrandWithProductCount = Prisma.BrandGetPayload<{
  include: {
    _count: {
      select: {
        products: true;
      };
    };
  };
}>;

export const getBrandsWithProductCount = cache(async function getBrandsWithProductCount() {
  return withStorefrontDataFallback("getBrandsWithProductCount", [], () =>
    prisma.brand.findMany({
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
});

export async function getPaginatedBrandsWithProductCount({ page = 1, pageSize = 12 }: { page?: number; pageSize?: number }) {
  return withStorefrontDataFallback(
    "getPaginatedBrandsWithProductCount",
    createEmptyPageResult<BrandWithProductCount>(page, pageSize),
    async () => {
      const skip = (page - 1) * pageSize;
      const [items, total] = await prisma.$transaction([
        prisma.brand.findMany({
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
        prisma.brand.count(),
      ]);

      return {
        items,
        pageInfo: createPageInfo(page, pageSize, total),
      };
    },
  );
}

export async function getBrandLandingBySlug(slug: string) {
  return withStorefrontDataFallback("getBrandLandingBySlug", null, async () => {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: { where: storefrontVisibleProductWhere() },
          },
        },
      },
    });
    if (!brand) return null;

    const visibleBrandProductsWhere = storefrontVisibleProductWhere({ brandId: brand.id });
    const [availableCount, unavailableCount, categoryGroups] = await Promise.all([
      prisma.product.count({ where: storefrontVisibleProductWhere({ brandId: brand.id, stock: { gt: 0 }, price: { gt: 0 } }) }),
      prisma.product.count({
        where: storefrontVisibleProductWhere({
          brandId: brand.id,
          OR: [
            { stock: { lte: 0 } },
            { price: { lte: 0 } },
          ],
        }),
      }),
      prisma.product.groupBy({
        by: ["categoryId"],
        where: visibleBrandProductsWhere,
        _count: { _all: true },
      }),
    ]);
    const categories = categoryGroups.length
      ? await prisma.category.findMany({
          where: { id: { in: categoryGroups.map((item) => item.categoryId) } },
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        })
      : [];
    const countsByCategoryId = new Map(categoryGroups.map((item) => [item.categoryId, item._count._all]));

    return {
      brand,
      availableCount,
      unavailableCount,
      categorySummaries: categories.map((category) => ({
        ...category,
        count: countsByCategoryId.get(category.id) ?? 0,
      })),
    };
  });
}
