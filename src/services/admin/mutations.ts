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
  const orderItemCount = await prisma.orderItem.count({ where: { productId } });

  if (orderItemCount > 0) {
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId } }),
      prisma.productCar.deleteMany({ where: { productId } }),
      prisma.product.updateMany({
        where: { id: productId },
        data: {
          slug: `deleted-${productId}`,
          sku: null,
          name: `حذف‌شده ${productId.slice(-6)}`,
          description: null,
          imageUrl: null,
          stock: 0,
          isFeatured: false,
          isBestseller: false,
        },
      }),
    ]);
    return { mode: "archived" as const };
  }

  await prisma.product.deleteMany({ where: { id: productId } });
  return { mode: "deleted" as const };
}

export async function countProductsByBrand(brandId: string) {
  return prisma.product.count({ where: { brandId } });
}

export async function deleteBrand(brandId: string) {
  await prisma.brand.deleteMany({ where: { id: brandId } });
}

export async function countProductsByCategory(categoryId: string) {
  return prisma.product.count({ where: { categoryId } });
}

export async function deleteCategory(categoryId: string) {
  await prisma.category.deleteMany({ where: { id: categoryId } });
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
  await prisma.carMaintenanceTask.deleteMany({ where: { id: taskId } });
}

export async function deleteCar(carId: string) {
  await prisma.car.deleteMany({ where: { id: carId } });
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

export async function deleteQuestion(questionId: string, type: "product" | "car") {
  if (type === "product") {
    const question = await prisma.productQuestion.findUnique({
      where: { id: questionId },
      include: { product: { select: { slug: true } } },
    });
    await prisma.productQuestion.deleteMany({ where: { id: questionId } });
    return { targetSlug: question?.product.slug };
  }

  const question = await prisma.carQuestion.findUnique({
    where: { id: questionId },
    include: { car: { select: { slug: true } } },
  });
  await prisma.carQuestion.deleteMany({ where: { id: questionId } });
  return { targetSlug: question?.car.slug };
}

export async function updateUserRole(userId: string, role: "ADMIN" | "CUSTOMER") {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export async function deleteOrderSafely(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      paymentEvents: { select: { id: true }, take: 1 },
    },
  });

  if (!order) {
    throw new Error("سفارش پیدا نشد.");
  }

  const hasPaymentHistory = Boolean(order.paidAt || order.paymentRefId || order.paymentEvents.length);
  if (hasPaymentHistory) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        notes: [order.notes, "بایگانی‌شده توسط مدیر"].filter(Boolean).join("\n"),
      },
    });
    return { mode: "archived" as const };
  }

  await prisma.order.deleteMany({ where: { id: orderId } });
  return { mode: "deleted" as const };
}

export async function deleteUserSafely(userId: string, sessionUserId?: string | null) {
  if (sessionUserId && sessionUserId === userId) {
    throw new Error("امکان حذف کاربر فعلی وجود ندارد.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { orders: true } } },
  });

  if (!user) {
    throw new Error("کاربر پیدا نشد.");
  }

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("امکان حذف آخرین مدیر وجود ندارد.");
    }
  }

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.cartItem.deleteMany({ where: { cart: { userId } } }),
    prisma.cart.deleteMany({ where: { userId } }),
    prisma.userAddress.deleteMany({ where: { userId } }),
  ]);

  if (user._count.orders > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: "کاربر حذف‌شده",
        email: `deleted-${userId}@oilbar.local`,
        phone: null,
        password: null,
        image: null,
        role: "CUSTOMER",
      },
    });
    return { mode: "archived" as const };
  }

  await prisma.user.deleteMany({ where: { id: userId } });
  return { mode: "deleted" as const };
}

async function deletePaymentTransactionsIfTableExists() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF to_regclass('public."PaymentTransaction"') IS NOT NULL THEN
        DELETE FROM "PaymentTransaction";
      END IF;
    END $$;
  `);
}

export async function resetDatabaseExceptAdmin(adminUserId: string) {
  const admin = await prisma.user.findUnique({
    where: { id: adminUserId },
    select: { id: true, role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("مدیر معتبر برای پاکسازی دیتابیس پیدا نشد.");
  }

  await deletePaymentTransactionsIfTableExists();

  await prisma.$transaction([
    prisma.paymentEvent.deleteMany(),
    prisma.smsLog.deleteMany(),
    prisma.rateLimitHit.deleteMany(),
    prisma.otpRequest.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.engagementEvent.deleteMany(),

    prisma.productQuestion.deleteMany(),
    prisma.carQuestion.deleteMany(),
    prisma.productReview.deleteMany(),
    prisma.productCar.deleteMany(),
    prisma.carMaintenanceTask.deleteMany(),

    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),

    prisma.galleryImage.deleteMany(),
    prisma.marketingBanner.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.product.deleteMany(),
    prisma.car.deleteMany(),
    prisma.category.deleteMany(),
    prisma.brand.deleteMany(),

    prisma.userAddress.deleteMany(),
    prisma.account.deleteMany({ where: { userId: { not: adminUserId } } }),
    prisma.session.deleteMany({ where: { userId: { not: adminUserId } } }),
    prisma.user.deleteMany({ where: { id: { not: adminUserId } } }),
  ]);

  await prisma.user.update({
    where: { id: adminUserId },
    data: { role: "ADMIN" },
  });
}
