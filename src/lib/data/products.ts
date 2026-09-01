import { Prisma } from "@/generated/prisma";
import prisma from "../prisma";
import { isPromotionActive, resolveProductPricing } from "../pricing";
import { storefrontVisibleCarWhere, storefrontVisibleProductWhere } from "../storefront-visibility";
import { createEmptyPageResult, withStorefrontDataFallback } from "./storefront-fallback";

type ProductListItem = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    promotion: true;
    carMappings: {
      include: {
        car: true;
      };
    };
  };
}>;

export async function getFeaturedProducts(limit = 6) {
  return withStorefrontDataFallback("getFeaturedProducts", [], () =>
    prisma.product.findMany({
      where: storefrontVisibleProductWhere({ isFeatured: true }),
      orderBy: [{ isBestseller: "desc" }, { updatedAt: "desc" }],
      include: {
        brand: true,
        category: true,
        promotion: true,
        carMappings: {
          where: {
            car: storefrontVisibleCarWhere(),
          },
          include: { car: true },
        },
        reviews: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
      take: limit,
    }),
  );
}

export async function getBestsellerProducts(limit = 8) {
  return withStorefrontDataFallback("getBestsellerProducts", [], () =>
    prisma.product.findMany({
      where: storefrontVisibleProductWhere({
        OR: [
          { isBestseller: true },
          { reviewCount: { gt: 60 } },
        ],
      }),
      orderBy: [
        { isBestseller: "desc" },
        { reviewCount: "desc" },
        { averageRating: "desc" },
      ],
      take: limit,
      include: {
        brand: true,
        category: true,
        promotion: true,
        carMappings: {
          where: {
            car: storefrontVisibleCarWhere(),
          },
          include: { car: true },
        },
        reviews: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  );
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
  viscosity?: string;
  oilType?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  page?: number;
  pageSize?: number;
  sort?: ProductSort;
};

export async function getProductFilterFacets() {
  return withStorefrontDataFallback(
    "getProductFilterFacets",
    { viscosities: [] as string[], oilTypes: [] as string[] },
    async () => {
      const [viscosityRows, oilTypeRows] = await Promise.all([
        prisma.product.findMany({
          where: storefrontVisibleProductWhere({ viscosity: { not: null } }),
          distinct: ["viscosity"],
          select: { viscosity: true },
          orderBy: { viscosity: "asc" },
        }),
        prisma.product.findMany({
          where: storefrontVisibleProductWhere({ oilType: { not: null } }),
          distinct: ["oilType"],
          select: { oilType: true },
          orderBy: { oilType: "asc" },
        }),
      ]);

      return {
        viscosities: viscosityRows.map((item) => item.viscosity).filter((value): value is string => Boolean(value)),
        oilTypes: oilTypeRows.map((item) => item.oilType).filter((value): value is string => Boolean(value)),
      };
    },
  );
}

export async function getAllProductsWithFilters({
  search,
  category,
  brand,
  car,
  viscosity,
  oilType,
  tags,
  minPrice,
  maxPrice,
  inStock,
  minRating,
  page = 1,
  pageSize = 12,
  sort = "latest",
}: ProductFilters) {
  return withStorefrontDataFallback(
    "getAllProductsWithFilters",
    createEmptyPageResult<ProductListItem>(page, pageSize),
    async () => {
    const where: Prisma.ProductWhereInput = storefrontVisibleProductWhere({
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { approvals: { contains: search, mode: "insensitive" } },
              { viscosity: { contains: search, mode: "insensitive" } },
              { oilType: { contains: search, mode: "insensitive" } },
              { brand: { name: { contains: search, mode: "insensitive" } } },
              {
                carMappings: {
                  some: {
                    car: storefrontVisibleCarWhere({
                      OR: [
                        { manufacturer: { contains: search, mode: "insensitive" } },
                        { model: { contains: search, mode: "insensitive" } },
                      ],
                    }),
                  },
                },
              },
            ],
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(brand ? { brand: { slug: brand } } : {}),
      ...(viscosity ? { viscosity } : {}),
      ...(oilType ? { oilType } : {}),
      ...(car
        ? {
            carMappings: {
              some: {
                car: storefrontVisibleCarWhere({ slug: car }),
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
    });

    const skip = (page - 1) * pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          promotion: true,
          carMappings: {
            where: {
              car: storefrontVisibleCarWhere(),
            },
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
    },
  );
}

export async function getProductBySlug(slug: string) {
  return withStorefrontDataFallback("getProductBySlug", null, () =>
    prisma.product.findFirst({
      where: storefrontVisibleProductWhere({ slug }),
      include: {
        brand: true,
        category: true,
        promotion: true,
        carMappings: {
          where: {
            car: storefrontVisibleCarWhere(),
          },
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
    }),
  );
}

export async function getSpecialOfferProducts(limit = 8) {
  return withStorefrontDataFallback("getSpecialOfferProducts", [], async () => {
    const products = await prisma.product.findMany({
      where: storefrontVisibleProductWhere({
        stock: { gt: 0 },
        imageUrl: { not: null },
        promotion: { is: { isActive: true } },
      }),
      include: {
        brand: true,
        category: true,
        promotion: true,
        carMappings: {
          where: { car: storefrontVisibleCarWhere() },
          include: { car: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: Math.max(limit * 3, limit),
    });

    return products
      .filter((product) => isPromotionActive(product.promotion))
      .sort((left, right) => (left.promotion?.sortOrder ?? 0) - (right.promotion?.sortOrder ?? 0))
      .slice(0, limit);
  });
}

export async function getProductReviews(productId: string, limit = 8) {
  return withStorefrontDataFallback("getProductReviews", [], () =>
    prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  );
}

export async function getLatestReviews(limit = 6) {
  return withStorefrontDataFallback("getLatestReviews", [], () =>
    prisma.productReview.findMany({
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
    }),
  );
}

export async function getAllProductsLite() {
  return withStorefrontDataFallback("getAllProductsLite", [], async () => {
    const products = await prisma.product.findMany({
      where: storefrontVisibleProductWhere(),
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
        promotion: true,
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

    return products.map((product) => {
      const pricing = resolveProductPricing(product);
      return {
        ...product,
        averageRating: product.averageRating != null ? Number(product.averageRating) : null,
        price: pricing.effectivePrice,
      };
    });
  });
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

  return withStorefrontDataFallback(
    "getSearchSuggestions",
    {
      products: [],
      brands: [],
      categories: [],
      cars: [],
    },
    async () => {
      const [products, brands, categories, cars] = await Promise.all([
        prisma.product.findMany({
          where: storefrontVisibleProductWhere({
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { sku: { contains: term, mode: "insensitive" } },
              { viscosity: { contains: term, mode: "insensitive" } },
              { oilType: { contains: term, mode: "insensitive" } },
              { brand: { name: { contains: term, mode: "insensitive" } } },
            ],
          }),
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            price: true,
            promotion: true,
            stock: true,
            viscosity: true,
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
          where: storefrontVisibleCarWhere({
            OR: [
              { manufacturer: { contains: term, mode: "insensitive" } },
              { model: { contains: term, mode: "insensitive" } },
              { generation: { contains: term, mode: "insensitive" } },
            ],
          }),
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
        products: products.map((item) => {
          const pricing = resolveProductPricing(item);
          return {
            id: item.id,
            name: item.name,
            slug: item.slug,
            brandName: item.brand.name,
            imageUrl: item.imageUrl,
            price: pricing.effectivePrice,
            stock: item.stock,
            viscosity: item.viscosity,
          };
        }),
        brands,
        categories,
        cars: cars.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: [item.manufacturer, item.model, item.generation].filter(Boolean).join(" "),
        })),
      };
    },
  );
}
