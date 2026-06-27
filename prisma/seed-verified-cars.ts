import { PrismaClient } from "../src/generated/prisma";
import { verifiedCars, type VerifiedCarSeed } from "./vehicle-data/verified-cars";

const prisma = new PrismaClient();

const requiredTextFields: (keyof VerifiedCarSeed)[] = [
  "slug",
  "manufacturer",
  "model",
  "generation",
  "imageUrl",
  "engineType",
  "engineCode",
  "viscosity",
  "specification",
  "overviewDetails",
  "engineDetails",
  "gearboxDetails",
  "maintenanceInfo",
];

function assertCompleteCar(car: VerifiedCarSeed) {
  for (const field of requiredTextFields) {
    const value = car[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Vehicle seed "${car.slug || car.manufacturer}" is missing ${String(field)}.`);
    }
  }

  if (!Number.isFinite(car.oilCapacityLit) || car.oilCapacityLit <= 0) {
    throw new Error(`Vehicle seed "${car.slug}" has invalid oilCapacityLit.`);
  }

  if (!Number.isInteger(car.yearFrom) || !Number.isInteger(car.yearTo) || car.yearFrom > car.yearTo) {
    throw new Error(`Vehicle seed "${car.slug}" has invalid production years.`);
  }

  for (const [name, value] of Object.entries(car.sources)) {
    if (!value || !URL.canParse(value)) {
      throw new Error(`Vehicle seed "${car.slug}" has invalid source URL: ${name}.`);
    }
  }
}

function withSources(text: string, car: VerifiedCarSeed) {
  return `${text.trim()}\n\nمنابع: باما (${car.sources.bamaModelUrl})، مشخصات فنی (${car.sources.technicalSpecUrl})، مشخصات روغن (${car.sources.oilSpecUrl})`;
}

async function main() {
  if (verifiedCars.length === 0) {
    throw new Error("No verified car records found. Fill prisma/vehicle-data/verified-cars.ts before running this production seed.");
  }

  const slugs = new Set<string>();

  for (const car of verifiedCars) {
    assertCompleteCar(car);

    if (slugs.has(car.slug)) {
      throw new Error(`Duplicate vehicle slug in seed: ${car.slug}`);
    }
    slugs.add(car.slug);

    await prisma.car.upsert({
      where: { slug: car.slug },
      update: {
        manufacturer: car.manufacturer,
        model: car.model,
        generation: car.generation,
        imageUrl: car.imageUrl,
        engineType: car.engineType,
        engineCode: car.engineCode,
        viscosity: car.viscosity,
        oilCapacityLit: car.oilCapacityLit,
        specification: car.specification,
        yearFrom: car.yearFrom,
        yearTo: car.yearTo,
        overviewDetails: withSources(car.overviewDetails, car),
        engineDetails: withSources(car.engineDetails, car),
        gearboxDetails: withSources(car.gearboxDetails, car),
        maintenanceInfo: withSources(car.maintenanceInfo, car),
      },
      create: {
        slug: car.slug,
        manufacturer: car.manufacturer,
        model: car.model,
        generation: car.generation,
        imageUrl: car.imageUrl,
        engineType: car.engineType,
        engineCode: car.engineCode,
        viscosity: car.viscosity,
        oilCapacityLit: car.oilCapacityLit,
        specification: car.specification,
        yearFrom: car.yearFrom,
        yearTo: car.yearTo,
        overviewDetails: withSources(car.overviewDetails, car),
        engineDetails: withSources(car.engineDetails, car),
        gearboxDetails: withSources(car.gearboxDetails, car),
        maintenanceInfo: withSources(car.maintenanceInfo, car),
      },
    });
  }

  console.log(`Seeded ${verifiedCars.length} verified Oilbar vehicle records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
