import { Prisma, PrismaClient } from "../src/generated/prisma";
import {
  aidlubeEngineOils,
  aidlubeManagedMgCarSlugs,
} from "./product-data/aidlube-engine-oils";

const prisma = new PrismaClient();
const isDryRun = process.argv.includes("--dry-run");

function assertSeedData() {
  if (aidlubeEngineOils.length !== 6) {
    throw new Error(`Expected exactly 6 AIDLUBE products, received ${aidlubeEngineOils.length}.`);
  }

  const slugs = new Set(aidlubeEngineOils.map((product) => product.slug));
  const skus = new Set(aidlubeEngineOils.map((product) => product.sku));
  if (slugs.size !== aidlubeEngineOils.length) {
    throw new Error("AIDLUBE product slugs must be unique.");
  }
  if (skus.size !== aidlubeEngineOils.length) {
    throw new Error("AIDLUBE product SKUs must be unique.");
  }

  const managedCars = new Set<string>(aidlubeManagedMgCarSlugs);
  for (const product of aidlubeEngineOils) {
    if (!product.imageUrl.startsWith("/products/aidlube/")) {
      throw new Error(`Product ${product.slug} must use a repository-owned AIDLUBE image.`);
    }
    if (product.packagingSizeLit <= 0) {
      throw new Error(`Product ${product.slug} has an invalid package size.`);
    }

    const mappingSlugs = product.carMappings.map((mapping) => mapping.carSlug);
    if (new Set(mappingSlugs).size !== mappingSlugs.length) {
      throw new Error(`Product ${product.slug} has duplicate MG mappings.`);
    }
    for (const carSlug of mappingSlugs) {
      if (!managedCars.has(carSlug)) {
        throw new Error(`Product ${product.slug} references unmanaged car ${carSlug}.`);
      }
      if (carSlug === "hyundai-1106-mg4-ev") {
        throw new Error(`Product ${product.slug} must never map to the electric MG4 EV.`);
      }
    }
  }
}

async function main() {
  assertSeedData();

  const [brand, category] = await Promise.all([
    prisma.brand.findUnique({ where: { slug: "aidlube" } }),
    prisma.category.findUnique({ where: { slug: "engine-oil" } }),
  ]);

  if (!brand) {
    throw new Error('Brand with slug "aidlube" was not found.');
  }
  if (!category) {
    throw new Error('Category with slug "engine-oil" was not found.');
  }

  const requestedCarSlugs = [
    ...new Set(aidlubeEngineOils.flatMap((product) => product.carMappings.map((mapping) => mapping.carSlug))),
  ];
  const cars = requestedCarSlugs.length
    ? await prisma.car.findMany({
        where: { slug: { in: requestedCarSlugs } },
        select: { id: true, slug: true, manufacturer: true, model: true, isActive: true },
      })
    : [];
  const carsBySlug = new Map(cars.map((car) => [car.slug, car]));

  for (const carSlug of requestedCarSlugs) {
    const car = carsBySlug.get(carSlug);
    if (!car) {
      throw new Error(`Required MG car was not found: ${carSlug}.`);
    }
    if (car.manufacturer.trim() !== "ام جی") {
      throw new Error(`Car ${carSlug} is not an MG record (${car.manufacturer}).`);
    }
    if (!car.isActive) {
      throw new Error(`Required MG car is inactive: ${carSlug}.`);
    }
  }

  const existingProducts = await prisma.product.findMany({
    where: { slug: { in: aidlubeEngineOils.map((product) => product.slug) } },
    select: { slug: true },
  });
  const existingSlugs = new Set(existingProducts.map((product) => product.slug));

  if (isDryRun) {
    for (const product of aidlubeEngineOils) {
      console.log(
        `${existingSlugs.has(product.slug) ? "UPDATE" : "CREATE"} ${product.slug} (${product.carMappings.length} MG mappings)`,
      );
    }
    console.log("Dry run complete. Prices, stock and admin merchandising fields will be preserved on updates.");
    return;
  }

  const managedCars = await prisma.car.findMany({
    where: { slug: { in: [...aidlubeManagedMgCarSlugs] } },
    select: { id: true },
  });
  const managedCarIds = managedCars.map((car) => car.id);

  for (const product of aidlubeEngineOils) {
    await prisma.$transaction(async (tx) => {
      const metadata = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        viscosity: product.viscosity,
        oilType: product.oilType,
        imageUrl: product.imageUrl,
        categoryId: category.id,
        brandId: brand.id,
        originCountry: product.originCountry,
        approvals: product.approvals,
        packagingSizeLit: new Prisma.Decimal(product.packagingSizeLit),
        technicalSpecs: product.technicalSpecs,
        tags: product.tags,
        videos: [],
      } satisfies Prisma.ProductUncheckedUpdateInput;

      const savedProduct = await tx.product.upsert({
        where: { slug: product.slug },
        update: metadata,
        create: {
          ...metadata,
          slug: product.slug,
          price: new Prisma.Decimal(0),
          stock: 0,
          isFeatured: true,
          isBestseller: false,
        },
      });

      if (managedCarIds.length > 0) {
        await tx.productCar.deleteMany({
          where: {
            productId: savedProduct.id,
            carId: { in: managedCarIds },
          },
        });
      }

      if (product.carMappings.length > 0) {
        await tx.productCar.createMany({
          data: product.carMappings.map((mapping) => ({
            productId: savedProduct.id,
            carId: carsBySlug.get(mapping.carSlug)!.id,
            note: mapping.note,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  console.log(`Seeded ${aidlubeEngineOils.length} AIDLUBE products with verified MG manual mappings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
