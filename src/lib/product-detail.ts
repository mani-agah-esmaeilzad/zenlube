import type { Brand, Car, Category, Product, ProductCar } from "@/generated/prisma";

type ProductDetailRecord = Product & {
  brand: Brand;
  category: Category;
  carMappings: Array<ProductCar & { car: Car }>;
};

export type ProductGalleryItem = {
  src: string;
  alt: string;
};

export type ProductSpecRow = {
  label: string;
  value: string;
};

export type ProductQuickFact = {
  label: string;
  value: string;
};

export type ProductCompatibilityItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string[];
  note?: string | null;
};

export type ProductFaqItem = {
  question: string;
  answer: string;
};

const preferredSpecLabels = [
  "برند",
  "دسته‌بندی",
  "گرانروی SAE",
  "حجم",
  "نوع محصول",
  "استانداردها و سطوح عملکرد",
  "محدوده دمای عملکرد",
  "کشور سازنده",
  "گارانتی",
  "کد کالا",
] as const;

const quickFactLabels = [
  "گرانروی SAE",
  "نوع محصول",
  "حجم",
  "استانداردها و سطوح عملکرد",
  "کشور سازنده",
  "خودروهای سازگار",
] as const;

function formatOptionalText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === "object" && "toString" in value) {
    const parsed = Number((value as { toString(): string }).toString());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatLiters(value: unknown) {
  const numericValue = toNumber(value);
  if (numericValue == null) return null;
  return `${numericValue.toLocaleString("fa-IR")} لیتر`;
}

function normalizeLabel(label: string) {
  return label.replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeSpecValue(value: unknown): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => normalizeSpecValue(item))
      .filter(Boolean);

    return items.length ? items.join(" / ") : null;
  }

  if (value && typeof value === "object") {
    if ("value" in value) {
      return normalizeSpecValue((value as { value?: unknown }).value);
    }

    return null;
  }

  return null;
}

function prettifyTechnicalLabel(key: string) {
  const explicitMap: Record<string, string> = {
    api: "استاندارد API",
    approvals: "استانداردها و سطوح عملکرد",
    brand: "برند",
    capacity: "حجم",
    engineType: "نوع موتور",
    fuelType: "نوع سوخت",
    model: "مدل",
    oem: "استانداردها و سطوح عملکرد",
    partNumber: "شماره فنی",
    sae: "گرانروی SAE",
    sku: "کد کالا",
    temperatureRange: "محدوده دمای عملکرد",
    volume: "حجم",
  };

  if (explicitMap[key]) return explicitMap[key];

  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

function flattenTechnicalSpecs(value: unknown, rows: ProductSpecRow[] = []): ProductSpecRow[] {
  if (!value) return rows;

  if (Array.isArray(value)) {
    for (const item of value) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const objectItem = item as Record<string, unknown>;
        const label =
          normalizeSpecValue(objectItem.label) ??
          normalizeSpecValue(objectItem.title) ??
          normalizeSpecValue(objectItem.key) ??
          normalizeSpecValue(objectItem.name);
        const itemValue =
          normalizeSpecValue(objectItem.value) ??
          normalizeSpecValue(objectItem.description) ??
          normalizeSpecValue(objectItem.text);

        if (label && itemValue) {
          rows.push({ label, value: itemValue });
          continue;
        }
      }

      flattenTechnicalSpecs(item, rows);
    }

    return rows;
  }

  if (value && typeof value === "object") {
    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      const normalizedValue = normalizeSpecValue(entryValue);
      if (normalizedValue) {
        rows.push({ label: prettifyTechnicalLabel(key), value: normalizedValue });
      } else {
        flattenTechnicalSpecs(entryValue, rows);
      }
    }
  }

  return rows;
}

function formatYearLabel(yearFrom?: number | null, yearTo?: number | null) {
  if (!yearFrom && !yearTo) return null;
  if (yearFrom && yearTo) {
    return `${yearFrom.toLocaleString("fa-IR")} تا ${yearTo.toLocaleString("fa-IR")}`;
  }
  return (yearFrom ?? yearTo)?.toLocaleString("fa-IR") ?? null;
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))]
    .map((value) => value.trim())
    .filter(Boolean);
}

function isImageUrl(value: string) {
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(value);
}

function findImageUrlsInUnknown(value: unknown, results: string[] = []): string[] {
  if (!value) return results;

  if (typeof value === "string") {
    if (isImageUrl(value)) {
      results.push(value);
    }
    return results;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      findImageUrlsInUnknown(item, results);
    }
    return results;
  }

  if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      findImageUrlsInUnknown(item, results);
    }
  }

  return results;
}

export function extractEnglishProductLabel(name: string) {
  const matches = Array.from(name.matchAll(/[A-Za-z0-9][A-Za-z0-9/+.\- ]{2,}/g))
    .map((match) => match[0].trim().replace(/^[\-–—]+|[\-–—]+$/g, ""))
    .filter((item) => item.length >= 4);

  return matches[0] ?? null;
}

export function buildProductGalleryItems(product: Pick<ProductDetailRecord, "imageUrl" | "name" | "videos" | "technicalSpecs">) {
  const technicalImages = findImageUrlsInUnknown(product.technicalSpecs);
  const urls = uniqueStrings([product.imageUrl, ...product.videos.filter(isImageUrl), ...technicalImages]);

  return urls.map((src) => ({
    src,
    alt: `تصویر ${product.name}`,
  })) satisfies ProductGalleryItem[];
}

export function buildProductSpecRows(product: ProductDetailRecord) {
  const rows: ProductSpecRow[] = [
    { label: "برند", value: product.brand.name },
    { label: "دسته‌بندی", value: product.category.name },
    { label: "گرانروی SAE", value: product.viscosity ?? "" },
    { label: "حجم", value: formatLiters(product.packagingSizeLit) ?? "" },
    { label: "نوع محصول", value: product.oilType ?? "" },
    { label: "استانداردها و سطوح عملکرد", value: product.approvals ?? "" },
    { label: "محدوده دمای عملکرد", value: product.temperatureRange ?? "" },
    { label: "کشور سازنده", value: product.originCountry ?? "" },
    { label: "گارانتی", value: product.warranty ?? "" },
    { label: "کد کالا", value: product.sku ?? "" },
  ].filter((row) => row.value.trim().length > 0);

  const knownKeys = new Set(rows.map((row) => normalizeLabel(row.label)));

  for (const row of flattenTechnicalSpecs(product.technicalSpecs)) {
    const key = normalizeLabel(row.label);
    if (knownKeys.has(key)) continue;
    if (!row.value.trim().length) continue;
    knownKeys.add(key);
    rows.push(row);
  }

  const orderedRows = preferredSpecLabels
    .map((label) => rows.find((row) => row.label === label))
    .filter((row): row is ProductSpecRow => Boolean(row));

  const unorderedRows = rows.filter((row) => !preferredSpecLabels.includes(row.label as (typeof preferredSpecLabels)[number]));

  return [...orderedRows, ...unorderedRows];
}

export function buildProductQuickFacts(product: ProductDetailRecord) {
  const rows = buildProductSpecRows(product);
  const facts = quickFactLabels
    .map((label) => rows.find((row) => row.label === label))
    .filter((row): row is ProductSpecRow => Boolean(row))
    .map((row) => ({ label: row.label, value: row.value }));

  if (product.carMappings.length > 0 && !facts.some((fact) => fact.label === "خودروهای سازگار")) {
    const primaryCar = product.carMappings[0]?.car;
    facts.push({
      label: "خودروهای سازگار",
      value:
        product.carMappings.length === 1 && primaryCar
          ? `${primaryCar.manufacturer} ${primaryCar.model}`
          : `${product.carMappings.length.toLocaleString("fa-IR")} خودرو`,
    });
  }

  return facts.slice(0, 6) satisfies ProductQuickFact[];
}

export function buildCompatibilityItems(product: ProductDetailRecord) {
  return product.carMappings.map(({ car, note, id }) => ({
    id,
    slug: car.slug,
    title: `${car.manufacturer} ${car.model}${car.generation ? ` ${car.generation}` : ""}`.trim(),
    subtitle: uniqueStrings([
      formatYearLabel(car.yearFrom, car.yearTo),
      car.engineType,
      car.engineCode ? `کد موتور: ${car.engineCode}` : null,
    ]),
    note,
  })) satisfies ProductCompatibilityItem[];
}

export function buildProductImportantNotes(product: ProductDetailRecord) {
  return uniqueStrings([
    product.approvals ? `استانداردها و سطوح عملکرد اعلام‌شده برای این کالا: ${product.approvals}` : null,
    product.temperatureRange ? `محدوده دمای عملکرد ثبت‌شده: ${product.temperatureRange}` : null,
    product.warranty ? `اطلاعات گارانتی یا اصالت: ${product.warranty}` : null,
    product.carMappings.find((mapping) => formatOptionalText(mapping.note))?.note ?? null,
  ]);
}

export function buildProductFaqs(product: ProductDetailRecord) {
  const faqs: ProductFaqItem[] = [];

  if (product.viscosity) {
    faqs.push({
      question: "گرانروی این محصول چیست؟",
      answer: `گرانروی ثبت‌شده برای این محصول ${product.viscosity} است.`,
    });
  }

  const packaging = formatLiters(product.packagingSizeLit);
  if (packaging) {
    faqs.push({
      question: "حجم بسته‌بندی این محصول چقدر است؟",
      answer: `حجم ثبت‌شده برای این کالا ${packaging} است.`,
    });
  }

  if (product.approvals) {
    faqs.push({
      question: "این محصول چه استاندارد و سطح عملکردی دارد؟",
      answer: `استانداردها و سطوح عملکرد ثبت‌شده برای این کالا ${product.approvals} است.`,
    });
  }

  if (product.carMappings.length > 0) {
    const titles = buildCompatibilityItems(product)
      .slice(0, 4)
      .map((item) => item.title);

    faqs.push({
      question: "این محصول برای چه خودروهایی مناسب است؟",
      answer:
        product.carMappings.length <= 4
          ? titles.join("، ")
          : `${titles.join("، ")} و ${(product.carMappings.length - titles.length).toLocaleString("fa-IR")} مدل دیگر.`,
    });
  }

  if (product.stock > 0) {
    faqs.push({
      question: "وضعیت موجودی این کالا چگونه است؟",
      answer: `این کالا در حال حاضر ${product.stock.toLocaleString("fa-IR")} عدد موجودی ثبت‌شده دارد.`,
    });
  }

  return faqs.slice(0, 5);
}
