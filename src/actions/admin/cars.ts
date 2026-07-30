"use server";

import { ensureAdminAction } from "@/lib/auth";
import { revalidateAdminSurface, revalidateStorefrontCatalog, revalidateStorefrontProduct } from "@/lib/storefront-revalidate";
import { carSchema, carUpdateSchema } from "@/lib/validators";
import { deleteCar, saveCar, setCarActiveState } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

function parseCarForm(formData: FormData) {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const id = formData.get("id");

  return {
    ...raw,
    id: typeof id === "string" ? id : undefined,
    isActive: formData.get("isActive") === "on",
    yearFrom: raw.yearFrom ? Number(raw.yearFrom) : undefined,
    yearTo: raw.yearTo ? Number(raw.yearTo) : undefined,
    oilCapacityLit: raw.oilCapacityLit ? Number(raw.oilCapacityLit) : undefined,
  };
}

async function persistCar(formData: FormData): Promise<ActionResult> {
  await ensureAdminAction();

  const payload = parseCarForm(formData);
  const parsed = (payload.id ? carUpdateSchema : carSchema).safeParse(payload);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await saveCar(parsed.data);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "ذخیره‌سازی خودرو با خطا مواجه شد.",
    };
  }

  revalidateAdminSurface();
  revalidateStorefrontProduct({ carSlugs: [parsed.data.slug] });

  return { success: true };
}

export async function saveCarAction(formData: FormData): Promise<ActionResult> {
  return persistCar(formData);
}

export async function createCarAction(formData: FormData): Promise<ActionResult> {
  return persistCar(formData);
}

export async function updateCarAction(formData: FormData): Promise<ActionResult> {
  return persistCar(formData);
}

export async function toggleCarVisibilityAction(carId: string, isActive: boolean): Promise<ActionResult> {
  await ensureAdminAction();

  await setCarActiveState(carId, isActive);

  revalidateAdminSurface();
  revalidateStorefrontCatalog();

  return { success: true };
}

export async function toggleCarVisibilityFormAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const carId = formData.get("carId");
  const carSlug = formData.get("carSlug");
  const nextIsActive = formData.get("nextIsActive");

  if (!carId || typeof carId !== "string" || !carSlug || typeof carSlug !== "string") {
    throw new Error("اطلاعات خودرو نامعتبر است.");
  }

  await setCarActiveState(carId, nextIsActive === "true");
  revalidateAdminSurface();
  revalidateStorefrontProduct({ carSlugs: [carSlug] });
}

export async function deleteCarFormAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const carId = formData.get("carId");
  const carSlug = formData.get("carSlug");
  if (!carId || typeof carId !== "string" || !carSlug || typeof carSlug !== "string") {
    throw new Error("شناسه خودرو نامعتبر است.");
  }

  await deleteCar(carId);
  revalidateAdminSurface();
  revalidateStorefrontProduct({ carSlugs: [carSlug] });
}
