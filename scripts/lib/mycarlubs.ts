import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  REQUESTED_CAR_NOTEBOOK_CATEGORY_IDS,
  REQUESTED_CAR_NOTEBOOK_SECTION_BY_ID,
  type StoredCarNotebookSection,
} from "../../src/lib/car-notebook-sections";

const MYCARLUBS_ORIGIN = "https://mycarlubs.com";
const DEFAULT_HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json;charset=UTF-8",
  origin: MYCARLUBS_ORIGIN,
  "user-agent": "Mozilla/5.0 (compatible; OilbarBot/1.0; +https://www.oilbar.ir)",
};

const RELEVANT_CATEGORY_IDS = [...new Set([
  ...REQUESTED_CAR_NOTEBOOK_CATEGORY_IDS,
  8,
  11,
  15,
])] as const;

const CATEGORY_TASK_CONFIG: Record<number, { title: string; priority: number }> = {
  1: { title: "تعویض روغن موتور", priority: 1 },
  3: { title: "بازدید یا تعویض روغن گیربکس", priority: 2 },
  4: { title: "تعویض روغن ترمز", priority: 2 },
  5: { title: "تعویض فیلتر روغن", priority: 1 },
  6: { title: "تعویض فیلتر هوا", priority: 2 },
  7: { title: "بازدید یا تعویض ضدیخ", priority: 2 },
  8: { title: "بازدید فیلتر گیربکس", priority: 3 },
  11: { title: "بازدید یا تعویض روغن دیفرانسیل", priority: 3 },
  14: { title: "تعویض فیلتر کابین", priority: 3 },
  15: { title: "بازدید یا تعویض شمع", priority: 3 },
};

const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&zwnj;": "‌",
  "&amp;": "&",
  "&quot;": "\"",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

export type MycarlubsBrandInfo = {
  Id: number;
  Title: string;
  TitleEn: string | null;
  LogoFile: string | null;
};

export type MycarlubsCarListItem = {
  Id: number;
  Title: string;
  TitleEn: string | null;
  carBrand: string;
  CarBrandLogo: string | null;
  CarBrandId: number;
  Image: string | null;
  MachineTypeId: number | null;
};

export type MycarlubsCarModelInfo = {
  Id: number;
  Title: string;
  TitleEn: string | null;
  Description: string | null;
  CarBrandId: number;
  CarBrandTitle: string;
  CarBrandLogo: string | null;
  Image: string | null;
  ConstructionYear: string | null;
  OriginCountry: string | null;
  EngineVolume: string | null;
  CylindersNum: string | null;
  MachineType: number | null;
};

export type MycarlubsCategorySummary = {
  Id: number;
  CategoryId: number;
  CategoryTitle: string;
  CategoryImage: string | null;
};

export type MycarlubsCategoryInfo = {
  Id: number;
  CarId: number;
  CategoryId: number;
  CategoryTitle: string;
  Description: string | null;
  Image: string | null;
  Voice: string | null;
  Video: string | null;
};

export type ImportedMaintenanceTask = {
  title: string;
  description: string | null;
  intervalKm: number | null;
  intervalMonths: number | null;
  priority: number;
  recommendedProductSlugs: string[];
};

export type ImportedCarRecord = {
  slug: string;
  manufacturer: string;
  model: string;
  generation: string | null;
  imageUrl: string | null;
  engineType: string | null;
  engineCode: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  oilCapacityLit: number | null;
  viscosity: string | null;
  specification: string | null;
  overviewDetails: string;
  engineDetails: string;
  gearboxDetails: string;
  maintenanceInfo: string;
  notebookSections: StoredCarNotebookSection[];
  sourceUrls: string[];
  maintenanceTasks: ImportedMaintenanceTask[];
};

type HarvestedCategory = {
  summary: MycarlubsCategorySummary;
  details: MycarlubsCategoryInfo | null;
  plainText: string;
};

type HarvestedBundle = {
  listItem: MycarlubsCarListItem;
  modelInfo: MycarlubsCarModelInfo;
  categories: HarvestedCategory[];
};

type ParsedInterval = {
  intervalKm: number | null;
  intervalMonths: number | null;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loadLocalEnv(filePath = path.join(process.cwd(), ".env")) {
  let content = "";
  try {
    content = await readFile(filePath, "utf8");
  } catch {
    return;
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = rawLine.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = rawLine.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) continue;

    let value = rawLine.slice(separatorIndex + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function normalizeDigits(value: string) {
  const map: Record<string, string> = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٬": "", ",": "",
  };

  return value.replace(/[۰-۹٬,]/g, (digit) => map[digit] ?? digit);
}

function normalizeText(value: string) {
  return normalizeDigits(value)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه");
}

function decodeHtmlEntities(value: string) {
  let decoded = value;
  for (const [entity, replacement] of Object.entries(HTML_ENTITY_MAP)) {
    decoded = decoded.split(entity).join(replacement);
  }
  return decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

export function htmlToPlainText(value: string | null | undefined) {
  if (!value) return "";

  const withBreaks = value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|ul|ol)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n");

  const text = normalizeText(decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, " ")));

  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function uniqueOrdered(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

function buildMycarlubsUrl(pathname: string) {
  return `${MYCARLUBS_ORIGIN}${pathname}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSpacedText(value: string) {
  return normalizeText(value).replace(/\s+/g, " ").trim();
}

function getModelPrefixCandidates(manufacturer?: string, brandTitles: string[] = []) {
  return uniqueOrdered(
    [manufacturer, ...brandTitles]
      .filter(Boolean)
      .flatMap((value) => {
        const normalized = normalizeSpacedText(value ?? "");
        if (!normalized) return [];

        const parts = normalized.split(" ");
        const lastWord = parts.at(-1);

        return lastWord && lastWord.length >= 3
          ? [normalized, lastWord]
          : [normalized];
      }),
  ).sort((left, right) => right.length - left.length);
}

export function normalizeCarModelTitle(title: string, manufacturer?: string, brandTitles: string[] = []) {
  const original = normalizeSpacedText(title);

  let cleaned = original
    .replace(/^ون\s+هیوندای\s+/u, "ون ")
    .replace(/^سواری\s+استیشین\s+هیوندا\s+/u, "سواری استیشین ");

  for (const prefix of getModelPrefixCandidates(manufacturer, brandTitles)) {
    cleaned = cleaned.replace(new RegExp(`^${escapeRegExp(prefix)}(?:(?:\\s+|[-–—/:]+\\s*)|$)`, "u"), "").trim();
  }

  return cleaned || original;
}

function cleanModelTitle(title: string, manufacturer?: string, brandTitles: string[] = []) {
  return normalizeCarModelTitle(title, manufacturer, brandTitles);
}

function parseYearRange(constructionYear: string | null, title: string) {
  const candidate = normalizeText(`${constructionYear ?? ""} ${title}`);
  const years = Array.from(candidate.matchAll(/\b(19\d{2}|20\d{2})\b/g)).map((match) => Number(match[1]));

  if (years.length >= 2) {
    return {
      yearFrom: years[0],
      yearTo: years[years.length - 1],
    };
  }

  if (years.length === 1) {
    return { yearFrom: years[0], yearTo: years[0] };
  }

  return { yearFrom: null, yearTo: null };
}

function parseEngineVolumeLit(engineVolume: string | null) {
  const normalized = normalizeText(engineVolume ?? "").trim();
  if (!normalized) return null;

  const numeric = Number(normalized.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;

  if (numeric >= 1000) {
    return Number((numeric / 1000).toFixed(numeric % 1000 === 0 ? 1 : 2));
  }

  return Number(numeric.toFixed(2));
}

function extractTransmissionType(title: string, titleEn: string | null) {
  const source = `${title} ${titleEn ?? ""}`.toUpperCase();

  if (source.includes("7DCT")) return "7 دنده دوکلاچه";
  if (source.includes("6DCT")) return "6 دنده دوکلاچه";
  if (source.includes("8AT") || source.includes("8SPEED")) return "8 دنده اتومات";
  if (source.includes("7AT")) return "7 دنده اتومات";
  if (source.includes("6AT") || source.includes("ZF6")) return "6 دنده اتومات";
  if (source.includes("5AT")) return "5 دنده اتومات";
  if (source.includes("4AT")) return "4 دنده اتومات";
  if (source.includes("CVT")) return "CVT";
  if (source.includes("7MT")) return "7 دنده دستی";
  if (source.includes("6MT")) return "6 دنده دستی";
  if (source.includes("5MT") || title.includes("دنده ای")) return "5 دنده دستی";
  if (title.includes("اتومات")) return "اتومات";

  return null;
}

function extractEngineCodeFromText(...sources: Array<string | null | undefined>) {
  const joined = normalizeText(sources.filter(Boolean).join(" "));
  const blacklistedModelCodes = new Set(["G70", "G80", "I10", "I20", "I30", "I40", "IX35", "IX55", "H350", "H1", "LF", "NF", "YF", "XD"]);

  const strictMatch = joined.match(/\b([A-Z][A-Z0-9-]{1,6}\d[A-Z0-9-]{0,4})\b/);
  if (strictMatch && !blacklistedModelCodes.has(strictMatch[1].toUpperCase())) return strictMatch[1];

  const hyundaiCode = joined.match(/\b(G4[A-Z0-9]{2,4}|D4[A-Z0-9]{2,4}|THETA(?:\s*II)?|GAMMA|NU|MPI-\d{4}|GDI-\d{4}|T-GDI|CRDI)\b/i);
  if (hyundaiCode) {
    return hyundaiCode[1].replace(/\s+/g, " ").toUpperCase();
  }

  return null;
}

function buildEngineType(modelInfo: MycarlubsCarModelInfo, modelTitle: string) {
  const parts: string[] = [];
  const fuelSource = `${modelTitle} ${modelInfo.TitleEn ?? ""}`.toLowerCase();

  if (modelInfo.CylindersNum?.trim()) {
    parts.push(`${normalizeDigits(modelInfo.CylindersNum.trim())} سیلندر`);
  }

  if (fuelSource.includes("diesel") || modelTitle.includes("دیزل")) {
    parts.push("دیزل");
  } else if (fuelSource.includes("hybrid") || modelTitle.includes("هیبرید")) {
    parts.push("هیبرید");
  } else {
    parts.push("بنزینی");
  }

  if (fuelSource.includes("turbo") || modelTitle.includes("توربو") || fuelSource.includes("t-gdi")) {
    parts.push("توربو");
  }

  if (fuelSource.includes("gdi") || modelTitle.includes("GDi") || modelTitle.includes("GDI")) {
    parts.push("GDI");
  } else if (fuelSource.includes("mpi") || modelTitle.includes("MPi") || modelTitle.includes("MPI")) {
    parts.push("MPI");
  }

  const engineVolumeLit = parseEngineVolumeLit(modelInfo.EngineVolume);
  if (engineVolumeLit) {
    parts.push(`${engineVolumeLit} لیتر`);
  }

  return parts.length ? uniqueOrdered(parts).join(" ") : null;
}

export function extractViscosities(value: string) {
  const normalized = normalizeText(value).toUpperCase();
  const viscosities = Array.from(normalized.matchAll(/\b(?:0W|5W|10W|15W|20W)-\d{2}\b/g)).map((match) => match[0]);
  return uniqueOrdered(viscosities);
}

export function extractOilSpecification(value: string) {
  const normalized = normalizeText(value)
    .replace(/\bPLUS\b/gi, "+")
    .replace(/\s+/g, " ")
    .toUpperCase();

  const apiMatches = Array.from(
    normalized.matchAll(/\bAPI\s*(SN\+|SN|SM|SL|SJ|SP|SQ|CF|CI-4|CJ-4|CH-4|CG-4)\b/g),
  ).map((match) => `API ${match[1]}`);

  const aceaMatches = Array.from(normalized.matchAll(/\bACEA\s*([A-Z]\d(?:\/B\d)?(?:-\d{2})?)\b/g)).map(
    (match) => `ACEA ${match[1]}`,
  );

  const ilsacMatches = Array.from(normalized.matchAll(/\bILSAC\s*(GF-\d[A-Z]?)\b/g)).map(
    (match) => `ILSAC ${match[1]}`,
  );

  const specs = uniqueOrdered([...apiMatches, ...aceaMatches, ...ilsacMatches]);
  return specs.length ? specs.join(" / ") : null;
}

export function extractOilCapacityLit(value: string) {
  const normalized = normalizeText(value).replace(/\s+/g, " ");
  const matches = Array.from(normalized.matchAll(/(\d+(?:\.\d+)?)\s*ل[یي]تر/g));

  if (!matches.length) return null;

  const scored = matches
    .map((match) => {
      const amount = Number(match[1]);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 20) return null;

      const index = match.index ?? 0;
      const context = normalized.slice(Math.max(0, index - 50), Math.min(normalized.length, index + 60));
      let score = 0;

      if (/با\s+تعویض\s+فیلتر|با\s+فیلتر/.test(context)) score += 5;
      if (/حجم\s+روغن\s+موتور|مقدار/.test(context)) score += 3;
      if (/بدون\s+تعویض\s+فیلتر|بدون\s+فیلتر/.test(context)) score -= 4;
      if (/تهیه\s+نمایید|تهي[هە]\s+نماييد|برای یک سرویس/.test(context)) score -= 3;
      if (/DRY\s*FILL/i.test(context)) score -= 4;

      return { amount, score, index };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  return scored[0]?.amount ?? null;
}

export function extractServiceInterval(value: string): ParsedInterval {
  const normalized = normalizeText(value).replace(/\s+/g, " ");

  const kmMatches = Array.from(normalized.matchAll(/(\d{3,6})\s*ک[یي]لومتر/g))
    .map((match) => Number(match[1]))
    .filter((distance) => distance >= 1000 && distance <= 300000);

  const monthMatches = Array.from(normalized.matchAll(/(\d{1,2})\s*ماه/g))
    .map((match) => Number(match[1]))
    .filter((months) => months > 0 && months <= 60);

  const yearMatches = Array.from(normalized.matchAll(/(\d{1,2})\s*سال/g))
    .map((match) => Number(match[1]) * 12)
    .filter((months) => months > 0 && months <= 120);

  return {
    intervalKm: kmMatches[0] ?? null,
    intervalMonths: monthMatches[0] ?? yearMatches[0] ?? null,
  };
}

function compactText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}…`;
}

function buildSourceUrls(carId: number, categories: HarvestedCategory[]) {
  const urls = [buildMycarlubsUrl(`/car_details/${carId}`)];

  for (const category of categories) {
    urls.push(buildMycarlubsUrl(`/car_details/${carId}/category/${category.summary.CategoryId}`));
  }

  return uniqueOrdered(urls);
}

function buildOverviewDetails(bundle: HarvestedBundle, manufacturer: string, model: string, sourceUrls: string[]) {
  const { modelInfo, categories } = bundle;
  const availableCategories = uniqueOrdered(categories.map((category) => category.summary.CategoryTitle.trim())).join("، ");
  const engineVolumeLit = parseEngineVolumeLit(modelInfo.EngineVolume);
  const lines = [
    `${manufacturer} ${model}`,
    modelInfo.ConstructionYear ? `سال ساخت در منبع: ${modelInfo.ConstructionYear.trim()}` : null,
    modelInfo.OriginCountry?.trim() ? `کشور سازنده: ${modelInfo.OriginCountry.trim()}` : null,
    modelInfo.CylindersNum?.trim() ? `تعداد سیلندر: ${normalizeDigits(modelInfo.CylindersNum.trim())}` : null,
    engineVolumeLit ? `حجم موتور: ${engineVolumeLit} لیتر` : null,
    availableCategories ? `دسته‌های سرویس موجود در منبع: ${availableCategories}` : null,
    modelInfo.Description ? htmlToPlainText(modelInfo.Description) : null,
    `منبع صفحه خودرو: ${sourceUrls[0]}`,
  ].filter(Boolean);

  return lines.join("\n");
}

function buildEngineDetails(
  bundle: HarvestedBundle,
  engineType: string | null,
  engineCode: string | null,
  viscosity: string | null,
  specification: string | null,
  oilCapacityLit: number | null,
) {
  const engineOilCategory = bundle.categories.find((category) => category.summary.CategoryId === 1);
  const lines = [
    engineType ? `نوع موتور: ${engineType}` : null,
    engineCode ? `کد یا خانواده موتور: ${engineCode}` : null,
    viscosity ? `ویسکوزیته پیشنهادی روغن موتور: ${viscosity}` : "ویسکوزیته پیشنهادی روغن موتور در منبع ثبت نشده است.",
    specification ? `استاندارد روغن موتور: ${specification}` : "استاندارد روغن موتور در منبع ثبت نشده است.",
    oilCapacityLit != null ? `حجم سرویس روغن موتور: ${oilCapacityLit} لیتر` : "حجم سرویس روغن موتور در منبع ثبت نشده است.",
    engineOilCategory?.plainText ? compactText(engineOilCategory.plainText, 3000) : null,
    `منبع روغن موتور: ${buildMycarlubsUrl(`/car_details/${bundle.modelInfo.Id}/category/1`)}`,
  ].filter(Boolean);

  return lines.join("\n");
}

function buildGearboxDetails(bundle: HarvestedBundle, transmissionType: string | null) {
  const gearboxCategory = bundle.categories.find((category) => category.summary.CategoryId === 3);
  const lines = [
    transmissionType ? `نوع گیربکس: ${transmissionType}` : "نوع گیربکس از متن منبع به‌صورت صریح استخراج نشد.",
    gearboxCategory?.plainText ? compactText(gearboxCategory.plainText, 3000) : "اطلاعات روغن گیربکس در منبع برای این مدل ثبت نشده است.",
    `منبع روغن گیربکس: ${buildMycarlubsUrl(`/car_details/${bundle.modelInfo.Id}/category/3`)}`,
  ];

  return lines.join("\n");
}

function buildNotebookSections(bundle: HarvestedBundle): StoredCarNotebookSection[] {
  return bundle.categories
    .filter((category) => REQUESTED_CAR_NOTEBOOK_SECTION_BY_ID.has(category.summary.CategoryId))
    .map((category) => {
      const config = REQUESTED_CAR_NOTEBOOK_SECTION_BY_ID.get(category.summary.CategoryId)!;
      return {
        categoryId: config.categoryId,
        id: config.id,
        title: config.title,
        tag: config.tag,
        sourceTitle: category.summary.CategoryTitle.trim(),
        description: category.plainText,
        sourceUrl: buildMycarlubsUrl(`/car_details/${bundle.modelInfo.Id}/category/${category.summary.CategoryId}`),
      } satisfies StoredCarNotebookSection;
    })
    .sort((left, right) => left.categoryId - right.categoryId);
}

function buildMaintenanceSummary(bundle: HarvestedBundle) {
  const sections = bundle.categories
    .filter((category) => category.plainText)
    .map((category) => `${category.summary.CategoryTitle.trim()}: ${compactText(category.plainText, 450)}`);

  if (sections.length === 0) {
    return `در منبع مای‌کارلوبس برای این مدل، متن سرویس دوره‌ای کامل ثبت نشده است.\nصفحه خودرو: ${buildMycarlubsUrl(`/car_details/${bundle.modelInfo.Id}`)}`;
  }

  return [
    "خلاصه اقلام و سرویس‌های ثبت‌شده در منبع:",
    ...sections,
    `صفحه خودرو: ${buildMycarlubsUrl(`/car_details/${bundle.modelInfo.Id}`)}`,
  ].join("\n");
}

function buildMaintenanceTasks(bundle: HarvestedBundle) {
  return bundle.categories
    .filter((category) => category.plainText && CATEGORY_TASK_CONFIG[category.summary.CategoryId])
    .map((category) => {
      const config = CATEGORY_TASK_CONFIG[category.summary.CategoryId];
      const interval = extractServiceInterval(category.plainText);

      return {
        title: config.title,
        description: compactText(category.plainText, 1400),
        intervalKm: interval.intervalKm,
        intervalMonths: interval.intervalMonths,
        priority: config.priority,
        recommendedProductSlugs: [],
      } satisfies ImportedMaintenanceTask;
    });
}

async function fetchJson<T>(url: string, init: RequestInit, retries = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...DEFAULT_HEADERS,
          ...(init.headers ?? {}),
        },
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status} ${response.statusText} for ${url}`);
      }

      return await response.json() as T;
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await sleep(500 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Unknown fetch error for ${url}`);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
) {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

export async function fetchMycarlubsBrandInfo(brandId: number) {
  return fetchJson<MycarlubsBrandInfo>(
    `${MYCARLUBS_ORIGIN}/api/car_brand_info?id=${brandId}`,
    {
      method: "POST",
      body: "{}",
      headers: {
        referer: `${MYCARLUBS_ORIGIN}/cars?id=${brandId}`,
      },
    },
  );
}

export async function fetchMycarlubsBrandCars(brandId: number) {
  const firstPage = await fetchJson<{ data: MycarlubsCarListItem[]; count: number; page_size: number }>(
    `${MYCARLUBS_ORIGIN}/api/car_list`,
    {
      method: "POST",
      body: JSON.stringify({
        pageNumber: 1,
        brand: brandId,
        keyword: "",
      }),
      headers: {
        referer: `${MYCARLUBS_ORIGIN}/cars?id=${brandId}`,
      },
    },
  );

  const totalPages = Math.ceil(firstPage.count / Math.max(firstPage.page_size, 1));
  const pages = await mapWithConcurrency(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => index + 2),
    3,
    async (page) => {
      const response = await fetchJson<{ data: MycarlubsCarListItem[] }>(
        `${MYCARLUBS_ORIGIN}/api/car_list`,
        {
          method: "POST",
          body: JSON.stringify({
            pageNumber: page,
            brand: brandId,
            keyword: "",
          }),
          headers: {
            referer: `${MYCARLUBS_ORIGIN}/cars?id=${brandId}`,
          },
        },
      );

      return response.data;
    },
  );

  return [firstPage.data, ...pages].flat();
}

export async function fetchMycarlubsCarBundle(car: MycarlubsCarListItem): Promise<HarvestedBundle> {
  const [modelInfo, categorySummaries] = await Promise.all([
    fetchJson<MycarlubsCarModelInfo>(
      `${MYCARLUBS_ORIGIN}/api/car_model_info?id=${car.Id}`,
      {
        method: "POST",
        body: "{}",
        headers: {
          referer: `${MYCARLUBS_ORIGIN}/car_details/${car.Id}`,
        },
      },
    ),
    fetchJson<MycarlubsCategorySummary[]>(
      `${MYCARLUBS_ORIGIN}/api/car_category_list`,
      {
        method: "POST",
        body: JSON.stringify({
          car_id: car.Id,
          paginate_option: false,
        }),
        headers: {
          referer: `${MYCARLUBS_ORIGIN}/car_details/${car.Id}`,
        },
      },
    ),
  ]);

  const relevantSummaries = categorySummaries.filter((category) =>
    RELEVANT_CATEGORY_IDS.includes(category.CategoryId as (typeof RELEVANT_CATEGORY_IDS)[number]),
  );

  const categories = await mapWithConcurrency(relevantSummaries, 4, async (summary) => {
    const details = await fetchJson<MycarlubsCategoryInfo>(
      `${MYCARLUBS_ORIGIN}/api/car_category_info?car=${car.Id}&category=${summary.CategoryId}`,
      {
        method: "POST",
        body: "{}",
        headers: {
          referer: `${MYCARLUBS_ORIGIN}/car_details/${car.Id}/category/${summary.CategoryId}`,
        },
      },
    ).catch(() => null);

    return {
      summary,
      details,
      plainText: htmlToPlainText(details?.Description),
    } satisfies HarvestedCategory;
  });

  return {
    listItem: car,
    modelInfo,
    categories,
  };
}

export function buildImportedCarRecord(bundle: HarvestedBundle, manufacturer: string): ImportedCarRecord {
  const model = cleanModelTitle(bundle.modelInfo.Title, manufacturer, [
    bundle.modelInfo.CarBrandTitle,
    bundle.listItem.carBrand,
  ]);
  const sourceUrls = buildSourceUrls(bundle.modelInfo.Id, bundle.categories);
  const yearRange = parseYearRange(bundle.modelInfo.ConstructionYear, bundle.modelInfo.Title);
  const engineOilText = bundle.categories.find((category) => category.summary.CategoryId === 1)?.plainText ?? "";
  const viscosities = extractViscosities(engineOilText);
  const viscosity = viscosities.length ? viscosities.slice(0, 4).join(" / ") : null;
  const specification = extractOilSpecification(engineOilText);
  const oilCapacityLit = extractOilCapacityLit(engineOilText);
  const engineCode = extractEngineCodeFromText(
    engineOilText,
    bundle.categories.find((category) => category.summary.CategoryId === 3)?.plainText,
    bundle.modelInfo.Title,
    bundle.modelInfo.TitleEn,
  );
  const engineType = buildEngineType(bundle.modelInfo, model);
  const transmissionType = extractTransmissionType(bundle.modelInfo.Title, bundle.modelInfo.TitleEn);
  const maintenanceTasks = buildMaintenanceTasks(bundle);
  const imageUrl = bundle.modelInfo.Image
    ? buildMycarlubsUrl(`/storage/car_models/image/${bundle.modelInfo.Id}/${bundle.modelInfo.Image.split(",")[0]}`)
    : null;

  return {
    slug: `hyundai-${bundle.modelInfo.Id}-${slugify(bundle.modelInfo.TitleEn ?? bundle.modelInfo.Title)}`,
    manufacturer,
    model,
    generation: null,
    imageUrl,
    engineType,
    engineCode,
    yearFrom: yearRange.yearFrom,
    yearTo: yearRange.yearTo,
    oilCapacityLit,
    viscosity,
    specification,
    overviewDetails: buildOverviewDetails(bundle, manufacturer, model, sourceUrls),
    engineDetails: buildEngineDetails(bundle, engineType, engineCode, viscosity, specification, oilCapacityLit),
    gearboxDetails: buildGearboxDetails(bundle, transmissionType),
    maintenanceInfo: buildMaintenanceSummary(bundle),
    notebookSections: buildNotebookSections(bundle),
    sourceUrls,
    maintenanceTasks,
  };
}

export async function harvestMycarlubsBrandCars(options: {
  brandId: number;
  manufacturer?: string;
  limit?: number;
  concurrency?: number;
}) {
  const brand = await fetchMycarlubsBrandInfo(options.brandId);
  const manufacturer = options.manufacturer?.trim() || brand.Title.trim();
  const listedCars = await fetchMycarlubsBrandCars(options.brandId);
  const cars = options.limit && options.limit > 0 ? listedCars.slice(0, options.limit) : listedCars;

  const bundles = await mapWithConcurrency(cars, options.concurrency ?? 4, async (car, index) => {
    const bundle = await fetchMycarlubsCarBundle(car);
    console.log(`[${index + 1}/${cars.length}] ${bundle.modelInfo.Title}`);
    return bundle;
  });

  const records = bundles.map((bundle) => buildImportedCarRecord(bundle, manufacturer));

  return {
    brand,
    records,
  };
}
