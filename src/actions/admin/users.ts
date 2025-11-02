"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction, ensureNotSelf } from "@/lib/auth";
import { updateUserRole } from "@/services/admin/mutations";

const allowedRoles = new Set(["ADMIN", "CUSTOMER"]);

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const { userId: sessionUserId } = await ensureAdminAction();

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (!userId || typeof userId !== "string") {
    throw new Error("شناسه کاربر نامعتبر است.");
  }

  if (!role || typeof role !== "string" || !allowedRoles.has(role)) {
    throw new Error("نقش انتخاب‌شده معتبر نیست.");
  }

  ensureNotSelf(userId, sessionUserId);

  await updateUserRole(userId, role as "ADMIN" | "CUSTOMER");

  revalidatePath("/admin");
}
