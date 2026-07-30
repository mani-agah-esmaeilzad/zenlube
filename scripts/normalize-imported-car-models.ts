import { PrismaClient } from "../src/generated/prisma";
import { loadLocalEnv, normalizeCarModelTitle } from "./lib/mycarlubs";

function updateOverviewHeading(overviewDetails: string, manufacturer: string, previousModel: string, nextModel: string) {
  const lines = overviewDetails.split(/\r?\n/);
  const previousHeading = `${manufacturer} ${previousModel}`.trim();

  if (lines[0]?.trim() === previousHeading) {
    lines[0] = `${manufacturer} ${nextModel}`.trim();
  }

  return lines.join("\n");
}

async function main() {
  await loadLocalEnv();

  if (process.env.USE_UNPOOLED_DATABASE !== "false" && process.env.DATABASE_URL_UNPOOLED?.trim()) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED.trim();
  }

  const prisma = new PrismaClient();

  const cars = await prisma.car.findMany({
    select: {
      id: true,
      slug: true,
      manufacturer: true,
      model: true,
      overviewDetails: true,
    },
    orderBy: [{ manufacturer: "asc" }, { model: "asc" }],
  });

  let updatedCount = 0;

  for (const car of cars) {
    const normalizedModel = normalizeCarModelTitle(car.model, car.manufacturer);

    if (normalizedModel === car.model) {
      continue;
    }

    await prisma.car.update({
      where: { id: car.id },
      data: {
        model: normalizedModel,
        overviewDetails: car.overviewDetails
          ? updateOverviewHeading(car.overviewDetails, car.manufacturer, car.model, normalizedModel)
          : car.overviewDetails,
      },
    });

    updatedCount += 1;
    console.log(`${car.slug}: ${car.manufacturer} | ${car.model} -> ${normalizedModel}`);
  }

  console.log(JSON.stringify({ updatedCount }, null, 2));

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
