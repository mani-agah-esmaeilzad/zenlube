import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
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

  const where: Prisma.ProductWhereInput = {};

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
    prisma.product.count({ where: { stock: { lt: LOW_STOCK_THRESHOLD } } }),
    prisma.product.findMany({
      where: { stock: { lt: LOW_STOCK_THRESHOLD } },
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
  ] = await Promise.all([
    overviewSelect.engagementGroups,
    overviewSelect.maintenanceTasks,
    overviewSelect.productQuestions,
    overviewSelect.carQuestions,
    overviewSelect.products,
    overviewSelect.cars,
  ]);

  return {
    engagementGroups: engagementGroups.map(mapEngagementGroup),
    maintenanceTasks: maintenanceTasks.map(mapMaintenanceTask),
    productQuestions: productQuestions.map(mapProductQuestion),
    carQuestions: carQuestions.map(mapCarQuestion),
    products: products.map(mapProduct),
    cars: cars.map(mapCar),
  };
}
