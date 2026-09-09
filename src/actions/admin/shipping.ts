"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma";
import { createAuditLog } from "@/lib/admin-audit";
import { ensureAdminAction, ensureRoleAccess } from "@/lib/auth";
import { config } from "@/lib/config";
import { normalizeIranPhone, validateIranPhone } from "@/lib/phone";
import prisma from "@/lib/prisma";
import { normalizeIranPostalCode } from "@/lib/shipping/address";
import {
  resolveShippingLocation,
  resolveShippingLocationNames,
  syncShippingLocations,
} from "@/lib/shipping/locations";
import { getShippingProvider } from "@/lib/shipping/providers";
import { evaluateShippingRollout, getShippingRolloutEnvironment } from "@/lib/shipping/rollout";
import { storefrontBuyablePhysicalProductWhere } from "@/lib/storefront-visibility";

import type { ActionResult } from "./types";

const optionalText = z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().optional());

const settingsSchema = z.object({
  enabled: z.boolean(),
  providerStoreId: optionalText,
  providerProductTypeCode: optionalText,
  originProvinceCode: optionalText,
  originCityCode: optionalText,
  originAddress: optionalText,
  originPostalCode: optionalText,
  senderName: optionalText,
  senderMobile: optionalText,
  enabledCarriers: z.array(z.enum(["POST", "TIPAX"])),
  basePackagingWeightGrams: z.number().int().min(0).max(100_000),
  extraPackagingWeightPerAdditionalItemGrams: z.number().int().min(0).max(100_000),
  minimumPackageWeightGrams: z.number().int().min(10).max(2_000_000),
  defaultLengthCm: z.number().int().positive().max(500),
  defaultWidthCm: z.number().int().positive().max(500),
  defaultHeightCm: z.number().int().positive().max(500),
  freeShippingEnabled: z.boolean(),
  freeShippingThresholdRials: z.number().int().nonnegative().nullable(),
  adjustmentFixedRials: z.number().int().min(-100_000_000).max(100_000_000),
  adjustmentPercent: z.number().min(-100).max(500),
  manualFallbackEnabled: z.boolean(),
  manualFallbackLabel: optionalText,
  manualFallbackCostRials: z.number().int().nonnegative().nullable(),
  quoteTtlSeconds: z.number().int().min(60).max(3600),
  providerTimeoutMs: z.number().int().min(1000).max(20_000),
});

function numberValue(formData: FormData, key: string, fallback: number) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  return Number(raw);
}

function nullableNumberValue(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  return Number(raw);
}

function checked(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true";
}

async function requireShippingAdmin() {
  const auth = await ensureAdminAction();
  const role = (auth.session as { user?: { role?: string | null } } | null)?.user?.role ?? null;
  ensureRoleAccess(role, ["ADMIN", "OPERATIONS_MANAGER"]);
  return auth;
}

export async function saveShippingSettingsAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  void _previous;
  try {
    const { userId } = await requireShippingAdmin();
    const raw = Object.fromEntries(formData);
    const parsed = settingsSchema.safeParse({
      ...raw,
      enabled: checked(formData, "enabled"),
      enabledCarriers: formData.getAll("enabledCarriers").map(String),
      basePackagingWeightGrams: numberValue(formData, "basePackagingWeightGrams", 100),
      extraPackagingWeightPerAdditionalItemGrams: numberValue(formData, "extraPackagingWeightPerAdditionalItemGrams", 0),
      minimumPackageWeightGrams: numberValue(formData, "minimumPackageWeightGrams", 10),
      defaultLengthCm: numberValue(formData, "defaultLengthCm", 20),
      defaultWidthCm: numberValue(formData, "defaultWidthCm", 15),
      defaultHeightCm: numberValue(formData, "defaultHeightCm", 10),
      freeShippingEnabled: checked(formData, "freeShippingEnabled"),
      freeShippingThresholdRials: nullableNumberValue(formData, "freeShippingThresholdRials"),
      adjustmentFixedRials: numberValue(formData, "adjustmentFixedRials", 0),
      adjustmentPercent: numberValue(formData, "adjustmentPercent", 0),
      manualFallbackEnabled: checked(formData, "manualFallbackEnabled"),
      manualFallbackCostRials: nullableNumberValue(formData, "manualFallbackCostRials"),
      quoteTtlSeconds: numberValue(formData, "quoteTtlSeconds", 600),
      providerTimeoutMs: numberValue(formData, "providerTimeoutMs", 6000),
    });
    if (!parsed.success) {
      return { success: false, message: "مقادیر تنظیمات ارسال را بررسی کنید.", errors: parsed.error.flatten().fieldErrors };
    }

    const input = parsed.data;
    let location: Awaited<ReturnType<typeof resolveShippingLocationNames>> = null;
    if (input.originProvinceCode && input.originCityCode) {
      location = await resolveShippingLocationNames({ provinceCode: input.originProvinceCode, cityCode: input.originCityCode });
      if (!location) return { success: false, message: "مبدا انتخاب‌شده معتبر نیست.", errors: { originCityCode: ["شهر مبدا را دوباره انتخاب کنید."] } };
    }

    const normalizedPostalCode = input.originPostalCode ? normalizeIranPostalCode(input.originPostalCode) : null;
    const normalizedMobile = input.senderMobile ? normalizeIranPhone(input.senderMobile) : null;
    if (input.originPostalCode && !/^\d{10}$/.test(normalizedPostalCode ?? "")) {
      return { success: false, message: "کد پستی مبدا باید ۱۰ رقم باشد.", errors: { originPostalCode: ["کد پستی باید ۱۰ رقم باشد."] } };
    }
    if (input.senderMobile && !validateIranPhone(normalizedMobile ?? "")) {
      return { success: false, message: "شماره موبایل فرستنده معتبر نیست.", errors: { senderMobile: ["شماره موبایل معتبر نیست."] } };
    }
    if (input.freeShippingEnabled && input.freeShippingThresholdRials == null) {
      return { success: false, message: "حداقل خرید برای ارسال رایگان را وارد کنید.", errors: { freeShippingThresholdRials: ["این مقدار الزامی است."] } };
    }
    if (input.manualFallbackEnabled && (input.manualFallbackCostRials == null || !input.manualFallbackLabel)) {
      return { success: false, message: "نام و مبلغ روش جایگزین را کامل کنید.", errors: { manualFallbackCostRials: ["نام و مبلغ روش جایگزین الزامی است."] } };
    }

    const providerKey = config.SHIPPING_PROVIDER === "disabled" ? "amadast" : config.SHIPPING_PROVIDER;
    if (input.enabled) {
      const originMappingPromise = location
        ? resolveShippingLocation({
            provinceCode: location.province.code,
            cityCode: location.city.code,
            providerKey,
          })
        : Promise.resolve(null);
      const [missingWeightProducts, mappedProvinces, mappedCities, originMapping] = await Promise.all([
        prisma.product.count({
          where: storefrontBuyablePhysicalProductWhere({
            OR: [
              { shippingWeightGrams: null },
              { shippingWeightGrams: { lte: 0 } },
            ],
          }),
        }),
        prisma.shippingLocation.count({
          where: { kind: "PROVINCE", isActive: true, providerMaps: { some: { providerKey } } },
        }),
        prisma.shippingLocation.count({
          where: { kind: "CITY", isActive: true, providerMaps: { some: { providerKey } } },
        }),
        originMappingPromise,
      ]);
      const rollout = evaluateShippingRollout({
        settings: {
          enabled: true,
          providerKey,
          providerStoreId: input.providerStoreId ?? null,
          providerProductTypeCode: input.providerProductTypeCode ?? null,
          originProvinceCode: location?.province.code ?? null,
          originCityCode: location?.city.code ?? null,
          originAddress: input.originAddress ?? null,
          originPostalCode: normalizedPostalCode,
          senderName: input.senderName ?? null,
          senderMobile: normalizedMobile,
          enabledCarriers: input.enabledCarriers,
        },
        environment: getShippingRolloutEnvironment(),
        stats: {
          missingWeightProducts,
          mappedProvinces,
          mappedCities,
          originMapped: Boolean(originMapping),
        },
      });
      if (!rollout.setupReady) {
        return {
          success: false,
          message: `فعال‌سازی انجام نشد: ${rollout.blockers.map((blocker) => blocker.message).join(" ")}`,
        };
      }
    }

    await prisma.shippingSettings.upsert({
      where: { id: "default" },
      update: {
        enabled: input.enabled,
        providerKey,
        providerStoreId: input.providerStoreId ?? null,
        providerProductTypeCode: input.providerProductTypeCode ?? null,
        originProvinceCode: location?.province.code ?? null,
        originProvinceName: location?.province.name ?? null,
        originCityCode: location?.city.code ?? null,
        originCityName: location?.city.name ?? null,
        originAddress: input.originAddress ?? null,
        originPostalCode: normalizedPostalCode,
        senderName: input.senderName ?? null,
        senderMobile: normalizedMobile,
        enabledCarriers: input.enabledCarriers,
        basePackagingWeightGrams: input.basePackagingWeightGrams,
        extraPackagingWeightPerAdditionalItemGrams: input.extraPackagingWeightPerAdditionalItemGrams,
        minimumPackageWeightGrams: input.minimumPackageWeightGrams,
        defaultLengthCm: input.defaultLengthCm,
        defaultWidthCm: input.defaultWidthCm,
        defaultHeightCm: input.defaultHeightCm,
        freeShippingEnabled: input.freeShippingEnabled,
        freeShippingThresholdRials: input.freeShippingThresholdRials == null ? null : new Prisma.Decimal(input.freeShippingThresholdRials),
        adjustmentFixedRials: new Prisma.Decimal(input.adjustmentFixedRials),
        adjustmentPercent: new Prisma.Decimal(input.adjustmentPercent),
        manualFallbackEnabled: input.manualFallbackEnabled,
        manualFallbackLabel: input.manualFallbackLabel ?? null,
        manualFallbackCostRials: input.manualFallbackCostRials == null ? null : new Prisma.Decimal(input.manualFallbackCostRials),
        quoteTtlSeconds: input.quoteTtlSeconds,
        providerTimeoutMs: input.providerTimeoutMs,
      },
      create: {
        id: "default",
        enabled: input.enabled,
        providerKey,
        providerStoreId: input.providerStoreId ?? null,
        providerProductTypeCode: input.providerProductTypeCode ?? null,
        originProvinceCode: location?.province.code ?? null,
        originProvinceName: location?.province.name ?? null,
        originCityCode: location?.city.code ?? null,
        originCityName: location?.city.name ?? null,
        originAddress: input.originAddress ?? null,
        originPostalCode: normalizedPostalCode,
        senderName: input.senderName ?? null,
        senderMobile: normalizedMobile,
        enabledCarriers: input.enabledCarriers,
        basePackagingWeightGrams: input.basePackagingWeightGrams,
        extraPackagingWeightPerAdditionalItemGrams: input.extraPackagingWeightPerAdditionalItemGrams,
        minimumPackageWeightGrams: input.minimumPackageWeightGrams,
        defaultLengthCm: input.defaultLengthCm,
        defaultWidthCm: input.defaultWidthCm,
        defaultHeightCm: input.defaultHeightCm,
        freeShippingEnabled: input.freeShippingEnabled,
        freeShippingThresholdRials: input.freeShippingThresholdRials == null ? null : new Prisma.Decimal(input.freeShippingThresholdRials),
        adjustmentFixedRials: new Prisma.Decimal(input.adjustmentFixedRials),
        adjustmentPercent: new Prisma.Decimal(input.adjustmentPercent),
        manualFallbackEnabled: input.manualFallbackEnabled,
        manualFallbackLabel: input.manualFallbackLabel ?? null,
        manualFallbackCostRials: input.manualFallbackCostRials == null ? null : new Prisma.Decimal(input.manualFallbackCostRials),
        quoteTtlSeconds: input.quoteTtlSeconds,
        providerTimeoutMs: input.providerTimeoutMs,
      },
    });
    await createAuditLog({
      actorUserId: userId,
      targetType: "shipping_settings",
      targetId: "default",
      action: "update",
      summary: `تنظیمات ارسال ${input.enabled ? "فعال" : "غیرفعال"} و ذخیره شد.`,
      metadata: { providerKey, enabledCarriers: input.enabledCarriers, freeShippingEnabled: input.freeShippingEnabled },
    });
    revalidatePath("/admin");
    revalidatePath("/cart/checkout");
    return { success: true, message: "تنظیمات ارسال ذخیره شد." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "ذخیره تنظیمات ارسال ناموفق بود." };
  }
}

export async function syncShippingLocationsAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  void _previous;
  void _formData;
  try {
    const { userId } = await requireShippingAdmin();
    const environment = getShippingRolloutEnvironment();
    if (environment.providerMode === "disabled") {
      return { success: false, message: "ابتدا اطلاعات اتصال آمادست را روی سرور ثبت و SHIPPING_PROVIDER را روی amadast قرار دهید." };
    }
    if (environment.nodeEnv === "production" && environment.providerMode === "mock") {
      return { success: false, message: "حالت آزمایشی در محیط اصلی مجاز نیست." };
    }
    if (
      environment.providerMode === "amadast"
      && (!environment.clientCodeConfigured || !environment.providerIdentityConfigured)
    ) {
      return { success: false, message: "اطلاعات اتصال آمادست روی سرور کامل نیست." };
    }
    const provider = getShippingProvider();
    const settings = await prisma.shippingSettings.findUnique({ where: { id: "default" }, select: { providerTimeoutMs: true } });
    const result = await syncShippingLocations(provider, Math.max(settings?.providerTimeoutMs ?? 6000, 10_000));
    await createAuditLog({
      actorUserId: userId,
      targetType: "shipping_locations",
      targetId: provider.key,
      action: "sync",
      summary: `${result.provinces.toLocaleString("fa-IR")} استان و ${result.cities.toLocaleString("fa-IR")} شهر همگام شد.`,
    });
    revalidatePath("/admin");
    revalidatePath("/cart/checkout");
    return { success: true, message: `${result.provinces.toLocaleString("fa-IR")} استان و ${result.cities.toLocaleString("fa-IR")} شهر دریافت شد.` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "همگام‌سازی شهرها ناموفق بود." };
  }
}
