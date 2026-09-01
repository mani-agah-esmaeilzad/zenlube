export type CatalogCategorySlug = "engine-oil" | "gear-oil" | "brake-oil" | "accessories";

export type CatalogCarMapping = {
  carSlug: string;
  note: string;
  sourceTitle: string;
  sourceUrl: string;
};

export type CatalogProductSeed = {
  brandSlug: string;
  brandName: string;
  brandWebsite?: string;
  categorySlug: CatalogCategorySlug;
  name: string;
  slug: string;
  sku: string;
  description: string;
  viscosity?: string;
  oilType?: string;
  imageUrl: string;
  approvals?: string;
  packagingSizeLit?: number;
  originCountry?: string | null;
  temperatureRange?: string;
  technicalSpecs: Record<string, string>;
  tags: string[];
  productSourceUrl: string;
  carMappings: CatalogCarMapping[];
};

export type CatalogProductInput = Omit<
  CatalogProductSeed,
  "name" | "description" | "technicalSpecs" | "tags" | "carMappings"
> & {
  title: string;
  latinName: string;
  volumeLabel: string;
  summary: string;
  productType: string;
  specifications?: Record<string, string>;
  tags?: string[];
  carMappings?: CatalogCarMapping[];
};

export const REVIEW_DATE_FA = "۱۰ شهریور ۱۴۰۵";

const packageName = (volumeLabel: string) =>
  volumeLabel === "یک عدد" ? "بسته یک‌عددی" : `بسته ${volumeLabel}`;

export function catalogProduct(input: CatalogProductInput): CatalogProductSeed {
  const compatibilityNote =
    input.categorySlug === "engine-oil"
      ? "پیش از مصرف، گرانروی و سطح کیفی درج‌شده در دفترچه خودرو کنترل شود."
      : input.categorySlug === "gear-oil"
        ? "این روغن فقط زمانی استفاده شود که استاندارد آن عیناً در دفترچه گیربکس خودرو آمده باشد."
        : "روش مصرف و هشدارهای روی بسته‌بندی پیش از استفاده مطالعه شود.";

  return {
    brandSlug: input.brandSlug,
    brandName: input.brandName,
    brandWebsite: input.brandWebsite,
    categorySlug: input.categorySlug,
    name: `${input.title} ${input.volumeLabel}`,
    slug: input.slug,
    sku: input.sku,
    description: `${input.summary} این رکورد برای ${packageName(input.volumeLabel)} ساخته شده و تصویر آن از محصول واقعی همین خانواده انتخاب شده است. ${compatibilityNote}`,
    viscosity: input.viscosity,
    oilType: input.oilType,
    imageUrl: input.imageUrl,
    approvals: input.approvals,
    packagingSizeLit: input.packagingSizeLit,
    originCountry: input.originCountry,
    temperatureRange: input.temperatureRange,
    technicalSpecs: {
      "نام لاتین محصول": input.latinName,
      "گروه محصول": input.productType,
      "اندازه بسته": input.volumeLabel,
      ...(input.viscosity ? { "درجه گرانروی": input.viscosity } : {}),
      ...(input.oilType ? { "نوع پایه": input.oilType } : {}),
      ...(input.approvals ? { "استانداردها و سطوح عملکرد": input.approvals } : {}),
      ...(input.specifications ?? {}),
      "منبع مشخصات": input.productSourceUrl,
      "تاریخ بازبینی منبع": REVIEW_DATE_FA,
    },
    tags: [input.brandName, input.latinName, input.productType, ...(input.tags ?? [])],
    productSourceUrl: input.productSourceUrl,
    carMappings: input.carMappings ?? [],
  };
}

export const MG_MANUAL_SOURCE = {
  sourceTitle: "دفترچه‌ها و بولتن‌های فنی MG / SAIC",
  sourceUrl: "https://mg-wiki.com/media/oils/SI-ALL-EN-20170811-The.pdf",
};

export const mgMap = (carSlug: string, note: string): CatalogCarMapping => ({
  carSlug,
  note,
  ...MG_MANUAL_SOURCE,
});
