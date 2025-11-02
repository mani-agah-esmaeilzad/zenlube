"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { maintenanceTaskSchema } from "@/lib/validators";
import { deleteMaintenanceTask, upsertMaintenanceTask } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

export async function createMaintenanceTaskAction(formData: FormData): Promise<void> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData);
  const parsed = maintenanceTaskSchema.safeParse(raw);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(flattened)
        .flat()
        .find((message) => Boolean(message)) ?? "اطلاعات سرویس نامعتبر است.";
    throw new Error(firstError);
  }

  await upsertMaintenanceTask(parsed.data);

  revalidatePath("/admin");
  revalidatePath("/cars");
}

export async function deleteMaintenanceTaskAction(taskId: string): Promise<ActionResult> {
  await ensureAdminAction();

  await deleteMaintenanceTask(taskId);

  revalidatePath("/admin");
  revalidatePath("/cars");

  return { success: true };
}

export async function deleteMaintenanceTaskFormAction(formData: FormData): Promise<void> {
  const taskId = formData.get("taskId");
  if (!taskId || typeof taskId !== "string") {
    throw new Error("شناسه سرویس نامعتبر است.");
  }

  const result = await deleteMaintenanceTaskAction(taskId);
  if (!result.success) {
    throw new Error("حذف سرویس با خطا مواجه شد.");
  }
}
