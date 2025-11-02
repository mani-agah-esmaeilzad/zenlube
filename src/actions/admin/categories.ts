"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { categorySchema, categoryUpdateSchema } from "@/lib/validators";
import {
  countProductsByCategory,
  deleteCategory,
  saveCategory,
} from "@/services/admin/mutations";

import type { ActionResult } from "./types";

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await saveCategory(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");

  return { success: true };
}

export async function updateCategoryAction(formData: FormData): Promise<ActionResult> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = categoryUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await saveCategory(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");

  return { success: true };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  await ensureAdminAction();

  const linkedProducts = await countProductsByCategory(categoryId);
  if (linkedProducts > 0) {
    return {
      success: false,
      message: "ابتدا محصولات مرتبط با این دسته‌بندی را ویرایش یا حذف کنید.",
    };
  }

  await deleteCategory(categoryId);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");

  return { success: true };
}

export async function deleteCategoryFormAction(formData: FormData): Promise<void> {
  const categoryId = formData.get("categoryId");
  if (!categoryId || typeof categoryId !== "string") {
    throw new Error("شناسه دسته‌بندی نامعتبر است.");
  }
  const result = await deleteCategoryAction(categoryId);
  if (!result.success) {
    throw new Error(result.message ?? "حذف دسته‌بندی با خطا مواجه شد.");
  }
}
