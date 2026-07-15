"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/admin-audit";
import { ensureAdminAction, ensureRoleAccess } from "@/lib/auth";
import { appendOrderStatusEvent } from "@/lib/commerce";
import prisma from "@/lib/prisma";
import { returnRequestAdminSchema } from "@/lib/validators";
import { updateReturnRequest } from "@/services/admin/mutations";

export async function updateReturnRequestAction(formData: FormData): Promise<void> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "OPERATIONS_MANAGER", "SUPPORT"]);

  const raw = Object.fromEntries(formData);
  const parsed = returnRequestAdminSchema.safeParse({
    ...raw,
    refundAmount: raw.refundAmount ? Number(raw.refundAmount) : undefined,
  });

  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors).flat().find(Boolean) ?? "داده مرجوعی نامعتبر است.";
    throw new Error(firstError);
  }

  const request = await updateReturnRequest(parsed.data);

  await prisma.$transaction(async (tx) => {
    await appendOrderStatusEvent(tx, {
      orderId: request.orderId,
      status: `RETURN_${parsed.data.status}`,
      title: "وضعیت مرجوعی به‌روزرسانی شد",
      detail: `وضعیت درخواست مرجوعی به ${parsed.data.status} تغییر کرد.`,
    });
  });

  await createAuditLog({
    actorUserId: userId,
    targetType: "return_request",
    targetId: request.id,
    action: "update",
    summary: `وضعیت مرجوعی سفارش ${request.orderId} به ${parsed.data.status} تغییر کرد.`,
    metadata: { status: parsed.data.status, refundAmount: parsed.data.refundAmount ?? null },
  });

  revalidatePath("/admin");
  revalidatePath("/account");
}
