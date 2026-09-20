import { Prisma } from "@/generated/prisma";
import { cache } from "react";

import prisma from "../prisma";
import { withStorefrontDataFallback } from "./storefront-fallback";

const brandArticleAliases: Record<string, string[]> = {
  xado: ["زادو", "XADO"],
  aidlube: ["ایدلوب", "Aidlube"],
  "persia-sign": ["پرشیا ساین", "پرشین ساین", "Persia Sign"],
  zic: ["زیک", "ZIC"],
  aisin: ["آیسین", "AISIN"],
  fosser: ["فوسر", "FOSSER"],
  bareliz: ["بارلیز", "BARELIZ"],
  woofer: ["ووفر", "Woofer"],
};

export const getRelatedBrandArticles = cache(async function getRelatedBrandArticles(
  brandSlug: string,
  brandName: string,
  limit = 3,
) {
  const terms = [...new Set([brandName, ...(brandArticleAliases[brandSlug] ?? [])])]
    .map((term) => term.trim())
    .filter(Boolean);

  return withStorefrontDataFallback("getRelatedBrandArticles", [], async () => {
    const brandProducts = await prisma.product.findMany({
      where: { brand: { slug: brandSlug } },
      select: { slug: true },
    });
    const relatedProductSlugs = brandProducts.map((product) => product.slug);
    const textConditions: Prisma.BlogPostWhereInput[] = terms.flatMap((term) => [
      { title: { contains: term, mode: Prisma.QueryMode.insensitive } },
      { excerpt: { contains: term, mode: Prisma.QueryMode.insensitive } },
      { content: { contains: term, mode: Prisma.QueryMode.insensitive } },
      { tags: { has: term } },
    ]);

    return prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        OR: [
          ...textConditions,
          ...(relatedProductSlugs.length ? [{ relatedProductSlugs: { hasSome: relatedProductSlugs } }] : []),
        ],
      },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: Math.min(Math.max(limit, 1), 6),
    });
  });
});
