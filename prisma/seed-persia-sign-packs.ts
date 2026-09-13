import { Prisma, PrismaClient, PromotionKind } from "../src/generated/prisma";
import { catalogProducts } from "./product-data/catalog-products";
import {
  isPersiaSignPackCatalogPlaceholder,
  PERSIA_SIGN_PACK_INITIAL_COMMERCE,
  type PersiaSignPackSlug,
} from "./product-data/persia-sign-pack-seed-policy";

const prisma = new PrismaClient();

const PRODUCT_SLUGS = Object.keys(
  PERSIA_SIGN_PACK_INITIAL_COMMERCE,
) as PersiaSignPackSlug[];

async function upsertPersiaSignPack(productSlug: PersiaSignPackSlug, sortOrder: number) {
  const definition = catalogProducts.find((product) => product.slug === productSlug);
  if (!definition) throw new Error(`Catalog definition not found: ${productSlug}`);

  const category = await prisma.category.upsert({
    where: { slug: definition.categorySlug },
    update: {},
    create: {
      slug: definition.categorySlug,
      name: "لوازم جانبی و مکمل",
      description: "ضدیخ، کولانت، مکمل سوخت، شوینده و محصولات نگهداری خودرو",
    },
  });
  const brand = await prisma.brand.upsert({
    where: { slug: definition.brandSlug },
    update: {
      name: definition.brandName,
      website: definition.brandWebsite ?? null,
      description: "افزودنی اکتان و مکمل سوخت پرشیا ساین",
    },
    create: {
      slug: definition.brandSlug,
      name: definition.brandName,
      website: definition.brandWebsite ?? null,
      description: "افزودنی اکتان و مکمل سوخت پرشیا ساین",
    },
  });

  const metadata = {
    name: definition.name,
    sku: definition.sku,
    description: definition.description,
    viscosity: definition.viscosity ?? null,
    oilType: definition.oilType ?? null,
    imageUrl: definition.imageUrl,
    categoryId: category.id,
    brandId: brand.id,
    originCountry: definition.originCountry ?? null,
    approvals: definition.approvals ?? null,
    temperatureRange: definition.temperatureRange ?? null,
    packagingSizeLit:
      definition.packagingSizeLit === undefined
        ? null
        : new Prisma.Decimal(definition.packagingSizeLit),
    technicalSpecs: definition.technicalSpecs,
    tags: definition.tags,
    videos: [],
    requiresShipping: true,
    shippingIsLiquid: true,
  } satisfies Prisma.ProductUncheckedUpdateInput;

  const existing = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: {
      id: true,
      price: true,
      stock: true,
      shippingWeightGrams: true,
    },
  });
  const commerce = PERSIA_SIGN_PACK_INITIAL_COMMERCE[productSlug];
  const initializeCatalogPlaceholder =
    existing !== null &&
    isPersiaSignPackCatalogPlaceholder({
      priceRials: Number(existing.price),
      stock: existing.stock,
      shippingWeightGrams: existing.shippingWeightGrams,
    });
  const initialCommerce = {
    price: new Prisma.Decimal(commerce.priceRials),
    stock: commerce.stock,
    shippingWeightGrams: commerce.shippingWeightGrams,
  } satisfies Prisma.ProductUncheckedUpdateInput;
  const product = await prisma.product.upsert({
    where: { slug: productSlug },
    update: {
      ...metadata,
      ...(initializeCatalogPlaceholder ? initialCommerce : {}),
    },
    create: {
      ...metadata,
      ...initialCommerce,
      slug: productSlug,
      isFeatured: false,
      isBestseller: false,
    },
  });

  await prisma.productPromotion.upsert({
    where: { productId: product.id },
    update: {
      kind: PromotionKind.OCTANE,
      label: "پک اقتصادی اکتان بوستر",
      sortOrder,
      isActive: true,
    },
    create: {
      productId: product.id,
      kind: PromotionKind.OCTANE,
      label: "پک اقتصادی اکتان بوستر",
      sortOrder,
      isActive: true,
    },
  });

  return !existing
    ? `Created ${productSlug} with initial commerce values.`
    : initializeCatalogPlaceholder
      ? `Initialized catalog placeholder ${productSlug} with initial commerce values.`
      : `Updated ${productSlug}; existing price, stock and shipping weight were preserved.`;
}

async function main() {
  const results = await Promise.all(
    PRODUCT_SLUGS.map((productSlug, index) =>
      upsertPersiaSignPack(productSlug, 24 + index),
    ),
  );

  for (const result of results) console.log(result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
