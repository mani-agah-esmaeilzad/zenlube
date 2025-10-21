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

function ensureAdmin(session: unknown) {
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role;
  if (role !== "ADMIN") {
    throw new Error("دسترسی شما مجاز نیست.");
  }
}

export async function createCategoryAction(formData: FormData) {
  const session = await getAppSession();
  ensureAdmin(session);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
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

export async function createBrandAction(formData: FormData) {
  const session = await getAppSession();
  ensureAdmin(session);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = brandSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
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

export async function createCarAction(formData: FormData) {
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

export async function createProductAction(formData: FormData) {
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

export async function deleteProductAction(productId: string) {
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
