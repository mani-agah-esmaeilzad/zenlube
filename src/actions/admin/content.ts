"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/admin-audit";
import { ensureAdminAction, ensureRoleAccess } from "@/lib/auth";
import { couponSchema, marketingBannerSchema } from "@/lib/validators";
import { deleteCoupon, deleteMarketingBanner, saveCoupon, saveMarketingBanner } from "@/services/admin/mutations";

import type { ActionResult } from "./types";

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function saveMarketingBannerAction(formData: FormData): Promise<ActionResult> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "CONTENT_MANAGER"]);

  const raw = Object.fromEntries(formData);
  const parsed = marketingBannerSchema.safeParse({
    ...raw,
    isActive: parseCheckbox(formData.get("isActive")),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await saveMarketingBanner({
    ...parsed.data,
    isActive: parsed.data.isActive ?? false,
  });

  await createAuditLog({
    actorUserId: userId,
    targetType: "marketing_banner",
    targetId: parsed.data.id ?? parsed.data.title,
    action: parsed.data.id ? "update" : "create",
    summary: `بنر «${parsed.data.title}» ذخیره شد.`,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteMarketingBannerAction(formData: FormData): Promise<void> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "CONTENT_MANAGER"]);

  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("شناسه بنر نامعتبر است.");
  }

  await deleteMarketingBanner(id);
  await createAuditLog({
    actorUserId: userId,
    targetType: "marketing_banner",
    targetId: id,
    action: "delete",
    summary: "یک بنر مارکتینگ حذف شد.",
  });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function saveCouponAction(formData: FormData): Promise<ActionResult> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]);

  const raw = Object.fromEntries(formData);
  const parsed = couponSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
    minOrderAmount: raw.minOrderAmount ? Number(raw.minOrderAmount) : undefined,
    maxDiscountAmount: raw.maxDiscountAmount ? Number(raw.maxDiscountAmount) : undefined,
    usageLimit: raw.usageLimit ? Number(raw.usageLimit) : undefined,
    isActive: parseCheckbox(formData.get("isActive")),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await saveCoupon({
    ...parsed.data,
    isActive: parsed.data.isActive ?? false,
  });

  await createAuditLog({
    actorUserId: userId,
    targetType: "coupon",
    targetId: parsed.data.id ?? parsed.data.code,
    action: parsed.data.id ? "update" : "create",
    summary: `کد تخفیف «${parsed.data.code.toUpperCase()}» ذخیره شد.`,
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteCouponAction(formData: FormData): Promise<void> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]);

  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("شناسه کد تخفیف نامعتبر است.");
  }

  await deleteCoupon(id);
  await createAuditLog({
    actorUserId: userId,
    targetType: "coupon",
    targetId: id,
    action: "delete",
    summary: "یک کد تخفیف حذف شد.",
  });
  revalidatePath("/admin");
}
