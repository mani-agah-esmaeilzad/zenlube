"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { brandSchema, brandUpdateSchema } from "@/lib/validators";
import { countProductsByBrand, deleteBrand, saveBrand } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

export async function createBrandAction(formData: FormData): Promise<ActionResult> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = brandSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await saveBrand(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/products");

  return { success: true };
}

export async function updateBrandAction(formData: FormData): Promise<ActionResult> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = brandUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await saveBrand(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/products");

  return { success: true };
}

export async function deleteBrandAction(brandId: string): Promise<ActionResult> {
  await ensureAdminAction();

  const linkedProducts = await countProductsByBrand(brandId);
  if (linkedProducts > 0) {
    return {
      success: false,
      message: "ابتدا محصولات مرتبط با این برند را ویرایش یا حذف کنید.",
    };
  }

  await deleteBrand(brandId);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath("/products");

  return { success: true };
}

export async function deleteBrandFormAction(formData: FormData): Promise<ActionResult> {
  const brandId = formData.get("brandId");
  if (!brandId || typeof brandId !== "string") {
    return { success: false, message: "شناسه برند نامعتبر است." };
  }
  return deleteBrandAction(brandId);
}
