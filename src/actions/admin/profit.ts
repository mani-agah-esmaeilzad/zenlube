"use server";

import { z } from "zod";

import { createAuditLog } from "@/lib/admin-audit";
import { ensureAdminAction, ensureRoleAccess } from "@/lib/auth";
import { revalidateAdminSurface } from "@/lib/storefront-revalidate";
import prisma from "@/lib/prisma";

import type { ActionResult } from "./types";

const costSchema = z.object({
  productId: z.string().trim().min(1).max(100),
  purchaseCost: z.number().int().min(0).max(999_999_999_999).nullable(),
});

export async function saveProductPurchaseCostAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN"]);
  const rawCost = formData.get("purchaseCost");
  const parsed = costSchema.safeParse({
    productId: formData.get("productId"),
    purchaseCost: typeof rawCost !== "string" || rawCost.trim() === "" ? null : Number(rawCost),
  });
  if (!parsed.success) {
    return { success: false, message: "قیمت خرید نامعتبر است؛ مبلغ را به ریال و به‌صورت عدد صحیح وارد کنید." };
  }

  const updated = await prisma.product.updateMany({
    where: { id: parsed.data.productId, stock: { gt: 0 } },
    data: { purchaseCost: parsed.data.purchaseCost },
  });
  if (!updated.count) return { success: false, message: "این محصول دیگر موجود نیست یا پیدا نشد؛ فهرست را تازه‌سازی کنید." };
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: parsed.data.productId },
    select: { id: true, name: true },
  });
  await createAuditLog({
    actorUserId: userId,
    targetType: "product_purchase_cost",
    targetId: product.id,
    action: "update",
    summary: `بهای خرید محصول «${product.name}» ${parsed.data.purchaseCost == null ? "پاک شد" : "به‌روزرسانی شد"}.`,
    metadata: { purchaseCostRials: parsed.data.purchaseCost },
  });
  revalidateAdminSurface();
  return { success: true, message: "قیمت خرید ذخیره شد." };
}
