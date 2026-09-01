import { Prisma, PrismaClient } from "../src/generated/prisma";
import { aidlubeManagedMgCarSlugs } from "./product-data/aidlube-engine-oils";
import {
  catalogBrandDefinitions,
  catalogProducts,
} from "./product-data/catalog-products";

const prisma = new PrismaClient();
const isDryRun = process.argv.includes("--dry-run");

const categoryDefinitions = {
  "engine-oil": {
    name: "روغن موتور",
    description: "روغن موتور بر اساس گرانروی، سطح کیفی و استاندارد سازنده خودرو",
  },
  "gear-oil": {
    name: "روغن گیربکس",
    description: "روغن گیربکس دستی، اتوماتیک، CVT و DCT با تفکیک استاندارد فنی",
  },
  "brake-oil": {
    name: "روغن ترمز",
    description: "مایع ترمز هیدرولیک با سطح DOT و استانداردهای معتبر",
  },
  accessories: {
    name: "لوازم جانبی و مکمل",
    description: "ضدیخ، کولانت، مکمل سوخت، شوینده و محصولات نگهداری خودرو",
  },
} as const;

function assertCatalog() {
  if (catalogProducts.length !== 122) {
    throw new Error(`Expected exactly 122 catalog products, received ${catalogProducts.length}.`);
  }

  const slugs = new Set(catalogProducts.map((product) => product.slug));
  const skus = new Set(catalogProducts.map((product) => product.sku));
  if (slugs.size !== catalogProducts.length) throw new Error("Catalog slugs must be unique.");
  if (skus.size !== catalogProducts.length) throw new Error("Catalog SKUs must be unique.");

  const managedCars = new Set<string>(aidlubeManagedMgCarSlugs);
  for (const product of catalogProducts) {
    if (!product.imageUrl.startsWith("/products/")) {
      throw new Error(`${product.slug} must use a repository-owned image.`);
    }
    if (!product.productSourceUrl.startsWith("http")) {
      throw new Error(`${product.slug} must have a traceable product source.`);
    }
    if (product.description.length < 100) {
      throw new Error(`${product.slug} needs a complete Persian description.`);
    }
    if (product.packagingSizeLit !== undefined && product.packagingSizeLit <= 0) {
      throw new Error(`${product.slug} has an invalid package size.`);
    }
    const mappingSlugs = product.carMappings.map((mapping) => mapping.carSlug);
    if (new Set(mappingSlugs).size !== mappingSlugs.length) {
      throw new Error(`${product.slug} has duplicate MG mappings.`);
    }
    for (const carSlug of mappingSlugs) {
      if (!managedCars.has(carSlug)) throw new Error(`${product.slug} maps unmanaged car ${carSlug}.`);
      if (carSlug === "hyundai-1106-mg4-ev") {
        throw new Error(`${product.slug} must never map to electric MG4 EV.`);
      }
    }
  }
}

async function upsertTaxonomy() {
  const categoryEntries = Object.entries(categoryDefinitions);
  const categories = await Promise.all(
    categoryEntries.map(([slug, definition]) =>
      prisma.category.upsert({
        where: { slug },
        update: { description: definition.description },
        create: { slug, ...definition },
      }),
    ),
  );

  const descriptions: Record<string, string> = {
    bareliz: "روانکار و محصولات نگهداری خودرو بارلیز",
    aidlube: "روانکار ایدلوب با فناوری و کاتالوگ فنی آلمان",
    aisin: "روانکار و سیالات انتقال قدرت آیسین ژاپن",
    fosser: "روانکار فوسر آلمان برای موتور و انتقال قدرت",
    zic: "روانکار ZIC از SK Enmove کره جنوبی",
    xado: "روانکار، احیاگر و مکمل‌های تخصصی XADO",
    caspian: "محصولات نگهداری و روانکار خودرویی کاسپین",
    woofer: "سوخت و افزودنی پرفورمنس ووفر",
    "persia-sign": "مکمل سوخت Persia Sign عرضه‌شده توسط پرشیا خودرو",
  };

  const brandRows = await Promise.all(
    catalogBrandDefinitions.map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {
          description: descriptions[brand.slug],
          website: brand.website,
        },
        create: {
          ...brand,
          description: descriptions[brand.slug],
        },
      }),
    ),
  );

  return {
    categoriesBySlug: new Map(categories.map((category) => [category.slug, category])),
    brandsBySlug: new Map(brandRows.map((brand) => [brand.slug, brand])),
  };
}

async function main() {
  assertCatalog();

  const requestedCarSlugs = [
    ...new Set(catalogProducts.flatMap((product) => product.carMappings.map((mapping) => mapping.carSlug))),
  ];
  const cars = await prisma.car.findMany({
    where: { slug: { in: requestedCarSlugs } },
    select: { id: true, slug: true, manufacturer: true, model: true, isActive: true },
  });
  const carsBySlug = new Map(cars.map((car) => [car.slug, car]));

  for (const carSlug of requestedCarSlugs) {
    const car = carsBySlug.get(carSlug);
    if (!car) throw new Error(`Required MG car was not found: ${carSlug}.`);
    if (car.manufacturer.trim() !== "ام جی") {
      throw new Error(`Car ${carSlug} is not an MG record (${car.manufacturer}).`);
    }
    if (!car.isActive) throw new Error(`Required MG car is inactive: ${carSlug}.`);
  }

  const existingProducts = await prisma.product.findMany({
    where: { slug: { in: catalogProducts.map((product) => product.slug) } },
    select: { slug: true },
  });
  const existingSlugs = new Set(existingProducts.map((product) => product.slug));

  if (isDryRun) {
    const creates = catalogProducts.filter((product) => !existingSlugs.has(product.slug)).length;
    const updates = catalogProducts.length - creates;
    console.log(`Catalog dry run: ${creates} CREATE, ${updates} UPDATE, ${requestedCarSlugs.length} verified MG cars.`);
    console.log("Prices, stock, featured and bestseller fields remain untouched for existing products.");
    return;
  }

  const { categoriesBySlug, brandsBySlug } = await upsertTaxonomy();
  const managedCars = await prisma.car.findMany({
    where: { slug: { in: [...aidlubeManagedMgCarSlugs] } },
    select: { id: true },
  });
  const managedCarIds = managedCars.map((car) => car.id);

  for (const product of catalogProducts) {
    const category = categoriesBySlug.get(product.categorySlug);
    const brand = brandsBySlug.get(product.brandSlug);
    if (!category || !brand) throw new Error(`Missing taxonomy for ${product.slug}.`);

    await prisma.$transaction(async (tx) => {
      const metadata = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        viscosity: product.viscosity ?? null,
        oilType: product.oilType ?? null,
        imageUrl: product.imageUrl,
        categoryId: category.id,
        brandId: brand.id,
        originCountry: product.originCountry ?? null,
        approvals: product.approvals ?? null,
        temperatureRange: product.temperatureRange ?? null,
        packagingSizeLit:
          product.packagingSizeLit === undefined ? null : new Prisma.Decimal(product.packagingSizeLit),
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
          isFeatured: false,
          isBestseller: false,
        },
      });

      if (managedCarIds.length) {
        await tx.productCar.deleteMany({
          where: { productId: savedProduct.id, carId: { in: managedCarIds } },
        });
      }
      if (product.carMappings.length) {
        await tx.productCar.createMany({
          data: product.carMappings.map((mapping) => ({
            productId: savedProduct.id,
            carId: carsBySlug.get(mapping.carSlug)!.id,
            note: `${mapping.note}\nمنبع: ${mapping.sourceTitle} — ${mapping.sourceUrl}`,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  console.log(`Seeded ${catalogProducts.length} catalog products with verified MG mappings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
