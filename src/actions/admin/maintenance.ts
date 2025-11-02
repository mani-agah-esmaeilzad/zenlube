"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { maintenanceTaskSchema } from "@/lib/validators";
import { deleteMaintenanceTask, upsertMaintenanceTask } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

export async function createMaintenanceTaskAction(formData: FormData): Promise<ActionResult> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData);
  const parsed = maintenanceTaskSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await upsertMaintenanceTask(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/cars");

  return { success: true };
}

export async function deleteMaintenanceTaskAction(taskId: string): Promise<ActionResult> {
  await ensureAdminAction();

  await deleteMaintenanceTask(taskId);

  revalidatePath("/admin");
  revalidatePath("/cars");

  return { success: true };
}

export async function deleteMaintenanceTaskFormAction(formData: FormData): Promise<ActionResult> {
  const taskId = formData.get("taskId");
  if (!taskId || typeof taskId !== "string") {
    return { success: false, message: "شناسه سرویس نامعتبر است." };
  }

  return deleteMaintenanceTaskAction(taskId);
}
