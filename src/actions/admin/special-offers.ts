"use server";

import { createAuditLog } from "@/lib/admin-audit";
import { ensureAdminAction, ensureRoleAccess } from "@/lib/auth";
import { parseTehranLocalDateTime } from "@/lib/iran-datetime";
import prisma from "@/lib/prisma";
import { revalidateAdminSurface, revalidateStorefrontProduct } from "@/lib/storefront-revalidate";
import { productCommerceSchema, productPromotionSchema } from "@/lib/validators";
import {
  deleteProductPromotion,
  saveProductPromotion,
  updateProductCommerce,
} from "@/services/admin/mutations";

import type { ActionResult } from "./types";

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function saveProductPromotionAction(
  _previousState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]);

  const raw = Object.fromEntries(formData);
  const parsed = productPromotionSchema.safeParse({
    ...raw,
    specialPrice: raw.specialPrice ? Number(raw.specialPrice) : undefined,
    sortOrder: raw.sortOrder ? Number(raw.sortOrder) : 0,
    isActive: parseCheckbox(formData.get("isActive")),
  });

  if (!parsed.success) {
    return { success: false, message: "اطلاعات پیشنهاد را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
  }

  let startsAt: Date | null;
  let endsAt: Date | null;
  try {
    startsAt = parseTehranLocalDateTime(parsed.data.startsAt);
    endsAt = parseTehranLocalDateTime(parsed.data.endsAt);
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "زمان‌بندی معتبر نیست." };
  }

  if (startsAt && endsAt && endsAt <= startsAt) {
    return { success: false, errors: { endsAt: ["زمان پایان باید بعد از زمان شروع باشد."] } };
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, name: true, slug: true, price: true },
  });

  if (!product) {
    return { success: false, message: "محصول انتخاب‌شده پیدا نشد." };
  }

  if (parsed.data.specialPrice != null && Number(product.price) <= 0) {
    return { success: false, errors: { specialPrice: ["ابتدا قیمت اصلی محصول را در بخش قیمت و موجودی ثبت کنید."] } };
  }

  if (parsed.data.specialPrice != null && parsed.data.specialPrice >= Number(product.price)) {
    return { success: false, errors: { specialPrice: ["قیمت ویژه باید کمتر از قیمت اصلی محصول باشد."] } };
  }

  const offer = await saveProductPromotion({
    productId: parsed.data.productId,
    kind: parsed.data.kind,
    label: parsed.data.label,
    specialPrice: parsed.data.specialPrice,
    startsAt,
    endsAt,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
  });

  await createAuditLog({
    actorUserId: userId,
    targetType: "product_promotion",
    targetId: offer.id,
    action: "upsert",
    summary: `پیشنهاد «${offer.product.name}» ذخیره شد.`,
  });

  revalidateAdminSurface();
  revalidateStorefrontProduct({ productSlugs: [offer.product.slug] });
  return { success: true, message: "پیشنهاد ویژه ذخیره شد." };
}

export async function deleteProductPromotionFormAction(formData: FormData): Promise<void> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "CONTENT_MANAGER", "OPERATIONS_MANAGER"]);

  const promotionId = formData.get("promotionId");
  if (!promotionId || typeof promotionId !== "string") {
    throw new Error("شناسه پیشنهاد معتبر نیست.");
  }

  const offer = await deleteProductPromotion(promotionId);
  await createAuditLog({
    actorUserId: userId,
    targetType: "product_promotion",
    targetId: promotionId,
    action: "delete",
    summary: `پیشنهاد «${offer.product.name}» حذف شد.`,
  });
  revalidateAdminSurface();
  revalidateStorefrontProduct({ productSlugs: [offer.product.slug] });
}

export async function quickUpdateProductCommerceAction(
  _previousState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { userId, session } = await ensureAdminAction();
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "OPERATIONS_MANAGER"]);

  const raw = Object.fromEntries(formData);
  const parsed = productCommerceSchema.safeParse({
    productId: raw.productId,
    price: Number(raw.price),
    stock: Number(raw.stock),
  });

  if (!parsed.success) {
    return { success: false, message: "قیمت و موجودی را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
  }

  const product = await updateProductCommerce(parsed.data);
  await createAuditLog({
    actorUserId: userId,
    targetType: "product_commerce",
    targetId: product.id,
    action: "update",
    summary: `قیمت و موجودی «${product.name}» به‌روزرسانی شد.`,
  });

  revalidateAdminSurface();
  revalidateStorefrontProduct({ productSlugs: [product.slug] });
  return { success: true, message: "قیمت و موجودی ذخیره شد." };
}
