"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { answerQuestionSchema } from "@/lib/validators";
import { answerQuestion, archiveQuestion } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

export async function answerQuestionAction(formData: FormData): Promise<ActionResult> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData);
  const parsed = answerQuestionSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { targetSlug } = await answerQuestion(parsed.data, parsed.data.type);

  revalidatePath("/admin");
  if (parsed.data.type === "product" && targetSlug) {
    revalidatePath(`/products/${targetSlug}`);
  } else if (parsed.data.type === "car" && targetSlug) {
    revalidatePath(`/cars/${targetSlug}`);
  }

  return { success: true };
}

export async function archiveQuestionAction(questionId: string, type: "product" | "car"): Promise<ActionResult> {
  await ensureAdminAction();

  const { targetSlug } = await archiveQuestion(questionId, type);

  revalidatePath("/admin");
  if (type === "product" && targetSlug) {
    revalidatePath(`/products/${targetSlug}`);
  }
  if (type === "car" && targetSlug) {
    revalidatePath(`/cars/${targetSlug}`);
  }

  return { success: true };
}
