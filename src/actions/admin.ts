"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import {
  brandSchema,
  carSchema,
  categorySchema,
  productUpsertSchema,
} from "@/lib/validators";
import { getAppSession } from "@/lib/session";

type ActionResult =
  | { success: true }
  | { success: false; message?: string; errors?: Record<string, string[]> };

function ensureAdmin(session: unknown) {
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role;
  if (role !== "ADMIN") {
    throw new Error("دسترسی شما مجاز نیست.");
  }
}

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  const session = await getAppSession();
  ensureAdmin(session);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.category.upsert({
    where: { slug: parsed.data.slug },
    update: parsed.data,
    create: parsed.data,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");

  return { success: true };
}

export async function createBrandAction(formData: FormData): Promise<ActionResult> {
  const session = await getAppSession();
  ensureAdmin(session);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = brandSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.brand.upsert({
    where: { slug: parsed.data.slug },
    update: parsed.data,
    create: parsed.data,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/products");

  return { success: true };
}

export async function createCarAction(formData: FormData): Promise<ActionResult> {
  const session = await getAppSession();
  ensureAdmin(session);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = carSchema.safeParse({
    ...raw,
    yearFrom: raw.yearFrom ? Number(raw.yearFrom) : undefined,
    yearTo: raw.yearTo ? Number(raw.yearTo) : undefined,
    oilCapacityLit: raw.oilCapacityLit ? Number(raw.oilCapacityLit) : undefined,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.car.upsert({
    where: { slug: parsed.data.slug },
    update: {
      ...parsed.data,
      oilCapacityLit: parsed.data.oilCapacityLit
        ? new Prisma.Decimal(parsed.data.oilCapacityLit)
        : undefined,
    },
    create: {
      ...parsed.data,
      oilCapacityLit: parsed.data.oilCapacityLit
        ? new Prisma.Decimal(parsed.data.oilCapacityLit)
        : undefined,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/cars");

  return { success: true };
}

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  const session = await getAppSession();
  ensureAdmin(session);

  const rawEntries = Object.fromEntries(formData);
  const carIds = formData.getAll("carIds").map(String);

  const parsed = productUpsertSchema.safeParse({
    ...rawEntries,
    price: rawEntries.price ? Number(rawEntries.price) : undefined,
    stock: rawEntries.stock ? Number(rawEntries.stock) : undefined,
    isFeatured: rawEntries.isFeatured === "on",
    carIds,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { carIds: productCarIds = [], ...data } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        price: new Prisma.Decimal(data.price),
        carMappings: {
          deleteMany: {},
        },
      },
      create: {
        ...data,
        price: new Prisma.Decimal(data.price),
      },
      include: { carMappings: true },
    });

    if (productCarIds.length > 0) {
      await tx.productCar.createMany({
        data: productCarIds.map((carId) => ({
          productId: product.id,
          carId,
        })),
        skipDuplicates: true,
      });
    }
  });

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/cars");

  return { success: true };
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const session = await getAppSession();
  ensureAdmin(session);

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true };
}

export async function deleteProductFormAction(formData: FormData) {
  const productId = formData.get("productId");
  if (!productId || typeof productId !== "string") {
    return { success: false, message: "شناسه محصول نامعتبر است." };
  }
  return deleteProductAction(productId);
}

export async function deleteBrandAction(brandId: string): Promise<ActionResult> {
  const session = await getAppSession();
  ensureAdmin(session);

  const linkedProducts = await prisma.product.count({
    where: { brandId },
  });

  if (linkedProducts > 0) {
    return {
      success: false,
      message: "ابتدا محصولات مرتبط با این برند را ویرایش یا حذف کنید.",
    };
  }

  await prisma.brand.delete({
    where: { id: brandId },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/products");

  return { success: true };
}

export async function deleteBrandFormAction(formData: FormData) {
  const brandId = formData.get("brandId");
  if (!brandId || typeof brandId !== "string") {
    return { success: false, message: "شناسه برند نامعتبر است." };
  }
  return deleteBrandAction(brandId);
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  const session = await getAppSession();
  ensureAdmin(session);

  const linkedProducts = await prisma.product.count({
    where: { categoryId },
  });

  if (linkedProducts > 0) {
    return {
      success: false,
      message: "ابتدا محصولات مرتبط با این دسته‌بندی را ویرایش یا حذف کنید.",
    };
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");

  return { success: true };
}

export async function deleteCategoryFormAction(formData: FormData) {
  const categoryId = formData.get("categoryId");
  if (!categoryId || typeof categoryId !== "string") {
    return { success: false, message: "شناسه دسته‌بندی نامعتبر است." };
  }
  return deleteCategoryAction(categoryId);
}

export async function updateUserRoleAction(formData: FormData): Promise<ActionResult> {
  const session = await getAppSession();
  ensureAdmin(session);

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (!userId || typeof userId !== "string") {
    return { success: false, message: "شناسه کاربر نامعتبر است." };
  }

  if (role !== "ADMIN" && role !== "CUSTOMER") {
    return { success: false, message: "نقش انتخاب‌شده معتبر نیست." };
  }

  const sessionUserId = (session as { user?: { id?: string | null } } | null)?.user?.id ?? null;

  if (sessionUserId && sessionUserId === userId) {
    return { success: false, message: "نمی‌توانید نقش خود را تغییر دهید." };
  }

  const nextRole = role === "ADMIN" ? "ADMIN" : "CUSTOMER";

  await prisma.user.update({
    where: { id: userId },
    data: { role: nextRole },
  });

  revalidatePath("/admin");

  return { success: true };
}
