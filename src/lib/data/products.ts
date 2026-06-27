import { Prisma } from "@/generated/prisma";
import prisma from "../prisma";

export async function getFeaturedProducts(limit = 6) {
  return prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: [{ isBestseller: "desc" }, { updatedAt: "desc" }],
    include: {
      brand: true,
      category: true,
      carMappings: {
        include: { car: true },
      },
      reviews: {
        take: 3,
        orderBy: { createdAt: "desc" },
      },
    },
    take: limit,
  });
}

export async function getBestsellerProducts(limit = 8) {
  return prisma.product.findMany({
    where: {
      OR: [
        { isBestseller: true },
        { reviewCount: { gt: 60 } },
      ],
    },
    orderBy: [
      { isBestseller: "desc" },
      { reviewCount: "desc" },
      { averageRating: "desc" },
    ],
    take: limit,
    include: {
      brand: true,
      category: true,
      carMappings: {
        include: { car: true },
      },
      reviews: {
        take: 3,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export type ProductSort =
  | "latest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "bestseller";

const sortConfig: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  latest: [{ createdAt: "desc" }],
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
  rating: [
    { averageRating: "desc" },
    { reviewCount: "desc" },
  ],
  bestseller: [
    { isBestseller: "desc" },
    { reviewCount: "desc" },
  ],
};

type ProductFilters = {
  search?: string;
  category?: string;
  brand?: string;
  car?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: ProductSort;
};

export async function getAllProductsWithFilters({
  search,
  category,
  brand,
  car,
  tags,
  page = 1,
  pageSize = 12,
  sort = "latest",
}: ProductFilters) {
  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { approvals: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(brand ? { brand: { slug: brand } } : {}),
    ...(car
      ? {
          carMappings: {
            some: {
              car: { slug: car },
            },
          },
        }
      : {}),
    ...(tags && tags.length > 0
      ? {
          tags: {
            hasSome: tags,
          },
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        carMappings: {
          include: { car: true },
        },
      },
      orderBy: [...(sortConfig[sort] ?? sortConfig.latest), { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    pageInfo: {
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      carMappings: {
        include: {
          car: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      questions: {
        where: {
          status: {
            not: "ARCHIVED",
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getProductReviews(productId: string, limit = 8) {
  return prisma.productReview.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getLatestReviews(limit = 6) {
  return prisma.productReview.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          imageUrl: true,
        },
      },
    },
    take: limit,
  });
}

export async function getAllProductsLite() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      viscosity: true,
      oilType: true,
      approvals: true,
      averageRating: true,
      reviewCount: true,
      price: true,
      tags: true,
      brand: {
        select: { name: true },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: [
      { brand: { name: "asc" } },
      { name: "asc" },
    ],
  });

  return products.map((product) => ({
    ...product,
    averageRating: product.averageRating != null ? Number(product.averageRating) : null,
    price: Number(product.price),
  }));
}
