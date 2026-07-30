import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma";
import {
  harvestMycarlubsBrandCars,
  loadLocalEnv,
} from "./lib/mycarlubs";

type CliOptions = {
  brandId: number;
  manufacturer?: string;
  limit?: number;
  titleIncludes?: string[];
  titleExcludes?: string[];
  replace: boolean;
  dryRun: boolean;
  skipBackup: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    brandId: 0,
    manufacturer: undefined,
    limit: undefined,
    titleIncludes: [],
    titleExcludes: [],
    replace: false,
    dryRun: false,
    skipBackup: false,
  };

  for (const arg of argv) {
    if (arg === "--replace") {
      options.replace = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--skip-backup") {
      options.skipBackup = true;
      continue;
    }

    if (arg.startsWith("--brand-id=")) {
      options.brandId = Number(arg.slice("--brand-id=".length));
      continue;
    }

    if (arg.startsWith("--manufacturer=")) {
      options.manufacturer = arg.slice("--manufacturer=".length).trim();
      continue;
    }

    if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.slice("--limit=".length));
      continue;
    }

    if (arg.startsWith("--title-includes=")) {
      options.titleIncludes?.push(arg.slice("--title-includes=".length).trim());
      continue;
    }

    if (arg.startsWith("--title-excludes=")) {
      options.titleExcludes?.push(arg.slice("--title-excludes=".length).trim());
    }
  }

  if (!Number.isInteger(options.brandId) || options.brandId <= 0) {
    throw new Error("Use --brand-id=<number>.");
  }

  return options;
}

async function backupCurrentCars(prisma: PrismaClient, backupDir: string) {
  const backup = {
    exportedAt: new Date().toISOString(),
    cars: await prisma.car.findMany({
      include: {
        productMappings: true,
        maintenanceTasks: true,
        questions: true,
      },
      orderBy: [
        { manufacturer: "asc" },
        { model: "asc" },
      ],
    }),
  };

  const filePath = path.join(backupDir, `cars-backup-${Date.now()}.json`);
  await writeFile(filePath, `${JSON.stringify(backup, null, 2)}\n`, "utf8");
  return filePath;
}

async function main() {
  await loadLocalEnv();

  if (process.env.USE_UNPOOLED_DATABASE !== "false" && process.env.DATABASE_URL_UNPOOLED?.trim()) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED.trim();
  }

  const options = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();
  const tmpDir = path.join(process.cwd(), "tmp");
  const importDir = path.join(tmpDir, "imports");
  const backupDir = path.join(tmpDir, "backups");

  await mkdir(importDir, { recursive: true });
  await mkdir(backupDir, { recursive: true });

  const harvested = await harvestMycarlubsBrandCars({
    brandId: options.brandId,
    manufacturer: options.manufacturer,
    limit: options.limit,
  });

  const includeNeedles = (options.titleIncludes ?? []).filter(Boolean);
  const excludeNeedles = (options.titleExcludes ?? []).filter(Boolean);
  const filteredRecords = harvested.records.filter((record) => {
    const haystack = `${record.model} ${record.overviewDetails} ${record.engineDetails}`.toLowerCase();

    if (includeNeedles.length > 0 && !includeNeedles.some((needle) => haystack.includes(needle.toLowerCase()))) {
      return false;
    }

    if (excludeNeedles.some((needle) => haystack.includes(needle.toLowerCase()))) {
      return false;
    }

    return true;
  });

  const auditPath = path.join(importDir, `mycarlubs-brand-${options.brandId}-${Date.now()}.json`);
  await writeFile(
    auditPath,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      brand: harvested.brand,
      count: filteredRecords.length,
      cars: filteredRecords,
    }, null, 2)}\n`,
    "utf8",
  );

  console.log(`Prepared ${filteredRecords.length} خودرو از برند ${harvested.brand.Title}.`);
  console.log(`Audit file: ${auditPath}`);

  if (options.dryRun) {
    await prisma.$disconnect();
    return;
  }

  if (!options.skipBackup) {
    const backupPath = await backupCurrentCars(prisma, backupDir);
    console.log(`Backup file: ${backupPath}`);
  } else {
    console.log("Backup skipped.");
  }

  if (options.replace) {
    await prisma.car.deleteMany();
    console.log("Deleted current car list.");
  }

  for (const record of filteredRecords) {
    const savedCar = await prisma.car.upsert({
      where: { slug: record.slug },
      update: {
        manufacturer: record.manufacturer,
        model: record.model,
        generation: record.generation,
        imageUrl: record.imageUrl,
        engineType: record.engineType,
        engineCode: record.engineCode,
        viscosity: record.viscosity,
        oilCapacityLit: record.oilCapacityLit,
        specification: record.specification,
        yearFrom: record.yearFrom,
        yearTo: record.yearTo,
        overviewDetails: record.overviewDetails,
        engineDetails: record.engineDetails,
        gearboxDetails: record.gearboxDetails,
        maintenanceInfo: record.maintenanceInfo,
        notebookSections: record.notebookSections,
      },
      create: {
        slug: record.slug,
        manufacturer: record.manufacturer,
        model: record.model,
        generation: record.generation,
        imageUrl: record.imageUrl,
        engineType: record.engineType,
        engineCode: record.engineCode,
        viscosity: record.viscosity,
        oilCapacityLit: record.oilCapacityLit,
        specification: record.specification,
        yearFrom: record.yearFrom,
        yearTo: record.yearTo,
        overviewDetails: record.overviewDetails,
        engineDetails: record.engineDetails,
        gearboxDetails: record.gearboxDetails,
        maintenanceInfo: record.maintenanceInfo,
        notebookSections: record.notebookSections,
      },
    });

    await prisma.carMaintenanceTask.deleteMany({
      where: {
        carId: savedCar.id,
      },
    });

    if (record.maintenanceTasks.length > 0) {
      await prisma.carMaintenanceTask.createMany({
        data: record.maintenanceTasks.map((task) => ({
          carId: savedCar.id,
          title: task.title,
          description: task.description,
          intervalKm: task.intervalKm,
          intervalMonths: task.intervalMonths,
          priority: task.priority,
          recommendedProductSlugs: task.recommendedProductSlugs,
        })),
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        brand: harvested.brand.Title,
        importedCars: filteredRecords.length,
        replaceMode: options.replace,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
