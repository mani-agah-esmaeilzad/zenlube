import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import type { AdminCarQuestion, AdminProductQuestion } from "./types";

export type AnswerQuestionPayload = {
  questionId: string;
  answer: string;
  markAnswered: boolean;
};

export async function saveCategory(data: {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}) {
  const { id, ...payload } = data;
  if (id) {
    await prisma.category.update({
      where: { id },
      data: payload,
    });
    return;
  }

  await prisma.category.create({ data: payload });
}

export async function saveBrand(data: {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  website?: string | null;
}) {
  const { id, ...payload } = data;
  if (id) {
    await prisma.brand.update({
      where: { id },
      data: payload,
    });
    return;
  }

  await prisma.brand.create({ data: payload });
}

export async function upsertCar(data: {
  slug: string;
  manufacturer: string;
  model: string;
  generation?: string | null;
  engineCode?: string | null;
  engineType?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  oilCapacityLit?: number | null;
  viscosity?: string | null;
  specification?: string | null;
  imageUrl?: string | null;
  overviewDetails?: string | null;
  engineDetails?: string | null;
  gearboxDetails?: string | null;
  maintenanceInfo?: string | null;
}) {
  await prisma.car.upsert({
    where: { slug: data.slug },
    update: {
      ...data,
      oilCapacityLit: data.oilCapacityLit != null ? new Prisma.Decimal(data.oilCapacityLit) : undefined,
    },
    create: {
      ...data,
      oilCapacityLit: data.oilCapacityLit != null ? new Prisma.Decimal(data.oilCapacityLit) : undefined,
    },
  });
}

export async function saveProduct(data: {
  id?: string;
  slug: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  stock: number;
  viscosity?: string | null;
  oilType?: string | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  categoryId: string;
  brandId: string;
  carIds?: string[];
}) {
  const { id, carIds = [], ...payload } = data;
  await prisma.$transaction(async (tx) => {
    const sharedData = {
      ...payload,
      price: new Prisma.Decimal(payload.price),
    } satisfies Prisma.ProductUncheckedCreateInput;

    const product = id
      ? await tx.product.update({
          where: { id },
          data: {
            ...sharedData,
            carMappings: { deleteMany: {} },
          },
        })
      : await tx.product.create({ data: sharedData });

    if (carIds.length > 0) {
      await tx.productCar.createMany({
        data: carIds.map((carId) => ({ productId: product.id, carId })),
        skipDuplicates: true,
      });
    }
  });
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({ where: { id: productId } });
}

export async function countProductsByBrand(brandId: string) {
  return prisma.product.count({ where: { brandId } });
}

export async function deleteBrand(brandId: string) {
  await prisma.brand.delete({ where: { id: brandId } });
}

export async function countProductsByCategory(categoryId: string) {
  return prisma.product.count({ where: { categoryId } });
}

export async function deleteCategory(categoryId: string) {
  await prisma.category.delete({ where: { id: categoryId } });
}

export async function upsertMaintenanceTask(data: {
  carId: string;
  title: string;
  description?: string | null;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  priority: number;
  recommendedProductSlugs: string[];
}) {
  await prisma.carMaintenanceTask.upsert({
    where: {
      carId_title: {
        carId: data.carId,
        title: data.title,
      },
    },
    update: {
      description: data.description,
      intervalKm: data.intervalKm ?? null,
      intervalMonths: data.intervalMonths ?? null,
      priority: data.priority,
      recommendedProductSlugs: data.recommendedProductSlugs,
    },
    create: {
      carId: data.carId,
      title: data.title,
      description: data.description,
      intervalKm: data.intervalKm ?? null,
      intervalMonths: data.intervalMonths ?? null,
      priority: data.priority,
      recommendedProductSlugs: data.recommendedProductSlugs,
    },
  });
}

export async function deleteMaintenanceTask(taskId: string) {
  await prisma.carMaintenanceTask.delete({ where: { id: taskId } });
}

export async function answerQuestion(
  data: AnswerQuestionPayload,
  type: "product" | "car",
): Promise<{ question: AdminProductQuestion | AdminCarQuestion; targetSlug?: string | null }> {
  const status = data.markAnswered ? "ANSWERED" : "PENDING";
  const answeredAt = data.markAnswered ? new Date() : null;

  if (type === "product") {
    const question = await prisma.productQuestion.update({
      where: { id: data.questionId },
      data: { answer: data.answer, status, answeredAt },
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
    });

    return {
      question: {
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
      },
      targetSlug: question.product?.slug,
    };
  }

  const question = await prisma.carQuestion.update({
    where: { id: data.questionId },
    data: { answer: data.answer, status, answeredAt },
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
  });

  return {
    question: {
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
    },
    targetSlug: question.car?.slug,
  };
}

export async function archiveQuestion(questionId: string, type: "product" | "car") {
  if (type === "product") {
    const question = await prisma.productQuestion.update({
      where: { id: questionId },
      data: { status: "ARCHIVED" },
      include: { product: { select: { slug: true } } },
    });

    return { targetSlug: question.product?.slug };
  }

  const question = await prisma.carQuestion.update({
    where: { id: questionId },
    data: { status: "ARCHIVED" },
    include: { car: { select: { slug: true } } },
  });

  return { targetSlug: question.car?.slug };
}

export async function updateUserRole(userId: string, role: "ADMIN" | "CUSTOMER") {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}
