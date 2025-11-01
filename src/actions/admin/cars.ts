"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { carSchema } from "@/lib/validators";
import { upsertCar } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

export async function createCarAction(formData: FormData): Promise<ActionResult> {
  await ensureAdminAction();

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

  await upsertCar(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/cars");

  return { success: true };
}
