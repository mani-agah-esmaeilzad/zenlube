import { Prisma } from "@/generated/prisma";
import prisma from "../prisma";

export async function getFeaturedProducts(limit = 6) {
  return prisma.product.findMany({
    where: { isFeatured: true, NOT: { slug: { startsWith: "deleted-" } } },
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
      NOT: { slug: { startsWith: "deleted-" } },
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
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
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
  minPrice,
  maxPrice,
  inStock,
  minRating,
  page = 1,
  pageSize = 12,
  sort = "latest",
}: ProductFilters) {
  const where: Prisma.ProductWhereInput = {
    NOT: { slug: { startsWith: "deleted-" } },
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
    ...(typeof minPrice === "number" && Number.isFinite(minPrice)
      ? {
          price: {
            ...(typeof maxPrice === "number" && Number.isFinite(maxPrice) ? { lte: maxPrice } : {}),
            gte: minPrice,
          },
        }
      : typeof maxPrice === "number" && Number.isFinite(maxPrice)
        ? {
            price: {
              lte: maxPrice,
            },
          }
        : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
    ...(typeof minRating === "number" && Number.isFinite(minRating) ? { averageRating: { gte: minRating } } : {}),
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
    where: { slug, NOT: { slug: { startsWith: "deleted-" } } },
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
    where: { NOT: { slug: { startsWith: "deleted-" } } },
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

export async function getSearchSuggestions(query: string) {
  const term = query.trim();
  if (term.length < 2) {
    return {
      products: [],
      brands: [],
      categories: [],
      cars: [],
    };
  }

  const [products, brands, categories, cars] = await Promise.all([
    prisma.product.findMany({
      where: {
        NOT: { slug: { startsWith: "deleted-" } },
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { sku: { contains: term, mode: "insensitive" } },
          { brand: { name: { contains: term, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: { select: { name: true } },
      },
      take: 6,
      orderBy: [{ isFeatured: "desc" }, { reviewCount: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.brand.findMany({
      where: { name: { contains: term, mode: "insensitive" } },
      select: { id: true, name: true, slug: true },
      take: 4,
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { name: { contains: term, mode: "insensitive" } },
      select: { id: true, name: true, slug: true },
      take: 4,
      orderBy: { name: "asc" },
    }),
    prisma.car.findMany({
      where: {
        OR: [
          { manufacturer: { contains: term, mode: "insensitive" } },
          { model: { contains: term, mode: "insensitive" } },
          { generation: { contains: term, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        slug: true,
        manufacturer: true,
        model: true,
        generation: true,
      },
      take: 4,
      orderBy: [{ manufacturer: "asc" }, { model: "asc" }],
    }),
  ]);

  return {
    products: products.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      brandName: item.brand.name,
    })),
    brands,
    categories,
    cars: cars.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: [item.manufacturer, item.model, item.generation].filter(Boolean).join(" "),
    })),
  };
}
