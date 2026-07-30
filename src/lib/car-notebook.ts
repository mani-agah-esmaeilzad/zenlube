import type { ProductWithRelations } from "@/types/catalog";
import {
  REQUESTED_CAR_NOTEBOOK_SECTION_BY_PAGE_ID,
  REQUESTED_CAR_NOTEBOOK_SECTIONS,
  type RequestedCarNotebookSection,
  type StoredCarNotebookSection,
} from "./car-notebook-sections";

export type NotebookHighlight = {
  label: string;
  value: string;
};

export type NotebookPage = {
  id: string;
  title: string;
  description: string;
  highlights?: NotebookHighlight[];
  kicker?: string;
  tag?: string;
  sourceUrl?: string;
};

export type NotebookMaintenanceTask = {
  id?: string;
  title: string;
  description?: string | null;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  priority: number;
};

export type NotebookCompatibleProduct = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  categoryName: string;
  categorySlug: string;
  imageUrl: string | null;
  price: number;
  stock: number;
  averageRating: number | null;
  reviewCount: number;
  viscosity: string | null;
  packagingSizeLit: number | null;
  oilType: string | null;
  isFeatured: boolean;
  isBestseller: boolean;
};

export type NotebookProductPanel = {
  pageId: string;
  pageTitle: string;
  pageTag?: string;
  hasCatalogCategory: boolean;
  browseHref: string;
  allProductsHref: string;
  categoryName: string;
  products: NotebookCompatibleProduct[];
  totalProducts: number;
  emptyTitle: string;
  emptyDescription: string;
};

type NotebookCarInput = {
  manufacturer: string;
  model: string;
  engineType?: string | null;
  engineCode?: string | null;
  viscosity?: string | null;
  specification?: string | null;
  overviewDetails?: string | null;
  engineDetails?: string | null;
  gearboxDetails?: string | null;
  maintenanceInfo?: string | null;
  notebookSections?: unknown;
};

export function buildNotebookData({
  title,
  years,
  oilCapacity,
  car,
  maintenanceTasks,
  recommendedProductsCount,
}: {
  title: string;
  years: string;
  oilCapacity: string;
  car: NotebookCarInput;
  maintenanceTasks: NotebookMaintenanceTask[];
  recommendedProductsCount: number;
}): {
  pages: NotebookPage[];
} {
  const storedSections = parseStoredNotebookSections(car.notebookSections);
  const sectionById = new Map(storedSections.map((section) => [section.categoryId, section] as const));
  const overviewSection = extractNotebookSection(car.overviewDetails, [title, `${car.manufacturer} ${car.model}`]);
  const engineTask = findMaintenanceTask(maintenanceTasks, ["روغن موتور"]);
  const gearboxTask = findMaintenanceTask(maintenanceTasks, ["روغن گیربکس", "گیربکس"]);
  const maintenanceSection = extractNotebookSection(car.maintenanceInfo);
  const engineSection = extractNotebookSection(car.engineDetails);
  const gearboxSection = extractNotebookSection(car.gearboxDetails);
  const engineViscosity =
    firstNonEmpty([
      car.viscosity,
      extractNamedValue(engineSection.description, [
        "ویسکوزیته پیشنهادی روغن موتور",
        "درجه ویسکوزیته روغن موتور",
        "ویسکوزیته روغن موتور",
      ]),
      extractNamedValue(maintenanceSection.description, [
        "ویسکوزیته پیشنهادی روغن موتور",
        "درجه ویسکوزیته روغن موتور",
      ]),
    ]) ?? "ثبت نشده";
  const engineSpecification =
    firstNonEmpty([
      car.specification,
      extractNamedValue(engineSection.description, ["استاندارد روغن موتور", "سطح کیفیت روغن موتور"]),
    ]) ?? "ثبت نشده";
  const gearboxType =
    firstNonEmpty([
      extractNamedValue(gearboxSection.description, ["نوع گیربکس"]),
      extractGearboxType(gearboxSection.description),
    ]) ?? "ثبت نشده";

  const categoryPages =
    storedSections.length > 0 || car.manufacturer === "ام جی"
      ? REQUESTED_CAR_NOTEBOOK_SECTIONS.map((config) =>
          buildRequestedNotebookPage({
            config,
            section: sectionById.get(config.categoryId),
            fallbacks: {
              engineSection,
              gearboxSection,
              engineTask,
              gearboxTask,
              oilCapacity,
              viscosity: engineViscosity,
              specification: engineSpecification,
              gearboxType,
              recommendedProductsCount,
            },
          }),
        )
      : [
          {
            id: "engine-oil",
            title: "روغن موتور",
            tag: "روانکار",
            kicker: "ویسکوزیته، سطح کیفیت، حجم سرویس و نکات روغن موتور.",
            description:
              engineSection.description ||
              engineTask?.description ||
              "برای این خودرو هنوز جزئیات کامل روغن موتور ثبت نشده است.",
            sourceUrl: engineSection.sourceUrl,
            highlights: [
              { label: "ویسکوزیته", value: engineViscosity },
              { label: "استاندارد", value: engineSpecification },
              { label: "حجم روغن", value: oilCapacity },
              { label: "بازه سرویس", value: formatMaintenanceInterval(engineTask) },
            ],
          },
          {
            id: "gearbox-oil",
            title: "روغن گیربکس",
            tag: "گیربکس",
            kicker: "نکات انتخاب روغن گیربکس، حجم تقریبی و بازه سرویس.",
            description:
              gearboxSection.description ||
              gearboxTask?.description ||
              "برای این خودرو هنوز جزئیات کامل روغن گیربکس ثبت نشده است.",
            sourceUrl: gearboxSection.sourceUrl,
            highlights: [
              { label: "نوع گیربکس", value: gearboxType },
              { label: "بازه سرویس", value: formatMaintenanceInterval(gearboxTask) },
              { label: "وضعیت دفترچه", value: gearboxSection.description ? "ثبت شده" : "در حال تکمیل" },
              { label: "محصولات سازگار", value: `${recommendedProductsCount.toLocaleString("fa-IR")} مورد` },
            ],
          },
        ];

  const pages: NotebookPage[] = [
    {
      id: "overview",
      title: "مشخصات خودرو",
      tag: "نمای کلی",
      kicker: "خلاصه مشخصات پایه و توضیحات دفترچه‌ای این خودرو.",
      description:
        overviewSection.description ||
        "برای این خودرو هنوز توضیح تکمیلی بخش معرفی ثبت نشده است.",
      sourceUrl: overviewSection.sourceUrl,
      highlights: [
        { label: "مدل", value: `${car.manufacturer} ${car.model}`.trim() },
        { label: "سال ساخت", value: years },
        { label: "نوع موتور", value: car.engineType ?? "نامشخص" },
        { label: "کد موتور", value: car.engineCode ?? "ثبت نشده" },
      ],
    },
    ...categoryPages,
  ];

  return { pages };
}

export function buildNotebookProductPanels({
  carSlug,
  carName,
  pages,
  products,
}: {
  carSlug: string;
  carName: string;
  pages: NotebookPage[];
  products: ProductWithRelations[];
}): NotebookProductPanel[] {
  const allProductsHref = `/products?car=${carSlug}`;
  const pageById = new Map(pages.map((page) => [page.id, page] as const));
  const deduplicatedProducts = deduplicateProducts(products).sort(sortCompatibleProducts);

  return REQUESTED_CAR_NOTEBOOK_SECTIONS.flatMap((config) => {
    const page = pageById.get(config.id);
    if (!page) {
      return [];
    }

    const matchedProducts =
      config.storeCategorySlugs?.length
        ? deduplicatedProducts.filter((product) => config.storeCategorySlugs?.includes(product.category.slug))
        : [];
    const categoryName = config.title;
    const browseHref =
      config.storeCategorySlugs?.[0]
        ? `/products?car=${carSlug}&category=${config.storeCategorySlugs[0]}`
        : allProductsHref;

    return [
      {
        pageId: page.id,
        pageTitle: page.title,
        pageTag: page.tag,
        hasCatalogCategory: Boolean(config.storeCategorySlugs?.length),
        browseHref,
        allProductsHref,
        categoryName,
        products: matchedProducts.slice(0, 6).map(serializeNotebookProduct),
        totalProducts: matchedProducts.length,
        emptyTitle: config.storeCategorySlugs?.length
          ? `فعلاً محصول سازگار برای «${page.title}» ثبت نشده است.`
          : `برای «${page.title}» هنوز دسته‌ی فروشگاهی جداگانه نداریم.`,
        emptyDescription: config.storeCategorySlugs?.length
          ? `اگر محصولی از دسته ${categoryName} برای ${carName} متصل شود، همین‌جا نمایش داده می‌شود.`
          : `در حال حاضر دسته‌ی ${categoryName} به‌صورت مجزا در فروشگاه عرضه نمی‌شود. فعلاً همه‌ی محصولات سازگار این خودرو را ببینید.`,
      } satisfies NotebookProductPanel,
    ];
  });
}

function buildRequestedNotebookPage({
  config,
  section,
  fallbacks,
}: {
  config: RequestedCarNotebookSection;
  section?: StoredCarNotebookSection;
  fallbacks: {
    engineSection: { description: string; sourceUrl?: string };
    gearboxSection: { description: string; sourceUrl?: string };
    engineTask?: NotebookMaintenanceTask;
    gearboxTask?: NotebookMaintenanceTask;
    oilCapacity: string;
    viscosity: string;
    specification: string;
    gearboxType: string;
    recommendedProductsCount: number;
  };
}): NotebookPage {
  const fallbackDescription =
    config.categoryId === 1
      ? fallbacks.engineSection.description || fallbacks.engineTask?.description || ""
      : config.categoryId === 3
        ? fallbacks.gearboxSection.description || fallbacks.gearboxTask?.description || ""
        : "";
  const fallbackSourceUrl =
    config.categoryId === 1
      ? fallbacks.engineSection.sourceUrl
      : config.categoryId === 3
        ? fallbacks.gearboxSection.sourceUrl
        : undefined;

  const description =
    section?.description?.trim() ||
    fallbackDescription ||
    `برای بخش «${config.title}» در منبع مرجع توضیح متنی ثبت نشده است.`;

  const basePage: NotebookPage = {
    id: config.id,
    title: config.title,
    tag: config.tag,
    description,
    sourceUrl: section?.sourceUrl ?? fallbackSourceUrl,
  };

  if (config.categoryId === 1) {
    return {
      ...basePage,
      kicker: "اطلاعات دقیق روغن موتور این خودرو بر اساس منبع مرجع.",
      highlights: [
        { label: "ویسکوزیته", value: fallbacks.viscosity },
        { label: "استاندارد", value: fallbacks.specification },
        { label: "حجم روغن", value: fallbacks.oilCapacity },
        { label: "بازه سرویس", value: formatMaintenanceInterval(fallbacks.engineTask) },
      ],
    };
  }

  if (config.categoryId === 3) {
    return {
      ...basePage,
      kicker: "اطلاعات روغن گیربکس این خودرو بر اساس منبع مرجع.",
      highlights: [
        { label: "نوع گیربکس", value: fallbacks.gearboxType },
        { label: "بازه سرویس", value: formatMaintenanceInterval(fallbacks.gearboxTask) },
        { label: "وضعیت دفترچه", value: section?.description?.trim() || fallbackDescription ? "ثبت شده" : "ثبت نشده" },
        { label: "محصولات سازگار", value: `${fallbacks.recommendedProductsCount.toLocaleString("fa-IR")} مورد` },
      ],
    };
  }

  if (config.categoryId === 4) {
    return {
      ...basePage,
      kicker: "روغن ترمز و نکات آن همان‌طور که در منبع مرجع آمده است.",
    };
  }

  if (config.categoryId === 49) {
    return {
      ...basePage,
      title: section?.sourceTitle?.includes("اکتان") ? section.sourceTitle : config.title,
      kicker: "مکمل بنزین یا اکتان ثبت‌شده برای این خودرو.",
    };
  }

  return basePage;
}

function extractNotebookSection(
  value: string | null | undefined,
  redundantLines: string[] = [],
): { description: string; sourceUrl?: string } {
  const normalizedRedundant = redundantLines.map(normalizeNotebookLine).filter(Boolean);
  const lines = (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let sourceUrl: string | undefined;
  const filtered: string[] = [];

  lines.forEach((line, index) => {
    const normalizedLine = normalizeNotebookLine(line);
    const urlMatch = line.match(/https?:\/\/\S+/u);

    if (urlMatch && normalizedLine.startsWith("منبع")) {
      sourceUrl = urlMatch[0];
      return;
    }

    if (index === 0 && normalizedRedundant.includes(normalizedLine)) {
      return;
    }

    filtered.push(line);
  });

  return {
    description: filtered.join("\n"),
    sourceUrl,
  };
}

function normalizeNotebookLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseStoredNotebookSections(value: unknown): StoredCarNotebookSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sections: StoredCarNotebookSection[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const section = item as Record<string, unknown>;

    if (
      typeof section.categoryId !== "number" ||
      typeof section.id !== "string" ||
      typeof section.title !== "string" ||
      typeof section.tag !== "string" ||
      typeof section.description !== "string"
    ) {
      continue;
    }

    sections.push({
      categoryId: section.categoryId,
      id: section.id,
      title: section.title,
      tag: section.tag,
      sourceTitle: typeof section.sourceTitle === "string" && section.sourceTitle.trim().length > 0 ? section.sourceTitle : section.title,
      description: section.description,
      sourceUrl: typeof section.sourceUrl === "string" && section.sourceUrl.trim().length > 0 ? section.sourceUrl : undefined,
    });
  }

  return sections;
}

function findMaintenanceTask(tasks: NotebookMaintenanceTask[], keywords: string[]) {
  return tasks.find((task) =>
    keywords.some((keyword) => task.title.includes(keyword) || task.description?.includes(keyword)),
  );
}

function formatMaintenanceInterval(task?: NotebookMaintenanceTask | null) {
  if (!task) return "ثبت نشده";

  if (task.intervalKm && task.intervalMonths) {
    return `هر ${task.intervalKm.toLocaleString("fa-IR")} کیلومتر یا ${task.intervalMonths.toLocaleString("fa-IR")} ماه`;
  }

  if (task.intervalKm) {
    return `هر ${task.intervalKm.toLocaleString("fa-IR")} کیلومتر`;
  }

  if (task.intervalMonths) {
    return `هر ${task.intervalMonths.toLocaleString("fa-IR")} ماه`;
  }

  return "ثبت نشده";
}

function firstNonEmpty(values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

function extractNamedValue(text: string, labels: string[]) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const normalizedLine = normalizeNotebookLine(line);

    for (const label of labels) {
      const normalizedLabel = normalizeNotebookLine(label);
      if (!normalizedLine.startsWith(normalizedLabel)) {
        continue;
      }

      const afterColon = line.split(/[:：]/u).slice(1).join(":").trim();
      if (afterColon) {
        return afterColon.replace(/^[-–—]\s*/u, "").trim();
      }

      const fallback = line.replace(label, "").replace(/^[:：\-\s]+/u, "").trim();
      if (fallback) {
        return fallback;
      }
    }
  }

  return undefined;
}

function extractGearboxType(text: string) {
  if (!text.trim()) {
    return undefined;
  }

  const keywordMappings: Array<[RegExp, string]> = [
    [/\bCVT\b/ui, "CVT"],
    [/دوکلاچه/u, "دوکلاچه"],
    [/\bAMT\b/ui, "AMT"],
    [/تیپ[ -]?ترونیک/u, "تیپ‌ترونیک"],
    [/اتومات/u, "اتومات"],
    [/دستی/u, "دستی"],
  ];

  for (const [pattern, value] of keywordMappings) {
    if (pattern.test(text)) {
      return value;
    }
  }

  return undefined;
}

function deduplicateProducts(products: ProductWithRelations[]) {
  const byId = new Map<string, ProductWithRelations>();

  for (const product of products) {
    if (!byId.has(product.id)) {
      byId.set(product.id, product);
    }
  }

  return Array.from(byId.values());
}

function sortCompatibleProducts(a: ProductWithRelations, b: ProductWithRelations) {
  return (
    Number(b.stock > 0) - Number(a.stock > 0) ||
    Number(b.isBestseller) - Number(a.isBestseller) ||
    Number(b.isFeatured) - Number(a.isFeatured) ||
    b.reviewCount - a.reviewCount ||
    Number(b.averageRating ?? 0) - Number(a.averageRating ?? 0)
  );
}

function serializeNotebookProduct(product: ProductWithRelations): NotebookCompatibleProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brand.name,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    imageUrl: product.imageUrl,
    price: Number(product.price),
    stock: product.stock,
    averageRating: product.averageRating != null ? Number(product.averageRating) : null,
    reviewCount: product.reviewCount,
    viscosity: product.viscosity,
    packagingSizeLit: product.packagingSizeLit != null ? Number(product.packagingSizeLit) : null,
    oilType: product.oilType,
    isFeatured: product.isFeatured,
    isBestseller: product.isBestseller,
  };
}

export function getNotebookProductPanelByPageId(panels: NotebookProductPanel[], pageId: string) {
  return panels.find((panel) => panel.pageId === pageId);
}

export function getNotebookSectionConfigByPageId(pageId: string) {
  return REQUESTED_CAR_NOTEBOOK_SECTION_BY_PAGE_ID.get(pageId);
}
