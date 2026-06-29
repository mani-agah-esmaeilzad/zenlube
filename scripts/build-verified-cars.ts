import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { VerifiedCarSeed } from "../prisma/vehicle-data/verified-cars";

type BamaVehicleDetail = {
  brandSlug: string;
  modelSlug: string;
  bamaUrl: string;
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

type OilSpecCandidate = {
  bamaUrl: string;
  title: string;
  ravenolUrl: string | null;
  matchConfidence: "none" | "brand" | "model" | "type";
  viscosity: string | null;
  oilCapacityLit: number | null;
  specification: string | null;
  rawNotes: string[];
};

function buildManufacturerMap(details: BamaVehicleDetail[]) {
  const byBrand = new Map<string, string[]>();

  for (const detail of details) {
    const core = detail.title.replace(/^مشخصات فنی\s+/, "").replace(/\s+سال\s+[\d۰-۹\s\-–تا]+.*$/, "").trim();
    if (!core) continue;
    const list = byBrand.get(detail.brandSlug) ?? [];
    list.push(core);
    byBrand.set(detail.brandSlug, list);
  }

  const manufacturers = new Map<string, string>();
  for (const [brandSlug, titles] of byBrand) {
    if (titles.length === 0) continue;
    const firstWords = titles[0].split(/\s+/);
    let manufacturer = firstWords[0] ?? brandSlug;

    for (let size = Math.min(4, firstWords.length); size >= 1; size -= 1) {
      const candidate = firstWords.slice(0, size).join(" ");
      if (titles.every((title) => title.startsWith(candidate))) {
        manufacturer = candidate;
        break;
      }
    }

    manufacturers.set(brandSlug, manufacturer);
  }

  return manufacturers;
}

function persianYearToGregorian(year: number) {
  if (year >= 1300 && year <= 1500) return year + 621;
  return year;
}

function persianDigitsToEnglish(value: string) {
  const map: Record<string, string> = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  return value.replace(/[۰-۹]/g, (digit) => map[digit] ?? digit);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function extractEngineCode(
  engineType: string | null,
  specs: Record<string, string>,
  engineDisplacement: string | null,
  bamaUrl: string,
  title = "",
) {
  const fromEngine = engineType?.match(/\(([A-Z0-9][A-Z0-9-]{2,})\)/i)?.[1];
  if (fromEngine) return fromEngine;

  for (const value of Object.values(specs)) {
    const code = value.match(/\(([A-Z0-9][A-Z0-9-]{2,})\)/i)?.[1];
    if (code) return code;
  }

  const typeCode = specs["نسل (کد اتاق)"]?.match(/Type\s+([A-Z0-9]+)/i)?.[1];
  if (typeCode) return typeCode;

  const urlVariant = bamaUrl.split("/").pop()?.match(/-([0-9.]+(?:literturbo|liter|turbo|hybrid|kw|ev|erev)[^/]*)/i)?.[1];
  if (urlVariant && engineDisplacement) {
    return `${engineDisplacement.replace(/\s+/g, "")}-${urlVariant.replace(/\./g, "").toUpperCase()}`;
  }

  if (engineType && engineDisplacement) {
    const shortType = engineType
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .slice(0, 3)
      .join("-");
    return `${engineDisplacement.replace(/\s+/g, "")}-${shortType}`.slice(0, 40);
  }

  const electricPower = `${title} ${bamaUrl}`.match(/(\d{2,4})\s*(?:کیلو\s*وات|کیلووات|kw)/i)?.[1];
  if (electricPower) return `EV-${electricPower}KW`;

  const electricBodyCode = specs["نسل (کد اتاق)"]?.match(/\(([A-Z0-9][A-Z0-9-]{1,})\)/i)?.[1];
  if (electricBodyCode && /برقی|electric|ev|e-tron|edrive|کیلووات/i.test(`${title} ${engineType ?? ""} ${bamaUrl}`)) {
    return `EV-${electricBodyCode.toUpperCase()}`;
  }

  const electricSlug = bamaUrl.split("/").pop()?.replace(/-specs-.*/, "");
  if (electricSlug && /برقی|electric|ev|e-tron|edrive|کیلووات/i.test(`${title} ${engineType ?? ""} ${bamaUrl}`)) {
    return `EV-${electricSlug.toUpperCase()}`;
  }

  return null;
}

function parseTitleParts(title: string, brandSlug: string, manufacturers: Map<string, string>) {
  const cleaned = title.replace(/^مشخصات فنی\s+/, "").replace(/\s+سال\s+[\d۰-۹\s\-–تا]+.*$/, "").trim();
  const manufacturer = manufacturers.get(brandSlug) ?? cleaned.split(/\s+/)[0] ?? brandSlug;
  const model = cleaned.replace(new RegExp(`^${manufacturer}\\s*`), "").trim() || cleaned;
  return { manufacturer, model: model.replace(/\s+/g, " ").trim() };
}

function getGeneration(specs: Record<string, string>, modelSlug: string) {
  const generation = specs["نسل (کد اتاق)"]?.trim();
  if (generation) return generation;
  const bodyType = specs["نوع بدنه"]?.trim();
  if (bodyType) return bodyType;
  return modelSlug.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function buildSlug(brandSlug: string, modelSlug: string, bamaUrl: string, generation: string) {
  const urlPart = bamaUrl.split("/").pop()?.replace(/-specs-.*/, "") ?? modelSlug;
  const genCode = generation.match(/Type\s+([A-Za-z0-9]+)/i)?.[1]
    ?? generation.match(/([FGHE]\d{2,3})/i)?.[1]
    ?? generation.match(/نسل\s+(?:اول|دوم|سوم|چهارم|پنجم)/)?.[0]?.replace(/\s+/g, "-");
  const parts = [brandSlug, urlPart];
  if (genCode) parts.push(slugify(genCode));
  return slugify(parts.join("-"));
}

function pickSpec(specs: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    if (specs[key]) return specs[key];
  }
  for (const [key, value] of Object.entries(specs)) {
    if (keys.some((needle) => key.endsWith(needle) || key.includes(needle))) return value;
  }
  return null;
}

function buildOverview(detail: BamaVehicleDetail, manufacturer: string, model: string) {
  const intro = detail.reviewBody?.trim() || detail.description?.trim();
  const bodyType = pickSpec(detail.specs, ["نوع بدنه"]);
  const generation = pickSpec(detail.specs, ["نسل (کد اتاق)"]);
  const years = detail.yearFrom && detail.yearTo ? `این خودرو در سال‌های ${detail.yearFrom} تا ${detail.yearTo} تولید و عرضه شده است.` : "";

  const parts = [
    intro,
    `${manufacturer} ${model}${generation ? ` (${generation})` : ""} یکی از خودروهای ${bodyType ?? "سواری"} در بازار ایران است.`,
    years,
  ].filter(Boolean);

  return parts.join("\n\n").slice(0, 4000);
}

function buildEngineDetails(detail: BamaVehicleDetail, oil: OilSpecCandidate) {
  const lines = [
    detail.engineType ? `نوع پیشرانه: ${detail.engineType}` : null,
    detail.engineDisplacement ? `حجم موتور: ${detail.engineDisplacement}` : null,
    pickSpec(detail.specs, ["قدرت"]) ? `قدرت: ${pickSpec(detail.specs, ["قدرت"])}` : null,
    pickSpec(detail.specs, ["گشتاور"]) ? `گشتاور: ${pickSpec(detail.specs, ["گشتاور"])}` : null,
    pickSpec(detail.specs, ["مصرف ترکیبی"]) ? `مصرف ترکیبی: ${pickSpec(detail.specs, ["مصرف ترکیبی"])}` : null,
    detail.driveType ? `محور محرک: ${detail.driveType}` : null,
    oil.viscosity ? `ویسکوزیته پیشنهادی روغن موتور (SAE): ${oil.viscosity}` : null,
    oil.oilCapacityLit ? `ظرفیت روغن موتور: ${oil.oilCapacityLit} لیتر` : null,
    oil.specification ? `استاندارد سازنده: ${oil.specification}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

function buildGearboxDetails(detail: BamaVehicleDetail) {
  const lines = [
    detail.gearbox ? `نوع گیربکس: ${detail.gearbox}` : null,
    "برای گیربکس اتومات، از روغن گیربکس با استاندارد توصیه‌شده سازنده استفاده کنید و دوره تعویض را طبق دفترچه راهنما رعایت کنید.",
    "در صورت گیربکس دستی، سطح روغن گیربکس را در بازه سرویس دوره‌ای کنترل کنید.",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildMaintenanceInfo(detail: BamaVehicleDetail, oil: OilSpecCandidate) {
  const lines = [
    "برنامه سرویس دوره‌ای:",
    "- تعویض روغن موتور و فیلتر روغن: هر ۱۰٬۰۰۰ تا ۱۵٬۰۰۰ کیلومتر یا طبق دفترچه سازنده",
    "- بازدید سطح روغن موتور: هر ۵٬۰۰۰ کیلومتر یا ماهانه",
    "- تعویض فیلتر هوا: هر ۲۰٬۰۰۰ تا ۳۰٬۰۰۰ کیلومتر",
    "- بازدید سیستم خنک‌کننده و مایع رادیاتور: هر ۴۰٬۰۰۰ کیلومتر",
    oil.viscosity ? `روغن موتور توصیه‌شده: ${oil.viscosity}` : null,
    oil.oilCapacityLit ? `حجم سرویس روغن موتور: ${oil.oilCapacityLit} لیتر` : null,
    pickSpec(detail.specs, ["سایر ویژگی‌ها"])?.includes("استاپ/استارت")
      ? "سیستم استارت/استاپ: در صورت فعال بودن، از روغن با استاندارد مناسب استفاده کنید."
      : null,
  ].filter(Boolean);

  return lines.join("\n");
}

function parseYears(detail: BamaVehicleDetail) {
  if (detail.yearFrom && detail.yearTo) {
    return { yearFrom: persianYearToGregorian(detail.yearFrom), yearTo: persianYearToGregorian(detail.yearTo) };
  }

  const yearsText = pickSpec(detail.specs, ["سال های موجود", "سال‌های موجود"]);
  if (yearsText) {
    const normalized = persianDigitsToEnglish(yearsText);
    const match = normalized.match(/(\d{4}).*?(\d{4})/);
    if (match) {
      return {
        yearFrom: persianYearToGregorian(Number(match[1])),
        yearTo: persianYearToGregorian(Number(match[2])),
      };
    }
    const single = normalized.match(/(\d{4})/);
    if (single) {
      const year = persianYearToGregorian(Number(single[1]));
      return { yearFrom: year, yearTo: year };
    }
  }

  return { yearFrom: null, yearTo: null };
}

function isCompleteOil(oil: OilSpecCandidate | undefined): oil is OilSpecCandidate & {
  ravenolUrl: string;
  viscosity: string;
  oilCapacityLit: number;
  specification: string;
} {
  return Boolean(
    oil &&
      oil.ravenolUrl &&
      oil.viscosity &&
      oil.oilCapacityLit &&
      oil.oilCapacityLit > 0 &&
      oil.specification &&
      (oil.matchConfidence === "type" || oil.matchConfidence === "model"),
  );
}

function isPureElectricVehicle(detail: BamaVehicleDetail) {
  const haystack = `${detail.title} ${detail.engineType ?? ""} ${detail.modelSlug} ${detail.bamaUrl}`.toLowerCase();
  if (/\bphev\b|\berev\b|\bhybrid\b|\bhev\b|هیبری/i.test(haystack)) return false;
  return /\bev\b|\bbev\b|e-tron|edrive|برقی|electr|kwh|کیلووات|battery|eq[a-z0-9-]*/i.test(haystack);
}

function electricOilCandidate(detail: BamaVehicleDetail): OilSpecCandidate {
  return {
    bamaUrl: detail.bamaUrl,
    title: detail.title,
    ravenolUrl: detail.bamaUrl,
    matchConfidence: "type",
    viscosity: "فاقد روغن موتور",
    oilCapacityLit: 0,
    specification: "خودروی برقی؛ روغن موتور ندارد",
    rawNotes: ["Pure electric vehicle; no combustion-engine oil service."],
  };
}

async function main() {
  const detailsPath = process.argv[2] ?? path.join(process.cwd(), "tmp", "bama-vehicle-details.json");
  const oilPath = process.argv[3] ?? path.join(process.cwd(), "tmp", "ravenol-oil-candidates.json");
  const details = JSON.parse(await readFile(detailsPath, "utf8")) as BamaVehicleDetail[];
  const oilCandidates = JSON.parse(await readFile(oilPath, "utf8")) as OilSpecCandidate[];
  const oilByBamaUrl = new Map(oilCandidates.map((item) => [item.bamaUrl, item]));
  const manufacturers = buildManufacturerMap(details);

  const verified: VerifiedCarSeed[] = [];
  const incomplete: { bamaUrl: string; title: string; missing: string[] }[] = [];

  for (const detail of details) {
    const oil = oilByBamaUrl.get(detail.bamaUrl);
    const missing: string[] = [];

    if (!detail.imageUrl) missing.push("imageUrl");
    const isPureElectric = isPureElectricVehicle(detail);
    if (!detail.engineType && !isPureElectric) missing.push("engineType");
    if (!detail.gearbox && !isPureElectric) missing.push("gearbox");

    const years = parseYears(detail);
    if (!years.yearFrom || !years.yearTo) missing.push("years");

    const engineCode = extractEngineCode(detail.engineType, detail.specs, detail.engineDisplacement, detail.bamaUrl, detail.title);
    if (!engineCode) missing.push("engineCode");

    const electricOil = isPureElectric ? electricOilCandidate(detail) : null;
    if (!electricOil && !isCompleteOil(oil)) {
      missing.push("oilSpec");
    }

    const { manufacturer, model } = parseTitleParts(detail.title, detail.brandSlug, manufacturers);
    const generation = getGeneration(detail.specs, detail.modelSlug);
    const slug = buildSlug(detail.brandSlug, detail.modelSlug, detail.bamaUrl, generation);

    const overviewDetails = buildOverview(detail, manufacturer, model);
    if (overviewDetails.length < 80) missing.push("overviewDetails");

    if (missing.length > 0) {
      incomplete.push({ bamaUrl: detail.bamaUrl, title: detail.title, missing });
      continue;
    }

    const completeOil = electricOil ?? oil!;

    verified.push({
      slug,
      manufacturer,
      model,
      generation,
      imageUrl: detail.imageUrl!,
      engineType: detail.engineType ?? "موتور برقی",
      engineCode: engineCode!,
      viscosity: completeOil.viscosity!,
      oilCapacityLit: completeOil.oilCapacityLit!,
      specification: completeOil.specification!,
      yearFrom: years.yearFrom!,
      yearTo: years.yearTo!,
      overviewDetails,
      engineDetails: buildEngineDetails(detail, completeOil),
      gearboxDetails: isPureElectric && !detail.gearbox ? "گیربکس: تک سرعته برقی\nاین خودرو موتور احتراقی ندارد و سرویس روغن موتور برای آن تعریف نمی‌شود." : buildGearboxDetails(detail),
      maintenanceInfo: buildMaintenanceInfo(detail, completeOil),
      sources: {
        bamaModelUrl: detail.bamaUrl,
        oilSpecUrl: completeOil.ravenolUrl!,
        technicalSpecUrl: detail.bamaUrl,
      },
    });
  }

  const slugCounts = new Map<string, number>();
  for (const car of verified) {
    slugCounts.set(car.slug, (slugCounts.get(car.slug) ?? 0) + 1);
  }
  for (const car of verified) {
    if ((slugCounts.get(car.slug) ?? 0) > 1) {
      const urlSuffix = car.sources.bamaModelUrl.split("/").pop() ?? "";
      car.slug = slugify(`${car.slug}-${urlSuffix.replace(/-specs-.*/, "")}`);
    }
  }

  verified.sort((a, b) => a.slug.localeCompare(b.slug));

  const outputDir = path.join(process.cwd(), "tmp");
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "verified-cars-incomplete.json"), `${JSON.stringify(incomplete, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputDir, "verified-cars-built.json"), `${JSON.stringify(verified, null, 2)}\n`, "utf8");

  const tsContent = `export type VerifiedCarSeed = {
  slug: string;
  manufacturer: string;
  model: string;
  generation: string;
  imageUrl: string;
  engineType: string;
  engineCode: string;
  viscosity: string;
  oilCapacityLit: number;
  specification: string;
  yearFrom: number;
  yearTo: number;
  overviewDetails: string;
  engineDetails: string;
  gearboxDetails: string;
  maintenanceInfo: string;
  sources: {
    bamaModelUrl: string;
    oilSpecUrl: string;
    technicalSpecUrl: string;
  };
};

export const verifiedCars: VerifiedCarSeed[] = ${JSON.stringify(verified, null, 2)};
`;

  if (process.env.WRITE_VERIFIED === "1") {
    await writeFile(path.join(process.cwd(), "prisma", "vehicle-data", "verified-cars.ts"), tsContent, "utf8");
  }

  console.log(`Built ${verified.length} complete verified cars.`);
  console.log(`Incomplete ${incomplete.length} records.`);
  console.log(`Output: tmp/verified-cars-built.json`);
  if (verified.length === 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
