import { createHash } from "node:crypto";

import prisma from "@/lib/prisma";
import type { ShippingProvider } from "@/lib/shipping/providers";

const LOCATION_BATCH_SIZE = 100;

export function normalizeShippingLocationName(value: string) {
  return value
    .normalize("NFKC")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function locationCode(kind: "province" | "city", name: string, parentCode = "") {
  const canonical = `${kind}:${parentCode}:${normalizeShippingLocationName(name)}`;
  const digest = createHash("sha256").update(canonical).digest("hex").slice(0, 16);
  return `IR-${kind === "province" ? "P" : "C"}-${digest}`;
}

async function inBatches<T>(items: readonly T[], callback: (batch: readonly T[]) => Promise<void>) {
  for (let index = 0; index < items.length; index += LOCATION_BATCH_SIZE) {
    await callback(items.slice(index, index + LOCATION_BATCH_SIZE));
  }
}

export async function syncShippingLocations(provider: ShippingProvider, timeoutMs: number) {
  if (!provider.capabilities.locationSync) throw new Error("این سرویس امکان دریافت شهرها را اعلام نکرده است.");
  const tree = await provider.listLocations(timeoutMs);
  const externalIds = [...tree.provinces, ...tree.cities].map((item) => String(item.externalId));
  const existingMaps = await prisma.shippingProviderLocationMap.findMany({
    where: { providerKey: provider.key, externalId: { in: externalIds } },
    select: { externalId: true, locationCode: true },
  });
  const existingByExternalId = new Map(existingMaps.map((item) => [item.externalId, item.locationCode]));

  const provinces = tree.provinces.map((province) => ({
    kind: "PROVINCE" as const,
    code: existingByExternalId.get(String(province.externalId))
      ?? locationCode("province", province.name),
    name: normalizeShippingLocationName(province.name),
    externalId: String(province.externalId),
    externalParentId: String(province.externalParentId),
    parentCode: null,
  }));
  const provinceCodeByExternalId = new Map(provinces.map((item) => [item.externalId, item.code]));

  const cities = tree.cities.flatMap((city) => {
    const parentCode = provinceCodeByExternalId.get(String(city.externalParentId));
    if (!parentCode) return [];
    return [{
      kind: "CITY" as const,
      code: existingByExternalId.get(String(city.externalId))
        ?? locationCode("city", city.name, parentCode),
      name: normalizeShippingLocationName(city.name),
      externalId: String(city.externalId),
      externalParentId: String(city.externalParentId),
      parentCode,
    }];
  });

  const all = [...provinces, ...cities];
  await inBatches(all, async (batch) => {
    await prisma.$transaction(batch.flatMap((item) => [
      prisma.shippingLocation.upsert({
        where: { code: item.code },
        update: { name: item.name, parentCode: item.parentCode, kind: item.kind, isActive: true },
        create: { code: item.code, name: item.name, parentCode: item.parentCode, kind: item.kind },
      }),
      prisma.shippingProviderLocationMap.upsert({
        where: { providerKey_externalId: { providerKey: provider.key, externalId: item.externalId } },
        update: {
          locationCode: item.code,
          externalParentId: item.externalParentId,
          syncedAt: new Date(),
        },
        create: {
          locationCode: item.code,
          providerKey: provider.key,
          externalId: item.externalId,
          externalParentId: item.externalParentId,
        },
      }),
    ]));
  });

  return { provinces: provinces.length, cities: cities.length };
}

export async function getShippingProvinces(providerKey?: string) {
  return prisma.shippingLocation.findMany({
    where: {
      kind: "PROVINCE",
      isActive: true,
      ...(providerKey ? { providerMaps: { some: { providerKey } } } : {}),
    },
    select: { code: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getShippingCities(provinceCode: string, providerKey?: string) {
  return prisma.shippingLocation.findMany({
    where: {
      kind: "CITY",
      parentCode: provinceCode,
      isActive: true,
      ...(providerKey ? { providerMaps: { some: { providerKey } } } : {}),
    },
    select: { code: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function resolveShippingLocation(input: {
  provinceCode: string;
  cityCode: string;
  providerKey: string;
}) {
  const [province, city] = await Promise.all([
    prisma.shippingLocation.findFirst({
      where: { code: input.provinceCode, kind: "PROVINCE", isActive: true },
      select: {
        code: true,
        name: true,
        providerMaps: { where: { providerKey: input.providerKey }, select: { externalId: true } },
      },
    }),
    prisma.shippingLocation.findFirst({
      where: {
        code: input.cityCode,
        parentCode: input.provinceCode,
        kind: "CITY",
        isActive: true,
      },
      select: {
        code: true,
        name: true,
        providerMaps: { where: { providerKey: input.providerKey }, select: { externalId: true } },
      },
    }),
  ]);
  const provinceExternalId = Number(province?.providerMaps[0]?.externalId);
  const cityExternalId = Number(city?.providerMaps[0]?.externalId);
  if (!province || !city || !Number.isInteger(provinceExternalId) || !Number.isInteger(cityExternalId)) return null;
  return { province, city, provinceExternalId, cityExternalId };
}

export async function resolveShippingLocationNames(input: {
  provinceCode: string;
  cityCode: string;
}) {
  const [province, city] = await Promise.all([
    prisma.shippingLocation.findFirst({
      where: { code: input.provinceCode, kind: "PROVINCE", isActive: true },
      select: { code: true, name: true },
    }),
    prisma.shippingLocation.findFirst({
      where: {
        code: input.cityCode,
        parentCode: input.provinceCode,
        kind: "CITY",
        isActive: true,
      },
      select: { code: true, name: true },
    }),
  ]);

  return province && city ? { province, city } : null;
}
