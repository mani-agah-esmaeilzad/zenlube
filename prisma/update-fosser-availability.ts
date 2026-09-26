import { Prisma, PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const FOSSER_PRODUCTS = [
  {
    slug: "fosser-premium-gm-0w20-4l",
    viscosity: "0W-20",
    packagingSizeLit: 4,
    priceRial: 140_000_000,
    minimumStock: 1,
    compatibleCarSlugs: [] as string[],
  },
  {
    slug: "fosser-drive-ts-10w40-4l",
    viscosity: "10W-40",
    packagingSizeLit: 4,
    priceRial: 89_500_000,
    minimumStock: 1,
    compatibleCarSlugs: ["hyundai-29-jac-kmc-t8-2-0t-6mt"],
  },
] as const;

const compatibilityNotes: Record<string, string> = {
  "hyundai-29-jac-kmc-t8-2-0t-6mt":
    "سازگار با دفترچه KMC T8: گرانروی 10W-40 برای دمای ‎-20 تا 40°C و سطح API SM یا بالاتر؛ محصول فوسر دارای API SN و ACEA A3/B4 است.",
};

async function main() {
  const productSlugs = FOSSER_PRODUCTS.map((product) => product.slug);
  const carSlugs = [
    ...new Set(
      FOSSER_PRODUCTS.flatMap((product) => product.compatibleCarSlugs),
    ),
  ];

  const [products, cars] = await Promise.all([
    prisma.product.findMany({
      where: { slug: { in: productSlugs } },
      select: {
        id: true,
        slug: true,
        name: true,
        stock: true,
        viscosity: true,
        packagingSizeLit: true,
        approvals: true,
      },
    }),
    prisma.car.findMany({
      where: { slug: { in: carSlugs } },
      select: {
        id: true,
        slug: true,
        model: true,
        isActive: true,
        viscosity: true,
        specification: true,
      },
    }),
  ]);

  const productsBySlug = new Map(
    products.map((product) => [product.slug, product]),
  );
  const carsBySlug = new Map(cars.map((car) => [car.slug, car]));

  for (const requestedProduct of FOSSER_PRODUCTS) {
    const product = productsBySlug.get(requestedProduct.slug);
    if (!product)
      throw new Error(
        `Required Fosser product was not found: ${requestedProduct.slug}`,
      );
    if (product.viscosity !== requestedProduct.viscosity) {
      throw new Error(
        `Unexpected viscosity for ${requestedProduct.slug}: ${product.viscosity}`,
      );
    }
    if (
      product.packagingSizeLit?.toNumber() !== requestedProduct.packagingSizeLit
    ) {
      throw new Error(
        `Unexpected package size for ${requestedProduct.slug}: ${product.packagingSizeLit}`,
      );
    }
  }

  for (const carSlug of carSlugs) {
    const car = carsBySlug.get(carSlug);
    if (!car)
      throw new Error(`Required compatible car was not found: ${carSlug}`);
    if (!car.isActive)
      throw new Error(`Compatible car is inactive: ${carSlug}`);
  }

  await prisma.$transaction(async (tx) => {
    for (const requestedProduct of FOSSER_PRODUCTS) {
      const product = productsBySlug.get(requestedProduct.slug)!;
      await tx.product.update({
        where: { id: product.id },
        data: {
          price: new Prisma.Decimal(requestedProduct.priceRial),
          stock: Math.max(product.stock, requestedProduct.minimumStock),
        },
      });

      for (const carSlug of requestedProduct.compatibleCarSlugs) {
        const car = carsBySlug.get(carSlug)!;
        await tx.productCar.upsert({
          where: { productId_carId: { productId: product.id, carId: car.id } },
          update: { note: compatibilityNotes[carSlug] },
          create: {
            productId: product.id,
            carId: car.id,
            note: compatibilityNotes[carSlug],
          },
        });

        const engineOilTask = await tx.carMaintenanceTask.findFirst({
          where: { carId: car.id, title: "تعویض روغن موتور و فیلتر روغن" },
          select: { id: true, recommendedProductSlugs: true },
        });
        if (!engineOilTask)
          throw new Error(
            `Engine-oil maintenance task was not found for ${carSlug}`,
          );
        if (
          !engineOilTask.recommendedProductSlugs.includes(requestedProduct.slug)
        ) {
          await tx.carMaintenanceTask.update({
            where: { id: engineOilTask.id },
            data: {
              recommendedProductSlugs: [
                ...engineOilTask.recommendedProductSlugs,
                requestedProduct.slug,
              ],
            },
          });
        }
      }
    }
  });

  const updatedProducts = await prisma.product.findMany({
    where: { slug: { in: productSlugs } },
    select: {
      slug: true,
      name: true,
      price: true,
      stock: true,
      carMappings: { select: { car: { select: { slug: true, model: true } } } },
    },
    orderBy: { slug: "asc" },
  });

  for (const product of updatedProducts) {
    const mappedCars =
      product.carMappings.map((mapping) => mapping.car.model).join("، ") ||
      "بدون تطبیق تأییدشده";
    console.log(
      `${product.slug}: ${product.price.toFixed(0)} ریال، موجودی ${product.stock}، خودروها: ${mappedCars}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
