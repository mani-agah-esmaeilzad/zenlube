import { createHash, randomUUID } from "node:crypto";

import prisma from "@/lib/prisma";
import type { ShippingProvider } from "@/lib/shipping/providers";
import type { ProviderLocationTree } from "@/lib/shipping/types";

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

export function validateShippingLocationSnapshot(tree: ProviderLocationTree) {
  if (!tree.provinces.length || !tree.cities.length) {
    throw new Error("فهرست استان‌ها و شهرهای دریافتی کامل نیست؛ اطلاعات قبلی حفظ شد.");
  }
  const ids = new Set<number>();
  for (const item of [...tree.provinces, ...tree.cities]) {
    if (!Number.isSafeInteger(item.externalId) || item.externalId <= 0
      || ids.has(item.externalId) || !normalizeShippingLocationName(item.name)) {
      throw new Error("شناسه یا نام تکراری و نامعتبر در فهرست شهرها دریافت شد.");
    }
    ids.add(item.externalId);
  }
  const provinceIds = new Set(tree.provinces.map((item) => item.externalId));
  const parentsWithCities = new Set(tree.cities.map((item) => item.externalParentId));
  if (tree.provinces.some((item) => item.externalParentId !== 0 || !parentsWithCities.has(item.externalId))
    || tree.cities.some((item) => !provinceIds.has(item.externalParentId))) {
    throw new Error("ارتباط استان‌ها و شهرهای دریافتی کامل نیست؛ اطلاعات قبلی حفظ شد.");
  }
}

export async function syncShippingLocations(provider: ShippingProvider, timeoutMs: number) {
  if (!provider.capabilities.locationSync) throw new Error("این سرویس امکان دریافت شهرها را اعلام نکرده است.");
  // Finish all provider requests before opening a database transaction. A failed
  // province request must never publish a partly refreshed location directory.
  const tree = await provider.listLocations(timeoutMs);
  validateShippingLocationSnapshot(tree);

  return prisma.$transaction(async (tx) => {
    // Serialise snapshot writers, including those for other providers sharing
    // canonical location codes. Both the lock and transaction have short bounds.
    await tx.$executeRaw`SET LOCAL lock_timeout = '2s'`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('shipping-location-snapshot'))`;
    const existingMaps = await tx.shippingProviderLocationMap.findMany({
      where: { providerKey: provider.key },
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

    const cities = tree.cities.map((city) => {
      const parentCode = provinceCodeByExternalId.get(String(city.externalParentId))!;
      return {
        kind: "CITY" as const,
        code: existingByExternalId.get(String(city.externalId))
          ?? locationCode("city", city.name, parentCode),
        name: normalizeShippingLocationName(city.name),
        externalId: String(city.externalId),
        externalParentId: String(city.externalParentId),
        parentCode,
      };
    });

    const all = [...provinces, ...cities];
    if (new Set(all.map((item) => item.code)).size !== all.length) {
      throw new Error("مکان‌های تکراری در فهرست دریافتی وجود دارد؛ اطلاعات قبلی حفظ شد.");
    }

    // One bulk statement avoids thousands of database round trips on serverless.
    const rows = JSON.stringify(all.map((item) => ({ ...item, id: randomUUID() })));
    await tx.$executeRaw`
      INSERT INTO "ShippingLocation" ("id", "code", "kind", "name", "parentCode", "isActive", "createdAt", "updatedAt")
      SELECT "id", "code", "kind"::"ShippingLocationKind", "name", "parentCode", true, NOW(), NOW()
      FROM jsonb_to_recordset(${rows}::jsonb)
        AS snapshot("id" text, "code" text, "kind" text, "name" text, "parentCode" text)
      ON CONFLICT ("code") DO UPDATE SET
        "kind" = EXCLUDED."kind", "name" = EXCLUDED."name", "parentCode" = EXCLUDED."parentCode",
        "isActive" = true, "updatedAt" = NOW()
    `;
    // Replace only this provider's mappings. Old codes remain available for order
    // history, but cannot be selected unless another provider still serves them.
    await tx.shippingProviderLocationMap.deleteMany({ where: { providerKey: provider.key } });
    await tx.shippingProviderLocationMap.createMany({
      data: all.map((item) => ({
        providerKey: provider.key,
        locationCode: item.code,
        externalId: item.externalId,
        externalParentId: item.externalParentId,
      })),
    });
    await tx.shippingLocation.updateMany({
      where: {
        code: { in: existingMaps.map((item) => item.locationCode) },
        providerMaps: { none: {} },
      },
      data: { isActive: false },
    });

    return { provinces: provinces.length, cities: cities.length };
  }, { maxWait: 2_000, timeout: 8_000 });
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
