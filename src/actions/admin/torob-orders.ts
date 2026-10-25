"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAuditLog } from "@/lib/admin-audit";
import { ensureAdminAction, ensureRoleAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

import type { ActionResult } from "./types";

export async function saveTorobOrderTrackingAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  void _previous;
  try {
    const { userId, session } = await ensureAdminAction();
    const role = (session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
    ensureRoleAccess(role, ["ADMIN"]);

    const parsed = z.boolean().safeParse(formData.get("enabled") === "on");
    if (!parsed.success) return { success: false, message: "وضعیت فعال‌سازی معتبر نیست." };

    const settings = await prisma.torobOrderTrackingSettings.upsert({
      where: { id: "default" },
      create: { id: "default", enabled: parsed.data },
      update: { enabled: parsed.data },
    });
    await createAuditLog({
      actorUserId: userId,
      targetType: "torob_order_tracking",
      targetId: settings.id,
      action: parsed.data ? "enabled" : "disabled",
      summary: parsed.data ? "همگام‌سازی سفارش‌های ترب فعال شد." : "همگام‌سازی سفارش‌های ترب غیرفعال شد.",
    });

    revalidatePath("/admin");
    return { success: true, message: parsed.data ? "دسترسی API سفارش‌های ترب فعال شد." : "دسترسی API سفارش‌های ترب غیرفعال شد." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "ذخیره تنظیمات ترب انجام نشد." };
  }
}
