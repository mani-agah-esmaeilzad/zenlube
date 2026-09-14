import { Prisma } from "@/generated/prisma";
import { cache } from "react";
import prisma from "../prisma";
import { createPageInfo } from "../pagination";
import { createEmptyPageResult, withStorefrontDataFallback } from "./storefront-fallback";
import { storefrontVisibleProductWhere } from "../storefront-visibility";

const publishedBlogWhere = {
  status: "PUBLISHED" as const,
  publishedAt: { lte: new Date() },
};

const blogPostInclude = {
  category: true,
} satisfies Prisma.BlogPostInclude;

const relatedProductInclude = {
  brand: true,
  category: true,
  promotion: true,
  carMappings: {
    include: {
      car: true,
    },
  },
} satisfies Prisma.ProductInclude;

type BlogPostItem = Prisma.BlogPostGetPayload<{ include: typeof blogPostInclude }>;

export async function getLatestBlogPosts(limit = 6) {
  return withStorefrontDataFallback("getLatestBlogPosts", [], () =>
    prisma.blogPost.findMany({
      where: publishedBlogWhere,
      include: blogPostInclude,
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
      take: limit,
    }),
  );
}

export async function getRelatedBlogPostsForCar(
  manufacturer: string,
  model?: string | null,
  limit = 3,
) {
  const terms = [manufacturer, model]
    .filter((term): term is string => typeof term === "string" && term.trim().length > 0)
    .map((term) => term.trim());

  const where = terms.length
    ? {
        ...publishedBlogWhere,
        OR: [
          { tags: { hasSome: terms.map((term) => term.toLowerCase()) } },
          ...terms.map((term) => ({
            title: { contains: term, mode: Prisma.QueryMode.insensitive },
          })),
          ...terms.map((term) => ({
            excerpt: { contains: term, mode: Prisma.QueryMode.insensitive },
          })),
        ],
      }
    : publishedBlogWhere;

  return withStorefrontDataFallback("getRelatedBlogPostsForCar", [], () =>
    prisma.blogPost.findMany({
      where,
      include: blogPostInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
    }),
  );
}

export async function getAllBlogPosts() {
  return withStorefrontDataFallback("getAllBlogPosts", [], () =>
    prisma.blogPost.findMany({
      where: publishedBlogWhere,
      include: blogPostInclude,
      orderBy: { publishedAt: "desc" },
    }),
  );
}

export async function getBlogCategories() {
  return withStorefrontDataFallback("getBlogCategories", [], () =>
    prisma.blogCategory.findMany({
      where: { isActive: true, posts: { some: publishedBlogWhere } },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: { _count: { select: { posts: { where: publishedBlogWhere } } } },
    }),
  );
}

export async function getPaginatedBlogPosts({ page = 1, pageSize = 10, category }: { page?: number; pageSize?: number; category?: string | null }) {
  return withStorefrontDataFallback(
    "getPaginatedBlogPosts",
    createEmptyPageResult<BlogPostItem>(page, pageSize),
    async () => {
    const skip = (page - 1) * pageSize;
    const where: Prisma.BlogPostWhereInput = {
      ...publishedBlogWhere,
      ...(category ? { category: { slug: category, isActive: true } } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        include: blogPostInclude,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      pageInfo: createPageInfo(page, pageSize, total),
    };
    },
  );
}

export const getBlogPostBySlug = cache(async function getBlogPostBySlug(slug: string) {
  return withStorefrontDataFallback("getBlogPostBySlug", null, async () => {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        ...publishedBlogWhere,
      },
      include: blogPostInclude,
    });

    if (!post) return null;

    const relatedProducts = post.relatedProductSlugs.length
      ? await prisma.product.findMany({
          where: storefrontVisibleProductWhere({ slug: { in: post.relatedProductSlugs } }),
          include: relatedProductInclude,
        })
      : [];

    const order = new Map(post.relatedProductSlugs.map((productSlug, index) => [productSlug, index]));
    relatedProducts.sort((a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999));

    return { ...post, relatedProducts };
  });
});
