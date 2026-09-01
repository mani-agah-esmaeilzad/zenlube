import { PrismaClient, type PromotionKind } from "../src/generated/prisma";

const prisma = new PrismaClient();

const presets: Array<{ slug: string; kind: PromotionKind; label: string; sortOrder: number }> = [
  { slug: "persia-sign-up-to-5-octane-booster-450ml", kind: "OCTANE", label: "افزایش اکتان", sortOrder: 20 },
  { slug: "xado-octane-booster-f8-250ml", kind: "OCTANE", label: "اکتان حرفه‌ای", sortOrder: 21 },
  { slug: "xado-verylube-octane-booster-250ml", kind: "OCTANE", label: "مکمل سوخت", sortOrder: 22 },
  { slug: "woofer-c16-racing-fuel-5l", kind: "RACING_FUEL", label: "بنزین مسابقه‌ای C16", sortOrder: 30 },
  { slug: "woofer-c45-racing-fuel-5l", kind: "RACING_FUEL", label: "بنزین مسابقه‌ای C45", sortOrder: 31 },
];

async function main() {
  const products = await prisma.product.findMany({
    where: { slug: { in: presets.map((preset) => preset.slug) } },
    select: { id: true, slug: true },
  });
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  for (const preset of presets) {
    const product = productsBySlug.get(preset.slug);
    if (!product) throw new Error(`Special-offer product not found: ${preset.slug}`);

    await prisma.productPromotion.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        kind: preset.kind,
        label: preset.label,
        sortOrder: preset.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(`Prepared ${presets.length} octane and racing-fuel products for the special-offers section.`);
  console.log("Products become publicly visible only after a real price and stock are saved in admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
