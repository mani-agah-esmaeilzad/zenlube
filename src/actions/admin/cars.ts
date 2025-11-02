"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { carSchema } from "@/lib/validators";
import { upsertCar } from "@/services/admin/mutations";

export async function createCarAction(formData: FormData): Promise<void> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = carSchema.safeParse({
    ...raw,
    yearFrom: raw.yearFrom ? Number(raw.yearFrom) : undefined,
    yearTo: raw.yearTo ? Number(raw.yearTo) : undefined,
    oilCapacityLit: raw.oilCapacityLit ? Number(raw.oilCapacityLit) : undefined,
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(flattened)
        .flat()
        .find((message) => Boolean(message)) ?? "اطلاعات خودرو نامعتبر است.";
    throw new Error(firstError);
  }

  await upsertCar(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/cars");
}
