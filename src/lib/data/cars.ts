import prisma from "../prisma";
import { applyCarManualOverrides } from "../car-manual-overrides";
import { createPageInfo } from "../pagination";
import { storefrontVisibleCarWhere, storefrontVisibleProductWhere } from "../storefront-visibility";
import { createEmptyPageResult, withStorefrontDataFallback } from "./storefront-fallback";

type StorefrontCarItem = Awaited<ReturnType<typeof getCarsWithProducts>>[number];

export async function getPopularCars(limit = 6) {
  return withStorefrontDataFallback("getPopularCars", [], async () => {
    const cars = await prisma.car.findMany({
      where: storefrontVisibleCarWhere(),
      include: {
        productMappings: {
          where: { product: { is: storefrontVisibleProductWhere() } },
          include: {
            product: {
              include: {
                brand: true,
                promotion: true,
              },
            },
          },
        },
      },
      orderBy: [
        { productMappings: { _count: "desc" } },
        { updatedAt: "desc" },
      ],
      take: limit,
    });

    return cars.map(applyCarManualOverrides);
  });
}

export async function getCarsWithProducts() {
  return withStorefrontDataFallback("getCarsWithProducts", [], async () => {
    const cars = await prisma.car.findMany({
      where: storefrontVisibleCarWhere(),
      include: {
        productMappings: {
          where: { product: { is: storefrontVisibleProductWhere() } },
          include: {
            product: {
              include: {
                brand: true,
                promotion: true,
              },
            },
          },
        },
        maintenanceTasks: {
          orderBy: [
            { priority: "asc" },
            { updatedAt: "desc" },
          ],
        },
      },
      orderBy: [
        { manufacturer: "asc" },
        { model: "asc" },
        { generation: "asc" },
      ],
    });

    return cars.map(applyCarManualOverrides);
  });
}

export async function getPaginatedCarsWithProducts({
  search,
  manufacturer,
  model,
  page = 1,
  pageSize = 12,
}: {
  search?: string;
  manufacturer?: string;
  model?: string;
  page?: number;
  pageSize?: number;
}) {
  return withStorefrontDataFallback(
    "getPaginatedCarsWithProducts",
    createEmptyPageResult<StorefrontCarItem>(page, pageSize),
    async () => {
    const where = storefrontVisibleCarWhere({
      ...(manufacturer ? { manufacturer } : {}),
      ...(model ? { model } : {}),
      ...(search
        ? {
            OR: [
              { manufacturer: { contains: search, mode: "insensitive" as const } },
              { model: { contains: search, mode: "insensitive" as const } },
              { generation: { contains: search, mode: "insensitive" as const } },
              { engineCode: { contains: search, mode: "insensitive" as const } },
              { engineType: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    });

    const skip = (page - 1) * pageSize;
    const [items, total] = await prisma.$transaction([
      prisma.car.findMany({
        where,
        include: {
          productMappings: {
            where: { product: { is: storefrontVisibleProductWhere() } },
            include: {
              product: {
                include: {
                  brand: true,
                  promotion: true,
                },
              },
            },
          },
          maintenanceTasks: {
            orderBy: [
              { priority: "asc" },
              { updatedAt: "desc" },
            ],
          },
        },
        orderBy: [
          { manufacturer: "asc" },
          { model: "asc" },
          { generation: "asc" },
        ],
        skip,
        take: pageSize,
      }),
      prisma.car.count({ where }),
    ]);

    return {
      items: items.map(applyCarManualOverrides),
      pageInfo: createPageInfo(page, pageSize, total),
    };
    },
  );
}

export type CarHierarchy = {
  brand: string;
  models: {
    model: string;
    options: {
      slug: string;
      label: string;
    }[];
  }[];
};

export async function getCarHierarchy(): Promise<CarHierarchy[]> {
  return withStorefrontDataFallback("getCarHierarchy", [], async () => {
    const cars = await prisma.car.findMany({
      where: storefrontVisibleCarWhere(),
      select: {
        slug: true,
        manufacturer: true,
        model: true,
        generation: true,
        engineCode: true,
        yearFrom: true,
        yearTo: true,
      },
      orderBy: [
        { manufacturer: "asc" },
        { model: "asc" },
        { generation: "asc" },
        { engineCode: "asc" },
        { yearFrom: "asc" },
        { yearTo: "asc" },
      ],
    });

    const brandMap = new Map<string, Map<string, { slug: string; label: string }[]>>();

    cars.forEach((car) => {
      if (!brandMap.has(car.manufacturer)) {
        brandMap.set(car.manufacturer, new Map());
      }
      const modelMap = brandMap.get(car.manufacturer)!;
      if (!modelMap.has(car.model)) {
        modelMap.set(car.model, []);
      }

      const details = [
        car.generation?.trim() || null,
        car.engineCode ? `کد موتور ${car.engineCode}` : null,
        car.yearFrom || car.yearTo ? `سال ${car.yearFrom ?? "?"} تا ${car.yearTo ?? "?"}` : null,
      ]
        .filter(Boolean)
        .join(" • ");

      modelMap.get(car.model)!.push({
        slug: car.slug,
        label: details.length > 0 ? details : "تمامی نسخه‌ها",
      });
    });

    const collator = new Intl.Collator("fa", { sensitivity: "base" });

    return Array.from(brandMap.entries())
      .map(([brand, modelMap]) => ({
        brand,
        models: Array.from(modelMap.entries())
          .map(([model, options]) => ({
            model,
            options: options.sort((a, b) => collator.compare(a.label, b.label)),
          }))
          .sort((a, b) => collator.compare(a.model, b.model)),
      }))
      .sort((a, b) => collator.compare(a.brand, b.brand));
  });
}

export async function getCarBySlug(slug: string) {
  return withStorefrontDataFallback("getCarBySlug", null, async () => {
    const car = await prisma.car.findFirst({
      where: storefrontVisibleCarWhere({ slug }),
      include: {
        productMappings: {
          where: { product: { is: storefrontVisibleProductWhere() } },
          include: {
            product: {
              include: {
                brand: true,
                category: true,
                promotion: true,
                carMappings: {
                  include: { car: true },
                },
              },
            },
          },
        },
        maintenanceTasks: {
          orderBy: [
            { priority: "asc" },
            { updatedAt: "desc" },
          ],
        },
        questions: {
          where: {
            status: {
              not: "ARCHIVED",
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return car ? applyCarManualOverrides(car) : null;
  });
}

export async function getSiblingCars(manufacturer: string, currentSlug: string, limit = 4) {
  return withStorefrontDataFallback("getSiblingCars", [], async () => {
    const cars = await prisma.car.findMany({
      where: storefrontVisibleCarWhere({
        manufacturer,
        slug: { not: currentSlug },
      }),
      orderBy: [{ model: "asc" }, { yearFrom: "desc" }],
      take: limit,
    });

    return cars.map(applyCarManualOverrides);
  });
}
