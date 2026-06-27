"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { resetDatabaseExceptAdmin } from "@/services/admin/mutations";

export async function resetDatabaseExceptAdminFormAction(): Promise<void> {
  const { userId } = await ensureAdminAction();
  if (!userId) {
    throw new Error("شناسه مدیر فعلی پیدا نشد.");
  }

  await resetDatabaseExceptAdmin(userId);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/categories");
  revalidatePath("/brands");
  revalidatePath("/cars");
  revalidatePath("/blog");
  revalidatePath("/cart");
}
