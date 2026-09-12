import type { MetadataRoute } from "next";

import prisma from "@/lib/prisma";
import { storefrontVisibleCarWhere, storefrontVisibleProductWhere } from "@/lib/storefront-visibility";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, cars, posts] = await Promise.all([
    prisma.product.findMany({
      where: storefrontVisibleProductWhere(),
      select: { slug: true, updatedAt: true },
      orderBy: { id: "desc" },
    }),
    prisma.category.findMany({
      where: { products: { some: storefrontVisibleProductWhere() } },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
    prisma.brand.findMany({
      where: { products: { some: storefrontVisibleProductWhere() } },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
    prisma.car.findMany({
      where: storefrontVisibleCarWhere(),
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
    prisma.blogPost.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/brands`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/cars`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/support`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticEntries,
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${SITE_URL}/products?category=${encodeURIComponent(category.slug)}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...brands.map((brand) => ({
      url: `${SITE_URL}/products?brand=${encodeURIComponent(brand.slug)}`,
      lastModified: brand.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...cars.map((car) => ({
      url: `${SITE_URL}/cars/${encodeURIComponent(car.slug)}`,
      lastModified: car.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
