import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type BamaDraftModel = {
  brandSlug: string;
  modelSlug: string;
  bamaUrl: string;
  imageUrl: string | null;
};

type BamaVehicleDetail = BamaDraftModel & {
  title: string;
  description: string | null;
  reviewBody: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  imageUrl: string | null;
  specs: Record<string, string>;
  engineType: string | null;
  engineDisplacement: string | null;
  gearbox: string | null;
  driveType: string | null;
};

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\u002F/g, "/")
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

function persianDigitsToEnglish(value: string) {
  const map: Record<string, string> = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  return value.replace(/[۰-۹٠-٩]/g, (digit) => map[digit] ?? digit);
}

function persianYearToGregorian(year: number) {
  if (year >= 1300 && year <= 1500) return year + 621;
  return year;
}

function parseYearRange(title: string) {
  const normalized = persianDigitsToEnglish(title);
  const match = normalized.match(/سال\s+(\d{4})(?:\s*[-تا]+\s*(\d{4}))?/);
  if (!match) return { yearFrom: null, yearTo: null };
  const yearFrom = persianYearToGregorian(Number(match[1]));
  const yearTo = persianYearToGregorian(Number(match[2] ?? match[1]));
  return {
    yearFrom: Number.isFinite(yearFrom) ? yearFrom : null,
    yearTo: Number.isFinite(yearTo) ? yearTo : null,
  };
}

function getMetaContent(html: string, name: string) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i");
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]) : null;
}

function getJsonLdReviewBody(html: string) {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/g) ?? [];

  for (const script of scripts) {
    const content = decodeHtml(script.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""));
    try {
      const parsed = JSON.parse(content);
      if (parsed?.["@type"] === "Review" && typeof parsed.reviewBody === "string") {
        return parsed.reviewBody.trim();
      }
    } catch {
      // Some JSON-LD blocks contain HTML escaped text. Ignore malformed blocks.
    }
  }

  return null;
}

function extractSpecs(html: string) {
  const specs: Record<string, string> = {};
  const pattern =
    /<div class="spec-item"[\s\S]*?<h3 class="spec-item__title"[^>]*>([\s\S]*?)<\/h3>\s*<span class="spec-item__value"[^>]*>([\s\S]*?)<\/span>/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html))) {
    const key = stripTags(match[1]);
    const value = stripTags(match[2]);
    if (key && value && value !== "false") {
      specs[key] = value;
    }
  }

  return specs;
}

async function fetchText(url: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(45_000),
        headers: {
          "user-agent": "Oilbar vehicle research bot; contact: support@oilbar.ir",
          accept: "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) {
        throw new Error(`Bama detail request failed ${response.status}: ${url}`);
      }

      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function main() {
  const inputPath = process.argv[2] ?? path.join(process.cwd(), "tmp", "bama-vehicles-draft.json");
  const limit = process.env.BAMA_DETAIL_LIMIT ? Number(process.env.BAMA_DETAIL_LIMIT) : undefined;
  const draft = JSON.parse(await readFile(inputPath, "utf8")) as BamaDraftModel[];
  const details: BamaVehicleDetail[] = [];
  const failures: { bamaUrl: string; error: string }[] = [];
  const items = Number.isFinite(limit) ? draft.slice(0, limit) : draft;

  for (const [index, item] of items.entries()) {
    console.log(`[${index + 1}/${items.length}] ${item.bamaUrl}`);
    try {
      const html = await fetchText(item.bamaUrl);
      const rawTitle = getMetaContent(html, "title") ?? "";
      const title = rawTitle.replace(/\s*\|\s*باما\s*$/, "").trim();
      const specs = extractSpecs(html);
      const { yearFrom, yearTo } = parseYearRange(title);
      const imageUrl = getMetaContent(html, "og:image") ?? item.imageUrl;

      details.push({
        ...item,
        title,
        description: getMetaContent(html, "description"),
        reviewBody: getJsonLdReviewBody(html),
        yearFrom,
        yearTo,
        imageUrl,
        specs,
        engineType: specs["پیشرانه"] ?? null,
        engineDisplacement: specs["حجم موتور"] ?? null,
        gearbox: specs["گیربکس"] ?? null,
        driveType: specs["محور محرک"] ?? null,
      });
    } catch (error) {
      failures.push({
        bamaUrl: item.bamaUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      console.warn(`Failed ${item.bamaUrl}: ${failures.at(-1)?.error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  const outputDir = path.join(process.cwd(), "tmp");
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "bama-vehicle-details.json"), `${JSON.stringify(details, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputDir, "bama-vehicle-detail-failures.json"), `${JSON.stringify(failures, null, 2)}\n`, "utf8");
  console.log(`Wrote ${details.length} Bama detail records.`);
  console.log(`Failed ${failures.length} Bama detail records.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
