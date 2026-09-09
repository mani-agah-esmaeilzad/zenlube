import { config } from "@/lib/config";
import prisma from "@/lib/prisma";
import {
  DEFAULT_SHIPPING_ORIGIN,
  resolveDefaultShippingOrigin,
} from "@/lib/shipping/origin-defaults";
import { getShippingProvider } from "@/lib/shipping/providers";
import { evaluateShippingRollout, getShippingRolloutEnvironment } from "@/lib/shipping/rollout";
import { storefrontBuyablePhysicalProductWhere } from "@/lib/storefront-visibility";

import type { ShippingTabData } from "./types";

const DEFAULT_SETTINGS: ShippingTabData["settings"] = {
  enabled: false,
  providerKey: "amadast",
  providerStoreId: "",
  providerProductTypeCode: "",
  originProvinceCode: "",
  originCityCode: "",
  originAddress: DEFAULT_SHIPPING_ORIGIN.address,
  originPostalCode: "",
  senderName: "",
  senderMobile: "",
  enabledCarriers: ["POST", "TIPAX"],
  basePackagingWeightGrams: 100,
  extraPackagingWeightPerAdditionalItemGrams: 0,
  minimumPackageWeightGrams: 10,
  defaultLengthCm: 20,
  defaultWidthCm: 15,
  defaultHeightCm: 10,
  freeShippingEnabled: false,
  freeShippingThresholdRials: null,
  adjustmentFixedRials: 0,
  adjustmentPercent: 0,
  manualFallbackEnabled: false,
  manualFallbackLabel: "",
  manualFallbackCostRials: null,
  quoteTtlSeconds: 600,
  providerTimeoutMs: 6000,
};

export async function getShippingTabData(): Promise<ShippingTabData> {
  const stored = await prisma.shippingSettings.findUnique({ where: { id: "default" } });
  const provider = config.SHIPPING_PROVIDER === "disabled"
    || (config.SHIPPING_PROVIDER === "mock" && config.NODE_ENV === "production")
    ? null
    : getShippingProvider();
  const providerKey = provider?.key ?? stored?.providerKey ?? "amadast";

  const [provinces, cities, physicalProducts, missingWeightProducts, mappedProvinces, mappedCities, lastSync] = await Promise.all([
    prisma.shippingLocation.findMany({
      where: {
        kind: "PROVINCE",
        isActive: true,
        providerMaps: { some: { providerKey } },
      },
      select: { code: true, name: true, parentCode: true },
      orderBy: { name: "asc" },
    }),
    prisma.shippingLocation.findMany({
      where: {
        kind: "CITY",
        isActive: true,
        providerMaps: { some: { providerKey } },
      },
      select: { code: true, name: true, parentCode: true },
      orderBy: [{ parentCode: "asc" }, { name: "asc" }],
    }),
    prisma.product.count({ where: storefrontBuyablePhysicalProductWhere() }),
    prisma.product.count({
      where: storefrontBuyablePhysicalProductWhere({
        OR: [
          { shippingWeightGrams: null },
          { shippingWeightGrams: { lte: 0 } },
        ],
      }),
    }),
    prisma.shippingLocation.count({
      where: {
        kind: "PROVINCE",
        isActive: true,
        providerMaps: { some: { providerKey } },
      },
    }),
    prisma.shippingLocation.count({
      where: {
        kind: "CITY",
        isActive: true,
        providerMaps: { some: { providerKey } },
      },
    }),
    prisma.shippingProviderLocationMap.aggregate({
      where: { providerKey },
      _max: { syncedAt: true },
    }),
  ]);

  const rolloutEnvironment = getShippingRolloutEnvironment();
  const clientCodeConfigured = rolloutEnvironment.clientCodeConfigured;
  const providerIdentityConfigured = rolloutEnvironment.providerIdentityConfigured;
  const isProductionMock = config.NODE_ENV === "production" && config.SHIPPING_PROVIDER === "mock";
  const environmentReady = config.SHIPPING_PROVIDER === "amadast"
    ? clientCodeConfigured && providerIdentityConfigured
    : config.SHIPPING_PROVIDER === "mock"
      ? !isProductionMock
      : false;
  const originMapped = Boolean(
    stored?.originProvinceCode
      && stored.originCityCode
      && provinces.some((province) => province.code === stored.originProvinceCode)
      && cities.some((city) => (
        city.code === stored.originCityCode
        && city.parentCode === stored.originProvinceCode
      )),
  );
  const originDefaults = resolveDefaultShippingOrigin({
    provinces,
    cities,
    storedProvinceCode: stored?.originProvinceCode,
    storedCityCode: stored?.originCityCode,
  });
  const rollout = evaluateShippingRollout({
    settings: stored,
    environment: rolloutEnvironment,
    stats: { missingWeightProducts, mappedProvinces, mappedCities, originMapped },
  });

  return {
    settings: stored ? {
      enabled: stored.enabled,
      providerKey: stored.providerKey,
      providerStoreId: stored.providerStoreId ?? "",
      providerProductTypeCode: stored.providerProductTypeCode ?? "",
      originProvinceCode: originDefaults.provinceCode,
      originCityCode: originDefaults.cityCode,
      originAddress: stored.originAddress?.trim() || DEFAULT_SHIPPING_ORIGIN.address,
      originPostalCode: stored.originPostalCode ?? "",
      senderName: stored.senderName ?? "",
      senderMobile: stored.senderMobile ?? "",
      enabledCarriers: stored.enabledCarriers,
      basePackagingWeightGrams: stored.basePackagingWeightGrams,
      extraPackagingWeightPerAdditionalItemGrams: stored.extraPackagingWeightPerAdditionalItemGrams,
      minimumPackageWeightGrams: stored.minimumPackageWeightGrams,
      defaultLengthCm: stored.defaultLengthCm,
      defaultWidthCm: stored.defaultWidthCm,
      defaultHeightCm: stored.defaultHeightCm,
      freeShippingEnabled: stored.freeShippingEnabled,
      freeShippingThresholdRials: stored.freeShippingThresholdRials?.toNumber() ?? null,
      adjustmentFixedRials: stored.adjustmentFixedRials.toNumber(),
      adjustmentPercent: stored.adjustmentPercent.toNumber(),
      manualFallbackEnabled: stored.manualFallbackEnabled,
      manualFallbackLabel: stored.manualFallbackLabel ?? "",
      manualFallbackCostRials: stored.manualFallbackCostRials?.toNumber() ?? null,
      quoteTtlSeconds: stored.quoteTtlSeconds,
      providerTimeoutMs: stored.providerTimeoutMs,
    } : {
      ...DEFAULT_SETTINGS,
      providerKey,
      originProvinceCode: originDefaults.provinceCode,
      originCityCode: originDefaults.cityCode,
    },
    environment: {
      providerMode: config.SHIPPING_PROVIDER,
      clientCodeConfigured,
      providerIdentityConfigured,
      ready: environmentReady,
      isProductionMock,
    },
    rollout: {
      mode: rollout.mode,
      setupReady: rollout.setupReady,
      enabled: rollout.enabled,
      blockers: rollout.blockers,
    },
    capabilities: provider ? { ...provider.capabilities } : null,
    provinces,
    cities,
    stats: {
      physicalProducts,
      missingWeightProducts,
      mappedProvinces,
      mappedCities,
      originMapped,
      lastLocationSyncAt: lastSync._max.syncedAt?.toISOString() ?? null,
    },
  };
}
