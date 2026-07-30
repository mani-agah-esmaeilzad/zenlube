"use server";

import { ensureAdminAction } from "@/lib/auth";
import { revalidateAdminSurface, revalidateStorefrontContent, revalidateStorefrontProduct } from "@/lib/storefront-revalidate";
import { resetDatabaseExceptAdmin } from "@/services/admin/mutations";

export async function resetDatabaseExceptAdminFormAction(): Promise<void> {
  const { userId } = await ensureAdminAction();
  if (!userId) {
    throw new Error("شناسه مدیر فعلی پیدا نشد.");
  }

  await resetDatabaseExceptAdmin(userId);

  revalidateAdminSurface();
  revalidateStorefrontContent();
  revalidateStorefrontProduct({});
}
