import { Prisma } from "@/generated/prisma";
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

export async function getBrandsWithProductCount() {
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
}

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
