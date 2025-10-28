import { Prisma } from "@/generated/prisma";
import prisma from "./prisma";

export async function getActiveBanners(position?: string) {
  return prisma.marketingBanner.findMany({
    where: {
      isActive: true,
      ...(position ? { position } : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

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
    },
  });
}

export async function getHighlightedCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getBrandsWithProductCount() {
  return prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPopularCars(limit = 6) {
  return prisma.car.findMany({
    include: {
      productMappings: {
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      },
    },
    orderBy: [
      { productMappings: { _count: "desc" } },
      { updatedAt: "desc" },
    ],
    take: limit,
  });
}

export type ProductSort =
  | "latest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "bestseller";

const sortConfig: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> =
  {
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

export async function getCarsWithProducts() {
  return prisma.car.findMany({
    include: {
      productMappings: {
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      },
      maintenanceTasks: {
        orderBy: [
          { priority: "asc" },
          { updatedAt: "desc" },
        ],
      },
    },
    orderBy: [
      { manufacturer: "asc" },
      { model: "asc" },
      { generation: "asc" },
    ],
  });
}

export async function getLatestBlogPosts(limit = 6) {
  return prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getAllProductsLite() {
  return prisma.product.findMany({
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

export async function getGalleryImages(limit = 6) {
  return prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
    take: limit,
  });
}

export async function getCarBySlug(slug: string) {
  return prisma.car.findUnique({
    where: { slug },
    include: {
      productMappings: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
              carMappings: {
                include: { car: true },
              },
            },
          },
        },
      },
      maintenanceTasks: {
        orderBy: [
          { priority: "asc" },
          { updatedAt: "desc" },
        ],
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

export async function getSiblingCars(manufacturer: string, currentSlug: string, limit = 4) {
  return prisma.car.findMany({
    where: {
      manufacturer,
      slug: { not: currentSlug },
    },
    orderBy: [{ model: "asc" }, { yearFrom: "desc" }],
    take: limit,
  });
}
