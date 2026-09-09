import { Prisma, PrismaClient, PromotionKind } from "../src/generated/prisma";
import { catalogProducts } from "./product-data/catalog-products";
import {
  isUniumCatalogPlaceholder,
  UNIUM_INITIAL_COMMERCE,
} from "./product-data/unium-seed-policy";

const prisma = new PrismaClient();

const PRODUCT_SLUG = "unium-octane-booster-ba29ex-355ml";

async function main() {
  const definition = catalogProducts.find((product) => product.slug === PRODUCT_SLUG);
  if (!definition) throw new Error(`Catalog definition not found: ${PRODUCT_SLUG}`);

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
      description: "افزودنی اکتان و پاک‌کننده سیستم سوخت یونیوم",
    },
    create: {
      slug: definition.brandSlug,
      name: definition.brandName,
      website: definition.brandWebsite ?? null,
      description: "افزودنی اکتان و پاک‌کننده سیستم سوخت یونیوم",
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
      definition.packagingSizeLit === undefined ? null : new Prisma.Decimal(definition.packagingSizeLit),
    technicalSpecs: definition.technicalSpecs,
    tags: definition.tags,
    videos: [],
    requiresShipping: true,
    shippingIsLiquid: true,
  } satisfies Prisma.ProductUncheckedUpdateInput;

  const existing = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    select: {
      id: true,
      price: true,
      stock: true,
      shippingWeightGrams: true,
    },
  });
  const initializeCatalogPlaceholder =
    existing !== null &&
    isUniumCatalogPlaceholder({
      priceRials: Number(existing.price),
      stock: existing.stock,
      shippingWeightGrams: existing.shippingWeightGrams,
    });
  const initialCommerce = {
    price: new Prisma.Decimal(UNIUM_INITIAL_COMMERCE.priceRials),
    stock: UNIUM_INITIAL_COMMERCE.stock,
    shippingWeightGrams: UNIUM_INITIAL_COMMERCE.shippingWeightGrams,
  } satisfies Prisma.ProductUncheckedUpdateInput;
  const product = await prisma.product.upsert({
    where: { slug: PRODUCT_SLUG },
    update: {
      ...metadata,
      ...(initializeCatalogPlaceholder ? initialCommerce : {}),
    },
    create: {
      ...metadata,
      ...initialCommerce,
      slug: PRODUCT_SLUG,
      isFeatured: false,
      isBestseller: false,
    },
  });

  await prisma.productPromotion.upsert({
    where: { productId: product.id },
    update: {
      kind: PromotionKind.OCTANE,
      label: "اکتان بوستر",
      sortOrder: 23,
      isActive: true,
    },
    create: {
      productId: product.id,
      kind: PromotionKind.OCTANE,
      label: "اکتان بوستر",
      sortOrder: 23,
      isActive: true,
    },
  });

  console.log(
    !existing
      ? `Created ${PRODUCT_SLUG} with its initial commerce values.`
      : initializeCatalogPlaceholder
        ? `Initialized catalog placeholder ${PRODUCT_SLUG} with its initial commerce values.`
        : `Updated ${PRODUCT_SLUG}; existing price, stock and shipping weight were preserved.`,
  );
  console.log(
    `Initial price: ${UNIUM_INITIAL_COMMERCE.priceRials} IRR; shipping weight: ${UNIUM_INITIAL_COMMERCE.shippingWeightGrams} g.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
