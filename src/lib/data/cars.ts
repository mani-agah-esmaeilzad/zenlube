import prisma from "../prisma";

export async function getPopularCars(limit = 6) {
  return prisma.car.findMany({
    include: {
      productMappings: {
        include: {
          product: {
            include: {
              brand: true,
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
}

export async function getCarsWithProducts() {
  return prisma.car.findMany({
    include: {
      productMappings: {
        include: {
          product: {
            include: {
              brand: true,
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
  const cars = await prisma.car.findMany({
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
}

export async function getCarBySlug(slug: string) {
  return prisma.car.findUnique({
    where: { slug },
    include: {
      productMappings: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
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
}

export async function getSiblingCars(manufacturer: string, currentSlug: string, limit = 4) {
  return prisma.car.findMany({
    where: {
      manufacturer,
      slug: { not: currentSlug },
    },
    orderBy: [{ model: "asc" }, { yearFrom: "desc" }],
    take: limit,
  });
}
