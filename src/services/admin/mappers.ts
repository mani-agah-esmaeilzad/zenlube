import type { Prisma } from "@/generated/prisma";
import type {
  AdminBrand,
  AdminCar,
  AdminCategory,
  AdminMaintenanceTask,
  AdminProduct,
  AdminProductQuestion,
  AdminCarQuestion,
  AdminOrder,
  AdminOrderDetail,
  AdminUser,
  EngagementGroup,
} from "./types";
import { toNumber } from "./transformers";

export function mapCategory(category: Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>): AdminCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    productCount: category._count.products,
    createdAt: category.createdAt,
  };
}

export function mapBrand(brand: Prisma.BrandGetPayload<{
  include: { _count: { select: { products: true } } };
}>): AdminBrand {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    imageUrl: brand.imageUrl,
    website: brand.website,
    productCount: brand._count.products,
    createdAt: brand.createdAt,
  };
}

export function mapCar(car: Prisma.CarGetPayload<{
  include: { _count: { select: { productMappings: true } } };
}>): AdminCar {
  return {
    id: car.id,
    slug: car.slug,
    manufacturer: car.manufacturer,
    model: car.model,
    generation: car.generation,
    imageUrl: car.imageUrl,
    yearFrom: car.yearFrom,
    yearTo: car.yearTo,
    engineCode: car.engineCode,
    engineType: car.engineType,
    oilCapacityLit: car.oilCapacityLit ? toNumber(car.oilCapacityLit) : null,
    viscosity: car.viscosity,
    specification: car.specification,
    overviewDetails: car.overviewDetails,
    engineDetails: car.engineDetails,
    gearboxDetails: car.gearboxDetails,
    maintenanceInfo: car.maintenanceInfo,
    productMappingCount: car._count.productMappings,
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
  };
}

export function mapProduct(product: Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    carMappings: { include: { car: true } };
  };
}>): AdminProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: toNumber(product.price),
    stock: product.stock,
    viscosity: product.viscosity,
    oilType: product.oilType,
    imageUrl: product.imageUrl,
    isFeatured: product.isFeatured,
    brand: {
      id: product.brand.id,
      name: product.brand.name,
      slug: product.brand.slug,
    },
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    carMappings: product.carMappings.map((mapping) => ({
      car: {
        id: mapping.car.id,
        manufacturer: mapping.car.manufacturer,
        model: mapping.car.model,
        generation: mapping.car.generation,
        slug: mapping.car.slug,
      },
    })),
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function mapOrder(order: Prisma.OrderGetPayload<{
  include: { user: { select: { email: true } } };
}>): AdminOrder {
  return {
    id: order.id,
    fullName: order.fullName,
    email: order.user?.email ?? order.email,
    status: order.status,
    total: toNumber(order.total),
    createdAt: order.createdAt,
  };
}

export function mapOrderDetail(order: Prisma.OrderGetPayload<{
  include: {
    user: { select: { email: true } };
    items: { include: { product: { select: { name: true } } } };
  };
}>): AdminOrderDetail {
  return {
    id: order.id,
    fullName: order.fullName,
    email: order.user?.email ?? order.email,
    status: order.status,
    total: toNumber(order.total),
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod,
    paymentGateway: order.paymentGateway,
    paymentRefId: order.paymentRefId,
    shippingMethod: order.shippingMethod,
    shippingTrackingCode: order.shippingTrackingCode,
    phone: order.phone,
    city: order.city,
    province: order.province,
    address1: order.address1,
    address2: order.address2,
    postalCode: order.postalCode,
    notes: order.notes,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      quantity: item.quantity,
      price: toNumber(item.price),
    })),
  };
}

export function mapUser(user: Prisma.UserGetPayload<{
  include: { _count: { select: { orders: true } } };
}>): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as AdminUser["role"],
    ordersCount: user._count.orders,
    createdAt: user.createdAt,
  };
}

export function mapMaintenanceTask(task: Prisma.CarMaintenanceTaskGetPayload<{
  include: {
    car: {
      select: {
        id: true;
        manufacturer: true;
        model: true;
        generation: true;
        slug: true;
      };
    };
  };
}>): AdminMaintenanceTask {
  return {
    id: task.id,
    carId: task.carId,
    title: task.title,
    description: task.description,
    intervalKm: task.intervalKm,
    intervalMonths: task.intervalMonths,
    priority: task.priority,
    recommendedProductSlugs: task.recommendedProductSlugs ?? [],
    car: task.car
      ? {
          id: task.car.id,
          manufacturer: task.car.manufacturer,
          model: task.car.model,
          generation: task.car.generation,
          slug: task.car.slug,
        }
      : null,
    updatedAt: task.updatedAt,
  };
}

export function mapProductQuestion(question: Prisma.ProductQuestionGetPayload<{
  include: {
    product: {
      select: {
        id: true;
        name: true;
        slug: true;
        brand: { select: { name: true } };
      };
    };
  };
}>): AdminProductQuestion {
  return {
    id: question.id,
    question: question.question,
    answer: question.answer,
    status: question.status as AdminProductQuestion["status"],
    authorName: question.authorName,
    createdAt: question.createdAt,
    answeredAt: question.answeredAt,
    product: question.product
      ? {
          id: question.product.id,
          name: question.product.name,
          slug: question.product.slug,
          brandName: question.product.brand.name,
        }
      : null,
  };
}

export function mapCarQuestion(question: Prisma.CarQuestionGetPayload<{
  include: {
    car: {
      select: {
        id: true;
        manufacturer: true;
        model: true;
        slug: true;
      };
    };
  };
}>): AdminCarQuestion {
  return {
    id: question.id,
    question: question.question,
    answer: question.answer,
    status: question.status as AdminCarQuestion["status"],
    authorName: question.authorName,
    createdAt: question.createdAt,
    answeredAt: question.answeredAt,
    car: question.car
      ? {
          id: question.car.id,
          manufacturer: question.car.manufacturer,
          model: question.car.model,
          slug: question.car.slug,
        }
      : null,
  };
}

export function mapEngagementGroup(group: Prisma.EngagementEventGroupByOutputType): EngagementGroup {
  return {
    entityType: group.entityType,
    entityId: group.entityId,
    eventType: group.eventType,
    count: group._count?._all ?? 0,
  };
}
