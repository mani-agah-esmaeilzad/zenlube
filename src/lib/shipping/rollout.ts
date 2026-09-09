import { config } from "@/lib/config";
import { validateIranPhone } from "@/lib/phone";
import prisma from "@/lib/prisma";
import { resolveShippingLocation } from "@/lib/shipping/locations";
import { storefrontBuyablePhysicalProductWhere } from "@/lib/storefront-visibility";

export type ShippingRolloutMode = "legacy" | "dynamic";

export type ShippingRolloutBlocker = {
  code: string;
  message: string;
};

export type ShippingRolloutSettings = {
  enabled: boolean;
  providerKey: string;
  providerStoreId: string | null;
  providerProductTypeCode: string | null;
  originProvinceCode: string | null;
  originCityCode: string | null;
  originAddress: string | null;
  originPostalCode: string | null;
  senderName: string | null;
  senderMobile: string | null;
  enabledCarriers: readonly string[];
};

export type ShippingRolloutEnvironment = {
  providerMode: "amadast" | "mock" | "disabled";
  nodeEnv: string;
  clientCodeConfigured: boolean;
  providerIdentityConfigured: boolean;
};

export type ShippingRolloutStats = {
  missingWeightProducts: number;
  mappedProvinces: number;
  mappedCities: number;
  originMapped: boolean;
};

export type ShippingRolloutState = {
  mode: ShippingRolloutMode;
  setupReady: boolean;
  enabled: boolean;
  blockers: ShippingRolloutBlocker[];
  environment: ShippingRolloutEnvironment;
  stats: ShippingRolloutStats;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function isPositiveIntegerText(value: string | null | undefined) {
  return Boolean(value?.trim() && /^\d+$/.test(value.trim()) && Number(value) > 0);
}

const SUPPORTED_LIVE_CARRIERS = new Set(["POST", "TIPAX"]);

export function getShippingRolloutEnvironment(): ShippingRolloutEnvironment {
  return {
    providerMode: config.SHIPPING_PROVIDER,
    nodeEnv: config.NODE_ENV,
    clientCodeConfigured: Boolean(config.AMADAST_CLIENT_CODE?.trim()),
    providerIdentityConfigured: Boolean(
      config.AMADAST_ACCESS_TOKEN?.trim()
        || (
          config.AMADAST_USER_ID?.trim()
          && Number.isInteger(Number(config.AMADAST_USER_ID))
          && Number(config.AMADAST_USER_ID) > 0
        ),
    ),
  };
}

export function evaluateShippingRollout(input: {
  settings: ShippingRolloutSettings | null;
  environment: ShippingRolloutEnvironment;
  stats: ShippingRolloutStats;
}): ShippingRolloutState {
  const { settings, environment, stats } = input;
  const blockers: ShippingRolloutBlocker[] = [];

  if (environment.providerMode === "disabled") {
    blockers.push({
      code: "PROVIDER_DISABLED",
      message: "حالت سرویس ارسال در محیط اجرا هنوز روی disabled است.",
    });
  } else if (environment.providerMode === "mock" && environment.nodeEnv === "production") {
    blockers.push({
      code: "PRODUCTION_MOCK",
      message: "حالت آزمایشی mock در محیط اصلی مجاز نیست.",
    });
  } else if (environment.providerMode === "amadast") {
    if (!environment.clientCodeConfigured) {
      blockers.push({
        code: "CLIENT_CODE_MISSING",
        message: "AMADAST_CLIENT_CODE در تنظیمات امن سرور ثبت نشده است.",
      });
    }
    if (!environment.providerIdentityConfigured) {
      blockers.push({
        code: "PROVIDER_IDENTITY_MISSING",
        message: "AMADAST_USER_ID یا AMADAST_ACCESS_TOKEN در تنظیمات امن سرور ثبت نشده است.",
      });
    }
  }

  if (!settings) {
    blockers.push({
      code: "SETTINGS_MISSING",
      message: "تنظیمات ارسال هنوز یک بار در پنل مدیریت ذخیره نشده است.",
    });
  } else {
    if (settings.providerKey !== environment.providerMode && environment.providerMode !== "disabled") {
      blockers.push({
        code: "PROVIDER_MISMATCH",
        message: "سرویس ذخیره‌شده در پنل با سرویس محیط اجرا یکسان نیست.",
      });
    }
    if (!isPositiveIntegerText(settings.providerStoreId) || !isPositiveIntegerText(settings.providerProductTypeCode)) {
      blockers.push({
        code: "PROVIDER_FIELDS_MISSING",
        message: "شناسه فروشگاه و نوع محصول آمادست باید با عدد معتبر تکمیل شوند.",
      });
    }
    if (!hasText(settings.originProvinceCode) || !hasText(settings.originCityCode)) {
      blockers.push({
        code: "ORIGIN_LOCATION_MISSING",
        message: "استان و شهر مبدا ارسال کامل نشده است.",
      });
    }
    if (!hasText(settings.originAddress) || !/^\d{10}$/.test(settings.originPostalCode?.trim() ?? "")) {
      blockers.push({
        code: "ORIGIN_ADDRESS_MISSING",
        message: "آدرس و کد پستی ۱۰ رقمی مبدا کامل نشده است.",
      });
    }
    if (!hasText(settings.senderName) || !settings.senderMobile || !validateIranPhone(settings.senderMobile)) {
      blockers.push({
        code: "SENDER_MISSING",
        message: "نام و شماره موبایل معتبر فرستنده کامل نشده است.",
      });
    }
    if (
      settings.enabledCarriers.length === 0
      || settings.enabledCarriers.some((carrier) => !SUPPORTED_LIVE_CARRIERS.has(carrier))
    ) {
      blockers.push({
        code: "CARRIERS_MISSING",
        message: "حداقل یکی از شرکت‌های حمل پست یا تیپاکس باید انتخاب شود.",
      });
    }
    if (
      hasText(settings.originProvinceCode)
      && hasText(settings.originCityCode)
      && !stats.originMapped
    ) {
      blockers.push({
        code: "ORIGIN_MAPPING_MISSING",
        message: "شهر مبدا در سرویس ارسال نگاشت نشده است؛ شهرها را دوباره همگام کنید.",
      });
    }
  }

  if (stats.missingWeightProducts > 0) {
    blockers.push({
      code: "PRODUCT_WEIGHTS_MISSING",
      message: `وزن ${stats.missingWeightProducts.toLocaleString("fa-IR")} محصول موجود و قابل خرید هنوز ثبت نشده است.`,
    });
  }
  if (stats.mappedProvinces === 0 || stats.mappedCities === 0) {
    blockers.push({
      code: "LOCATIONS_MISSING",
      message: "فهرست استان‌ها و شهرهای سرویس هنوز همگام نشده است.",
    });
  }

  const setupReady = blockers.length === 0;
  const enabled = Boolean(settings?.enabled);
  return {
    mode: enabled && setupReady ? "dynamic" : "legacy",
    setupReady,
    enabled,
    blockers,
    environment,
    stats,
  };
}

export async function getShippingRolloutState(
  settingsOverride?: ShippingRolloutSettings | null,
): Promise<ShippingRolloutState> {
  const settings = settingsOverride === undefined
    ? await prisma.shippingSettings.findUnique({ where: { id: "default" } })
    : settingsOverride;
  const environment = getShippingRolloutEnvironment();
  const providerKey = environment.providerMode === "disabled"
    ? settings?.providerKey ?? "amadast"
    : environment.providerMode;
  const originMappingPromise = environment.providerMode !== "disabled"
    && settings?.originProvinceCode
    && settings.originCityCode
    ? resolveShippingLocation({
        provinceCode: settings.originProvinceCode,
        cityCode: settings.originCityCode,
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
    originMappingPromise,
  ]);
  const state = evaluateShippingRollout({
    settings,
    environment,
    stats: {
      missingWeightProducts,
      mappedProvinces,
      mappedCities,
      originMapped: Boolean(originMapping),
    },
  });
  return state;
}
