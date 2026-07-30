"use server";

import { ensureAdminAction } from "@/lib/auth";
import { revalidateAdminSurface, revalidateStorefrontProduct } from "@/lib/storefront-revalidate";
import { productCreateSchema, productUpdateSchema } from "@/lib/validators";
import { deleteProduct, saveProduct } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

function parseProductForm(formData: FormData) {
  const rawEntries = Object.fromEntries(formData);
  const carIds = formData.getAll("carIds").map(String);
  return {
    ...rawEntries,
    price: rawEntries.price ? Number(rawEntries.price) : undefined,
    stock: rawEntries.stock ? Number(rawEntries.stock) : undefined,
    isFeatured: rawEntries.isFeatured === "on",
    carIds,
  };
}

async function persistProduct<T extends typeof productCreateSchema | typeof productUpdateSchema>(
  schema: T,
  formData: FormData,
): Promise<ActionResult> {
  await ensureAdminAction();

  const parsed = schema.safeParse(parseProductForm(formData));

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await saveProduct(parsed.data);

  revalidateAdminSurface();
  revalidateStorefrontProduct({});

  return { success: true };
}

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  return persistProduct(productCreateSchema, formData);
}

export async function updateProductAction(formData: FormData): Promise<ActionResult> {
  return persistProduct(productUpdateSchema, formData);
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  await ensureAdminAction();

  await deleteProduct(productId);

  revalidateAdminSurface();
  revalidateStorefrontProduct({});

  return { success: true };
}

export async function deleteProductFormAction(formData: FormData): Promise<void> {
  const productId = formData.get("productId");
  if (!productId || typeof productId !== "string") {
    throw new Error("شناسه محصول نامعتبر است.");
  }
  const result = await deleteProductAction(productId);
  if (!result.success) {
    throw new Error("حذف محصول با خطا مواجه شد.");
  }
}
