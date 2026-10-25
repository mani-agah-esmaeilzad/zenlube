import { Prisma } from "@/generated/prisma";
import { cache } from "react";
import prisma from "../prisma";
import { LOCAL_IMAGE_PLACEHOLDERS, safeImageSrc } from "../local-assets";
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

function withSafeCategoryImage<T extends { imageUrl?: string | null }>(category: T): T {
  return {
    ...category,
    imageUrl: safeImageSrc(category.imageUrl, LOCAL_IMAGE_PLACEHOLDERS.category),
  };
}

export const getHighlightedCategories = cache(async function getHighlightedCategories() {
  return withStorefrontDataFallback("getHighlightedCategories", [], async () => {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: { where: storefrontVisibleProductWhere() },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.map(withSafeCategoryImage);
  });
});

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
        items: items.map(withSafeCategoryImage),
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

    return categories.filter((category) => category._count.products > 0).map(withSafeCategoryImage);
  });
}
