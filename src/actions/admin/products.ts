"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
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

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/cars");

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

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true };
}

export async function deleteProductFormAction(formData: FormData): Promise<ActionResult> {
  const productId = formData.get("productId");
  if (!productId || typeof productId !== "string") {
    return { success: false, message: "شناسه محصول نامعتبر است." };
  }
  return deleteProductAction(productId);
}
