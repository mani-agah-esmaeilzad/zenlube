"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction, ensureNotSelf } from "@/lib/auth";
import { updateUserRole } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

const allowedRoles = new Set(["ADMIN", "CUSTOMER"]);

export async function updateUserRoleAction(formData: FormData): Promise<ActionResult> {
  const { userId: sessionUserId } = await ensureAdminAction();

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (!userId || typeof userId !== "string") {
    return { success: false, message: "شناسه کاربر نامعتبر است." };
  }

  if (!role || typeof role !== "string" || !allowedRoles.has(role)) {
    return { success: false, message: "نقش انتخاب‌شده معتبر نیست." };
  }

  ensureNotSelf(userId, sessionUserId);

  await updateUserRole(userId, role as "ADMIN" | "CUSTOMER");

  revalidatePath("/admin");

  return { success: true };
}
