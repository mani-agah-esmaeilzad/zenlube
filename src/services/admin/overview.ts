import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { adminCatalogProductWhere } from "@/lib/storefront-visibility";
import {
  mapBrand,
  mapCar,
  mapCategory,
  mapCarQuestion,
  mapEngagementGroup,
  mapMaintenanceTask,
  mapOrder,
  mapProduct,
  mapProductQuestion,
  mapUser,
} from "./mappers";
import type {
  OverviewTabData,
  ProductsTabData,
  CarsTabData,
  MaintenanceTabData,
  QuestionsTabData,
  BrandsTabData,
  CategoriesTabData,
  UsersTabData,
  ReportsTabData,
  ContentTabData,
  SpecialOffersTabData,
} from "./types";

const LOW_STOCK_THRESHOLD = 10;

const overviewSelect = {
  categories: prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { products: true } },
    },
  }),
  brands: prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  }),
  cars: prisma.car.findMany({
    orderBy: [
      { manufacturer: "asc" },
      { model: "asc" },
    ],
    include: {
      _count: { select: { productMappings: true } },
    },
  }),
  products: prisma.product.findMany({
    where: adminCatalogProductWhere(),
    orderBy: { updatedAt: "desc" },
    include: {
      brand: true,
      category: true,
      carMappings: {
        include: { car: true },
      },
    },
  }),
  users: prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  }),
  recentOrders: prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      user: { select: { email: true } },
    },
  }),
  revenueAggregate: prisma.order.aggregate({
    _sum: { total: true },
  }),
  ordersByStatus: prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  }),
  totalReviews: prisma.productReview.count(),
  maintenanceTasks: prisma.carMaintenanceTask.findMany({
    include: {
      car: {
        select: {
          id: true,
          manufacturer: true,
          model: true,
          generation: true,
          slug: true,
        },
      },
    },
    orderBy: [
      { priority: "asc" },
      { updatedAt: "desc" },
    ],
  }),
  productQuestions: prisma.productQuestion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: { select: { name: true } },
        },
      },
    },
  }),
  carQuestions: prisma.carQuestion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      car: {
        select: {
          id: true,
          manufacturer: true,
          model: true,
          slug: true,
        },
      },
    },
  }),
  engagementGroups: prisma.engagementEvent.groupBy({
    by: ["entityType", "entityId", "eventType"],
    _count: { _all: true },
    orderBy: { _count: { entityId: "desc" } },
    take: 30,
  }),
} as const;

export async function getOverviewTabData(): Promise<OverviewTabData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    categories,
    brands,
    cars,
    products,
    users,
    recentOrders,
    revenueAggregate,
    ordersByStatus,
    totalReviews,
    ordersLast30,
    revenueLast30Aggregate,
    maintenanceTasks,
    productQuestions,
    carQuestions,
    engagementGroups,
  ] = await Promise.all([
    overviewSelect.categories,
    overviewSelect.brands,
    overviewSelect.cars,
    overviewSelect.products,
    overviewSelect.users,
    overviewSelect.recentOrders,
    overviewSelect.revenueAggregate,
    overviewSelect.ordersByStatus,
    overviewSelect.totalReviews,
    prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    overviewSelect.maintenanceTasks,
    overviewSelect.productQuestions,
    overviewSelect.carQuestions,
    overviewSelect.engagementGroups,
  ]);

  const totalRevenue = (revenueAggregate._sum.total ?? new Prisma.Decimal(0)).toNumber();
  const revenueLast30 = (revenueLast30Aggregate._sum.total ?? new Prisma.Decimal(0)).toNumber();
  const statusCounts = ordersByStatus.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  return {
    categories: categories.map(mapCategory),
    brands: brands.map(mapBrand),
    cars: cars.map(mapCar),
    products: products.map(mapProduct),
    users: users.map(mapUser),
    recentOrders: recentOrders.map(mapOrder),
    totalRevenue,
    revenueLast30,
    ordersByStatus: statusCounts,
    ordersLast30,
    totalReviews,
    maintenanceTasks: maintenanceTasks.map(mapMaintenanceTask),
    productQuestions: productQuestions.map(mapProductQuestion),
    carQuestions: carQuestions.map(mapCarQuestion),
    engagementGroups: engagementGroups.map(mapEngagementGroup),
  };
}

type ProductTabOptions = {
  page?: number;
  perPage?: number;
  search?: string | null;
  brandId?: string | null;
  categoryId?: string | null;
  stockStatus?: string | null;
};

export async function getProductsTabData(options: ProductTabOptions = {}): Promise<ProductsTabData> {
  const requestedPage = Math.max(1, options.page ? Number(options.page) : 1);
  const perPage = Math.min(Math.max(10, Number(options.perPage) || 20), 50);
  const search = options.search?.trim() || undefined;
  const brandId = options.brandId?.trim() || undefined;
  const categoryId = options.categoryId?.trim() || undefined;

  const stockStatus = options.stockStatus === "low" || options.stockStatus === "out" || options.stockStatus === "in"
    ? options.stockStatus
    : "all";

  const where: Prisma.ProductWhereInput = adminCatalogProductWhere();

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (brandId) {
    where.brandId = brandId;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (stockStatus === "low") {
    where.stock = { gt: 0, lt: LOW_STOCK_THRESHOLD };
  } else if (stockStatus === "out") {
    where.stock = { lte: 0 };
  } else if (stockStatus === "in") {
    where.stock = { gte: LOW_STOCK_THRESHOLD };
  }

  const [categories, brands, cars, total, lowStockCount, lowStockPreview] = await Promise.all([
    overviewSelect.categories,
    overviewSelect.brands,
    overviewSelect.cars,
    prisma.product.count({ where }),
    prisma.product.count({ where: adminCatalogProductWhere({ stock: { lt: LOW_STOCK_THRESHOLD } }) }),
    prisma.product.findMany({
      where: adminCatalogProductWhere({ stock: { lt: LOW_STOCK_THRESHOLD } }),
      orderBy: { stock: "asc" },
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(requestedPage, totalPages);

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (currentPage - 1) * perPage,
    take: perPage,
    include: {
      brand: true,
      category: true,
      carMappings: {
        include: { car: true },
      },
    },
  });

  return {
    categories: categories.map(mapCategory),
    brands: brands.map(mapBrand),
    cars: cars.map(mapCar),
    products: products.map(mapProduct),
    filters: {
      search,
      brandId,
      categoryId,
      stockStatus,
    },
    pagination: {
      page: currentPage,
      perPage,
      total,
      totalPages,
    },
    lowStock: {
      count: lowStockCount,
      threshold: LOW_STOCK_THRESHOLD,
      preview: lowStockPreview,
    },
  };
}

export async function getCarsTabData(): Promise<CarsTabData> {
  const [cars, maintenanceTasks, products] = await Promise.all([
    overviewSelect.cars,
    overviewSelect.maintenanceTasks,
    overviewSelect.products,
  ]);

  return {
    cars: cars.map(mapCar),
    maintenanceTasks: maintenanceTasks.map(mapMaintenanceTask),
    products: products.map(mapProduct),
  };
}

export async function getMaintenanceTabData(): Promise<MaintenanceTabData> {
  return getCarsTabData();
}

export async function getQuestionsTabData(): Promise<QuestionsTabData> {
  const [productQuestions, carQuestions] = await Promise.all([
    overviewSelect.productQuestions,
    overviewSelect.carQuestions,
  ]);

  return {
    productQuestions: productQuestions.map(mapProductQuestion),
    carQuestions: carQuestions.map(mapCarQuestion),
  };
}

export async function getBrandsTabData(): Promise<BrandsTabData> {
  const [brands, totalReviews] = await Promise.all([
    overviewSelect.brands,
    overviewSelect.totalReviews,
  ]);

  return {
    brands: brands.map(mapBrand),
    totalReviews,
  };
}

export async function getCategoriesTabData(): Promise<CategoriesTabData> {
  const categories = await overviewSelect.categories;
  return { categories: categories.map(mapCategory) };
}

export async function getUsersTabData(): Promise<UsersTabData> {
  const users = await overviewSelect.users;
  return { users: users.map(mapUser) };
}

export async function getReportsTabData(): Promise<ReportsTabData> {
  const [
    engagementGroups,
    maintenanceTasks,
    productQuestions,
    carQuestions,
    products,
    cars,
    paidOrdersAggregate,
    wishlistItemsCount,
    recentViewsCount,
    couponAggregate,
    auditLogs,
    returnRequests,
  ] = await Promise.all([
    overviewSelect.engagementGroups,
    overviewSelect.maintenanceTasks,
    overviewSelect.productQuestions,
    overviewSelect.carQuestions,
    overviewSelect.products,
    overviewSelect.cars,
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.wishlistItem.count(),
    prisma.recentlyViewedProduct.count(),
    prisma.coupon.aggregate({
      _count: { _all: true },
      _sum: { usedCount: true },
    }),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        actorUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.returnRequest.findMany({
      orderBy: { requestedAt: "desc" },
      take: 12,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const paidOrdersCount = paidOrdersAggregate._count._all;
  const averageOrderValue = paidOrdersCount
    ? Number((paidOrdersAggregate._sum.total ?? new Prisma.Decimal(0)).toNumber()) / paidOrdersCount
    : 0;

  return {
    engagementGroups: engagementGroups.map(mapEngagementGroup),
    maintenanceTasks: maintenanceTasks.map(mapMaintenanceTask),
    productQuestions: productQuestions.map(mapProductQuestion),
    carQuestions: carQuestions.map(mapCarQuestion),
    products: products.map(mapProduct),
    cars: cars.map(mapCar),
    averageOrderValue,
    paidOrdersCount,
    wishlistItemsCount,
    recentViewsCount,
    couponCount: couponAggregate._count._all,
    couponRedemptions: couponAggregate._sum.usedCount ?? 0,
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      actorName: log.actorUser?.name ?? "سیستم",
      actorEmail: log.actorUser?.email,
      targetType: log.targetType,
      targetId: log.targetId,
      action: log.action,
      summary: log.summary,
      createdAt: log.createdAt,
    })),
    returnRequests: returnRequests.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      userName: item.user.name ?? item.user.email ?? "کاربر",
      reason: item.reason,
      status: item.status,
      requestedAt: item.requestedAt,
      refundAmount: item.refundAmount ? item.refundAmount.toNumber() : null,
    })),
  };
}

export async function getContentTabData(): Promise<ContentTabData> {
  const [banners, posts, galleryImages, coupons, smsLogs] = await Promise.all([
    prisma.marketingBanner.findMany({ orderBy: [{ position: "asc" }, { updatedAt: "desc" }] }),
    prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } }),
    prisma.galleryImage.findMany({ orderBy: [{ orderIndex: "asc" }, { updatedAt: "desc" }] }),
    prisma.coupon.findMany({ orderBy: [{ isActive: "desc" }, { createdAt: "desc" }] }),
    prisma.smsLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);

  return {
    banners: banners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      ctaLabel: banner.ctaLabel,
      ctaLink: banner.ctaLink,
      imageUrl: banner.imageUrl,
      position: banner.position,
      isActive: banner.isActive,
      updatedAt: banner.updatedAt,
    })),
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      tags: post.tags,
      authorName: post.authorName,
      readMinutes: post.readMinutes,
      publishedAt: post.publishedAt,
    })),
    galleryImages: galleryImages.map((image) => ({
      id: image.id,
      title: image.title,
      description: image.description,
      imageUrl: image.imageUrl,
      link: image.link,
      orderIndex: image.orderIndex,
      isActive: image.isActive,
      updatedAt: image.updatedAt,
    })),
    coupons: coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discountType,
      amount: coupon.amount.toNumber(),
      minOrderAmount: coupon.minOrderAmount?.toNumber() ?? null,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
      endsAt: coupon.endsAt,
    })),
    smsLogs: smsLogs.map((log) => ({
      id: log.id,
      phone: log.phone,
      eventType: log.eventType,
      templateName: log.templateName,
      status: log.status,
      provider: log.provider,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
    })),
  };
}

export async function getSpecialOffersTabData(): Promise<SpecialOffersTabData> {
  const [products, offers] = await Promise.all([
    prisma.product.findMany({
      where: adminCatalogProductWhere(),
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        imageUrl: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
        promotion: { select: { id: true } },
      },
      orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.productPromotion.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            stock: true,
            imageUrl: true,
            brand: { select: { name: true } },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
  ]);

  const productRows = products.map((product) => {
    const price = Number(product.price);
    const torobReady = price > 0 && product.stock > 0 && Boolean(product.imageUrl);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      brandName: product.brand.name,
      categoryName: product.category.name,
      hasPromotion: Boolean(product.promotion),
      torobReady,
    };
  });

  return {
    products: productRows,
    offers: offers.map((offer) => ({
      id: offer.id,
      productId: offer.productId,
      kind: offer.kind,
      label: offer.label,
      specialPrice: offer.specialPrice != null ? Number(offer.specialPrice) : null,
      startsAt: offer.startsAt,
      endsAt: offer.endsAt,
      sortOrder: offer.sortOrder,
      isActive: offer.isActive,
      updatedAt: offer.updatedAt,
      product: {
        id: offer.product.id,
        name: offer.product.name,
        slug: offer.product.slug,
        price: Number(offer.product.price),
        stock: offer.product.stock,
        imageUrl: offer.product.imageUrl,
        brandName: offer.product.brand.name,
      },
    })),
    readiness: {
      total: productRows.length,
      priced: productRows.filter((product) => product.price > 0).length,
      inStock: productRows.filter((product) => product.stock > 0).length,
      withImage: productRows.filter((product) => Boolean(product.imageUrl)).length,
      torobReady: productRows.filter((product) => product.torobReady).length,
      missingPrice: productRows.filter((product) => product.price <= 0).length,
      outOfStock: productRows.filter((product) => product.stock <= 0).length,
      missingImage: productRows.filter((product) => !product.imageUrl).length,
    },
  };
}
