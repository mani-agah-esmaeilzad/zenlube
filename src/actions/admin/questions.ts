"use server";

import { revalidatePath } from "next/cache";

import { ensureAdminAction } from "@/lib/auth";
import { answerQuestionSchema } from "@/lib/validators";
import { answerQuestion, archiveQuestion, deleteQuestion } from "@/services/admin/mutations";

export async function answerQuestionAction(formData: FormData): Promise<void> {
  await ensureAdminAction();

  const raw = Object.fromEntries(formData);
  const parsed = answerQuestionSchema.safeParse(raw);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(flattened)
        .flat()
        .find((message) => Boolean(message)) ?? "پاسخ پرسش نامعتبر است.";
    throw new Error(firstError);
  }

  const { targetSlug } = await answerQuestion(parsed.data, parsed.data.type);

  revalidatePath("/admin");
  if (parsed.data.type === "product" && targetSlug) {
    revalidatePath(`/products/${targetSlug}`);
  } else if (parsed.data.type === "car" && targetSlug) {
    revalidatePath(`/cars/${targetSlug}`);
  }
}

export async function archiveQuestionAction(questionId: string, type: "product" | "car"): Promise<void> {
  await ensureAdminAction();

  const { targetSlug } = await archiveQuestion(questionId, type);

  revalidatePath("/admin");
  if (type === "product" && targetSlug) {
    revalidatePath(`/products/${targetSlug}`);
  }
  if (type === "car" && targetSlug) {
    revalidatePath(`/cars/${targetSlug}`);
  }
}

export async function deleteQuestionFormAction(formData: FormData): Promise<void> {
  await ensureAdminAction();
  const questionId = formData.get("questionId");
  const type = formData.get("type");
  if (!questionId || typeof questionId !== "string" || (type !== "product" && type !== "car")) {
    throw new Error("شناسه پرسش نامعتبر است.");
  }

  const { targetSlug } = await deleteQuestion(questionId, type);
  revalidatePath("/admin");
  if (type === "product" && targetSlug) revalidatePath(`/products/${targetSlug}`);
  if (type === "car" && targetSlug) revalidatePath(`/cars/${targetSlug}`);
}
