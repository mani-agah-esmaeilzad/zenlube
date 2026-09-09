import prisma from "../src/lib/prisma";

/**
 * Gross weight of one retail unit. The checkout adds the outer parcel weight
 * separately through ShippingSettings.basePackagingWeightGrams.
 */
const WEIGHT_GRAMS_BY_SLUG = {
  "xado-dot4-brake-fluid-500ml": 650,
  "caspian-sepehr-dot3-yellow-250ml": 350,
  "aidlube-cold-master-red-antifreeze-1l": 1250,
  "bareliz-green-coolant-4l": 4700,
  "xado-amc-maximum-engine-225ml": 300,
  "xado-amc-new-car-225ml": 300,
  "xado-amc-automatic-transmission-30ml": 100,
  "xado-ex120-automatic-transmission-8ml": 50,
  "xado-amc-manual-transmission-30ml": 100,
  "xado-atomex-multi-cleaner-250ml": 350,
  "xado-octane-booster-f8-250ml": 350,
  "xado-verylube-octane-booster-250ml": 350,
  "xado-red-fuel-system-cleaner-250ml": 350,
  "xado-total-flush-motor-cleaner-250ml": 350,
  "xado-turbo-treatment-125ml": 200,
  "xado-atomex-energy-drive-250ml": 350,
  "persia-sign-up-to-5-octane-booster-450ml": 600,
  "caspian-windshield-wash-1l": 1250,
  "woofer-c45-racing-fuel-5l": 5000,
  "woofer-c16-racing-fuel-5l": 5000,
  "xado-vita-flush-250ml": 350,
} as const;

const shouldApply = process.argv.includes("--apply");
const entries = Object.entries(WEIGHT_GRAMS_BY_SLUG);

async function main() {
  const products = await prisma.product.findMany({
    where: { slug: { in: entries.map(([slug]) => slug) } },
    select: {
      name: true,
      slug: true,
      stock: true,
      price: true,
      requiresShipping: true,
      shippingWeightGrams: true,
    },
    orderBy: { name: "asc" },
  });

  const foundSlugs = new Set(products.map((product) => product.slug));
  const missingSlugs = entries.map(([slug]) => slug).filter((slug) => !foundSlugs.has(slug));
  if (missingSlugs.length > 0) {
    throw new Error(`Products missing from catalog: ${missingSlugs.join(", ")}`);
  }

  const ineligible = products.filter((product) => (
    product.stock <= 0
    || product.price.lte(0)
    || !product.requiresShipping
    || product.slug.startsWith("deleted-")
  ));
  if (ineligible.length > 0) {
    throw new Error(`Products are no longer buyable physical items: ${ineligible.map((item) => item.slug).join(", ")}`);
  }

  const conflicts = products.filter((product) => {
    const expected = WEIGHT_GRAMS_BY_SLUG[product.slug as keyof typeof WEIGHT_GRAMS_BY_SLUG];
    return product.shippingWeightGrams != null && product.shippingWeightGrams !== expected;
  });
  if (conflicts.length > 0) {
    throw new Error(`Refusing to overwrite existing measured weights: ${conflicts.map((item) => item.slug).join(", ")}`);
  }

  const changes = products.filter((product) => product.shippingWeightGrams == null);

  if (!shouldApply) {
    console.log(JSON.stringify({ mode: "dry-run", products: products.length, changes: changes.length }));
    return;
  }

  await prisma.$transaction(entries.map(([slug, shippingWeightGrams]) => (
    prisma.product.updateMany({
      where: { slug, shippingWeightGrams: null },
      data: { shippingWeightGrams },
    })
  )));

  const remaining = await prisma.product.count({
    where: {
      slug: { in: entries.map(([slug]) => slug) },
      OR: [
        { shippingWeightGrams: null },
        { shippingWeightGrams: { lte: 0 } },
      ],
    },
  });
  if (remaining > 0) throw new Error(`${remaining} product weights were not persisted.`);

  console.log(JSON.stringify({ mode: "apply", products: products.length, updated: changes.length, remaining }));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
