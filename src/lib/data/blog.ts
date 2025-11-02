import { Prisma } from "@/generated/prisma";
import prisma from "../prisma";

export async function getLatestBlogPosts(limit = 6) {
  return prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
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
    : undefined;

  return prisma.blogPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getAllBlogPosts() {
  return prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
  });
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
  });
}
