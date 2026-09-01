import { aidlubeEngineOils } from "./aidlube-engine-oils";
import { extendedAccessories } from "./extended-accessories";
import { extendedEngineOils } from "./extended-engine-oils";
import { extendedGearOils } from "./extended-gear-oils";
import type { CatalogProductSeed } from "./catalog-types";

const aidlubeCatalogProducts: CatalogProductSeed[] = aidlubeEngineOils.map((product) => ({
  brandSlug: "aidlube",
  brandName: "ایدلوب",
  brandWebsite: "https://aidlube.de",
  categorySlug: "engine-oil",
  name: product.name,
  slug: product.slug,
  sku: product.sku,
  description: product.description,
  viscosity: product.viscosity,
  oilType: product.oilType,
  imageUrl: product.imageUrl,
  approvals: product.approvals,
  packagingSizeLit: product.packagingSizeLit,
  originCountry: product.originCountry,
  technicalSpecs: product.technicalSpecs,
  tags: product.tags,
  productSourceUrl: product.productSourceUrl ?? "https://aidlube.de/wp-content/uploads/2025/04/aidlube-catalog-2025.pdf",
  carMappings: product.carMappings,
}));

export const catalogProducts: CatalogProductSeed[] = [
  ...aidlubeCatalogProducts,
  ...extendedEngineOils,
  ...extendedGearOils,
  ...extendedAccessories,
];

export const catalogProductSlugs = catalogProducts.map((product) => product.slug);

export const catalogBrandDefinitions = [
  ...new Map(
    catalogProducts.map((product) => [
      product.brandSlug,
      {
        slug: product.brandSlug,
        name: product.brandName,
        website: product.brandWebsite ?? null,
      },
    ]),
  ).values(),
];
