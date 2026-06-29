import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type BamaVehicleDetail = {
  brandSlug: string;
  modelSlug: string;
  bamaUrl: string;
  title: string;
  engineType: string | null;
  engineDisplacement: string | null;
  yearFrom: number | null;
  yearTo: number | null;
};

type SearchResult = {
  type_id: string;
  make: string;
  model: string;
  type: string;
  year_start: string;
  year_end: string;
  fuel: string;
  engine_code: string | null;
  power_hp: string | null;
  power_kw: string | null;
  name: string;
};

type Recommendation = {
  heading?: string;
  components?: {
    name: string;
    code: string;
    capacities?: Record<string, { value: string | null; unit: string; condition: string }[]>;
    products?: { name: string; productNote?: string; url: string; description?: string }[];
  }[];
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

const baseUrl = "https://www.liqui-moly.com/en/";
const clientId = "101";
const pageCache = new Map<string, string>();
const jsonCache = new Map<string, unknown>();

const makeAliases: Record<string, string[]> = {
  arisun: ["IKCO Arisun", "Iran Khodro Arisun"],
  dena: ["IKCO Dena"],
  peugeot: ["Peugeot"],
  pride: ["Saipa Pride"],
  quick: ["Saipa Quick"],
  runna: ["IKCO Runna", "Iran Khodro Runna", "Peugeot 206"],
  saina: ["Saipa Saina"],
  samand: ["IKCO Samand"],
  shahin: ["Saipa Shahin"],
  tara: ["IKCO Tara", "Iran Khodro Tara", "Peugeot 301"],
  tiba: ["Saipa Tiba"],
  fownix: ["Chery"],
  mvm: ["Chery"],
  chery: ["Chery"],
  respect: ["Chery Arrizo"],
  lucano: ["Chery", "Jaecoo"],
  xtrim: ["Exeed", "Chery"],
  kmc: ["JAC"],
  jac: ["JAC"],
  jmc: ["JAC", "JMC"],
  lamari: ["Dongfeng", "Forthing"],
  farda: ["Dongfeng", "Forthing"],
  dongfeng: ["Dongfeng"],
  gacgonow: ["GAC", "Trumpchi"],
  beijing: ["BAIC", "Beijing"],
  baic: ["BAIC"],
  bestune: ["Bestune"],
  bmw: ["BMW"],
  mercedesbenz: ["Mercedes-Benz"],
  toyota: ["Toyota"],
  honda: ["Honda"],
  hyundai: ["Hyundai"],
  kia: ["Kia"],
  lexus: ["Lexus"],
  mazda: ["Mazda"],
  nissan: ["Nissan"],
  mitsubishi: ["Mitsubishi"],
  volkswagen: ["Volkswagen"],
  audi: ["Audi"],
  byd: ["BYD"],
  changan: ["Changan"],
  haima: ["Haima"],
  renault: ["Renault"],
  citroen: ["Citroen"],
  fiat: ["Fiat"],
  opel: ["Opel"],
  porsche: ["Porsche"],
  volvo: ["Volvo"],
  suzuki: ["Suzuki"],
  foton: ["Foton"],
};

const modelMatchOverrides: Record<string, string> = {
  atlas: "atlas",
  dena: "dena",
  quick: "quick",
  saina: "saina",
  samand: "samand",
  shahin: "shahin",
  tara: "tara",
  tiba: "tiba",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/\b(eu|usa|can|chn|bra)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function isPureElectricVehicle(vehicle: BamaVehicleDetail) {
  const haystack = `${vehicle.title} ${vehicle.engineType ?? ""} ${vehicle.modelSlug} ${vehicle.bamaUrl}`.toLowerCase();
  if (/\bphev\b|\berev\b|\bhybrid\b|\bhev\b|هیبری/i.test(haystack)) return false;
  return /\bev\b|\bbev\b|e-tron|edrive|برقی|electr|kwh|کیلووات|battery|eq[a-z0-9-]*/i.test(haystack);
}

function productionYear(year: number | null) {
  if (!year) return null;
  if (year >= 1300 && year <= 1500) return year + 621;
  return year;
}

async function fetchJson<T>(url: string): Promise<T> {
  const cached = jsonCache.get(url);
  if (cached) return cached as T;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    headers: { "user-agent": "Oilbar vehicle oil research bot; contact: support@oilbar.ir", accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Liqui Moly request failed ${response.status}: ${url}`);
  const json = (await response.json()) as T;
  jsonCache.set(url, json);
  return json;
}

async function fetchText(url: string, attempts = 3) {
  const cached = pageCache.get(url);
  if (cached) return cached;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "user-agent": "Oilbar vehicle oil research bot; contact: support@oilbar.ir", accept: "text/html" },
      });
      if (!response.ok) throw new Error(`Liqui Moly page failed ${response.status}: ${url}`);
      const text = await response.text();
      pageCache.set(url, text);
      return text;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function searchQueries(vehicle: BamaVehicleDetail) {
  const aliases = makeAliases[vehicle.brandSlug] ?? [vehicle.brandSlug];
  const model = (modelMatchOverrides[vehicle.brandSlug] ?? vehicle.modelSlug)
    .replace(/([a-z])([0-9])/gi, "$1 $2")
    .replace(/([0-9])([a-z])/gi, "$1 $2")
    .replace(/plus/g, " plus")
    .replace(/pro/g, " pro")
    .replace(/hybrid/g, " hybrid")
    .replace(/manual|automatic|basic|excellent|premium|luxury|full|plus$/g, "")
    .trim();

  const queries = new Set<string>();
  for (const alias of aliases) {
    queries.add(`${alias} ${model}`.trim());
    queries.add(alias.trim());
    const displacement = vehicle.engineDisplacement?.match(/([\d.]+)/)?.[1];
    if (displacement) queries.add(`${alias} ${model} ${displacement}`.trim());
  }
  return [...queries].filter((query) => query.length > 2).slice(0, 8);
}

async function searchVehicle(query: string) {
  const url = `${baseUrl}rest/V1/olyslager/search/${encodeURIComponent(query)}?clientId=${clientId}`;
  return fetchJson<SearchResult[]>(url);
}

function yearOverlap(vehicle: BamaVehicleDetail, result: SearchResult) {
  const from = Number(result.year_start);
  const to = result.year_end ? Number(result.year_end) : 2099;
  const vehicleFrom = productionYear(vehicle.yearFrom);
  const vehicleTo = productionYear(vehicle.yearTo);
  if (!vehicleFrom || !vehicleTo || !Number.isFinite(from)) return 0;
  return vehicleFrom <= to && vehicleTo >= from ? 3 : -2;
}

function displacementNeedle(vehicle: BamaVehicleDetail) {
  return vehicle.engineDisplacement?.match(/([\d.]+)/)?.[1] ?? vehicle.title.match(/(\d(?:\.\d)?)\s*لیتر/)?.[1] ?? null;
}

function scoreResult(vehicle: BamaVehicleDetail, result: SearchResult) {
  const resultIsPureElectric = /electric/i.test(result.fuel) && !/hybrid|petrol|diesel|gasoline|cng|lpg/i.test(result.fuel);
  if (isPureElectricVehicle(vehicle) !== resultIsPureElectric) return -20;

  const aliases = (makeAliases[vehicle.brandSlug] ?? [vehicle.brandSlug]).map(normalize);
  const make = normalize(result.make);
  const modelSlug = normalize(modelMatchOverrides[vehicle.brandSlug] ?? vehicle.modelSlug);
  const haystack = normalize(`${result.make} ${result.model} ${result.type} ${result.name}`);
  const displacement = displacementNeedle(vehicle);
  const modelParts = modelSlug.match(/[a-z]+|\d+/g) ?? [];
  const numericParts = modelParts.filter((part) => /^\d+$/.test(part));

  let score = 0;
  const brandMatched = aliases.some((alias) => make.includes(alias) || alias.includes(make));
  if (brandMatched) score += 6;

  let modelScore = 0;
  for (const part of modelParts) {
    if (part.length >= 2 && haystack.includes(part)) score += part.length >= 4 ? 3 : 1;
    if (part.length >= 2 && haystack.includes(part)) modelScore += part.length >= 4 ? 3 : 1;
  }

  const numericPartsMatched = numericParts.every((part) => haystack.includes(part));
  const resultDisplacement = result.type.match(/\b(\d(?:\.\d)?)\b/)?.[1] ?? null;
  const yearScore = yearOverlap(vehicle, result);
  if (displacement && haystack.includes(normalize(displacement))) score += 3;
  if (/turbo|tci/i.test(result.type) && /توربو|turbo/i.test(vehicle.title)) score += 2;
  score += yearScore;

  if (!brandMatched) return -20;
  if (modelScore < 2) return -10;
  if (yearScore < 0) return -10;
  if (numericParts.length > 0 && !numericPartsMatched) return -10;
  if (displacement && resultDisplacement && normalize(displacement) !== normalize(resultDisplacement)) return -10;

  return score;
}

async function pickSearchResult(vehicle: BamaVehicleDetail) {
  const all: SearchResult[] = [];
  const queries = searchQueries(vehicle);
  const debug = process.env.LIQUI_DEBUG_SLUG === vehicle.brandSlug || process.env.LIQUI_DEBUG_SLUG === vehicle.modelSlug;
  if (debug) console.log("Liqui debug queries", vehicle.brandSlug, vehicle.modelSlug, queries);

  for (const query of queries) {
    try {
      const results = await searchVehicle(query);
      if (debug) console.log("Liqui debug results", query, results.slice(0, 5).map((result) => result.name));
      all.push(...results);
    } catch {
      // Try the next query.
    }
  }

  const unique = [...new Map(all.map((item) => [item.type_id, item])).values()];
  const ranked = unique
    .map((result) => ({ result, score: scoreResult(vehicle, result) }))
    .filter((item) => item.score >= 6)
    .sort((a, b) => b.score - a.score);

  if (debug) {
    console.log(
      "Liqui debug ranked",
      unique
        .map((result) => ({ name: result.name, fuel: result.fuel, score: scoreResult(vehicle, result) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10),
    );
  }

  return ranked[0]?.result ?? null;
}

function parseCapacity(component: NonNullable<Recommendation["components"]>[number]) {
  const capacities = component.capacities?.Capacity ?? [];
  const value = capacities.find((item) => item.value)?.value;
  if (!value) return null;
  const normalized = value.replace(",", ".");
  const range = normalized.match(/(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?/);
  if (!range) return null;
  const first = Number(range[1]);
  const second = range[2] ? Number(range[2]) : null;
  if (!Number.isFinite(first)) return null;
  return second && Number.isFinite(second) ? Number(((first + second) / 2).toFixed(2)) : first;
}

function extractViscosity(text: string) {
  return text.match(/\b(?:0W|5W|10W|15W|20W)-\d{2}\b/i)?.[0]?.toUpperCase() ?? null;
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function extractProductSpecification(product: NonNullable<NonNullable<Recommendation["components"]>[number]["products"]>[number]) {
  const html = await fetchText(product.url);
  const text = stripTags(html);
  const specs = [
    ...(text.match(/\bAPI\s+[A-Z]{1,2}(?:\/[A-Z]{1,2})?\b/g) ?? []),
    ...(text.match(/\bACEA\s+[A-Z][0-9](?:\/[A-Z][0-9])*\b/g) ?? []),
    ...(text.match(/\b(?:BMW Longlife-[0-9A-Z-]+|MB-Approval\s*[0-9./]+|VW\s*[0-9]{3}\s*[0-9]{2}|Porsche\s*[A-Z0-9]+|Renault\s*RN[0-9]+|PSA\s*B[0-9 ]+|Ford\s*WSS-[A-Z0-9-]+|GM\s*[A-Z0-9.-]+)\b/g) ?? []),
  ];
  const unique = [...new Set(specs.map((item) => item.replace(/\s+/g, " ").trim()))];
  return unique.length > 0 ? unique.slice(0, 6).join(" / ") : null;
}

async function getOilCandidate(vehicle: BamaVehicleDetail): Promise<OilSpecCandidate> {
  const selected = await pickSearchResult(vehicle);
  if (!selected) {
    return {
      bamaUrl: vehicle.bamaUrl,
      title: vehicle.title,
      ravenolUrl: null,
      matchConfidence: "none",
      viscosity: null,
      oilCapacityLit: null,
      specification: null,
      rawNotes: ["No Liqui Moly vehicle match"],
    };
  }

  const recommendationUrl = `${baseUrl}rest/V1/recommendations/${selected.type_id}?clientId=${clientId}`;
  const recommendations = await fetchJson<Recommendation[]>(recommendationUrl);
  const engine = recommendations[0]?.components?.find((component) => /^engine\b/i.test(component.name));
  const product = engine?.products?.find((item) => extractViscosity(item.name));
  const viscosity = product ? extractViscosity(product.name) : null;
  const oilCapacityLit = engine ? parseCapacity(engine) : null;
  const specification = product ? await extractProductSpecification(product) : null;

  return {
    bamaUrl: vehicle.bamaUrl,
    title: vehicle.title,
    ravenolUrl: recommendationUrl,
    matchConfidence: engine && product ? "type" : "model",
    viscosity,
    oilCapacityLit,
    specification: specification ?? (viscosity ? `SAE ${viscosity}` : null),
    rawNotes: [
      `Liqui Moly match: ${selected.name}`,
      recommendations[0]?.heading ? `Heading: ${recommendations[0].heading}` : "",
      engine?.name ? `Component: ${engine.name} ${engine.code}` : "",
    ].filter(Boolean),
  };
}

async function main() {
  const details = JSON.parse(await readFile(path.join(process.cwd(), "tmp", "bama-vehicle-details.json"), "utf8")) as BamaVehicleDetail[];
  const current = JSON.parse(await readFile(path.join(process.cwd(), "tmp", "ravenol-oil-candidates.json"), "utf8")) as OilSpecCandidate[];
  const byUrl = new Map(current.map((item) => [item.bamaUrl, item]));
  const missing = details.filter((detail) => {
    const candidate = byUrl.get(detail.bamaUrl);
    return !(candidate?.viscosity && candidate.oilCapacityLit && candidate.specification);
  });

  const limit = process.env.LIQUI_LIMIT ? Number(process.env.LIQUI_LIMIT) : undefined;
  const offset = process.env.LIQUI_OFFSET ? Number(process.env.LIQUI_OFFSET) : 0;
  const items = Number.isFinite(limit) ? missing.slice(offset, offset + limit!) : missing.slice(offset);
  const candidates: OilSpecCandidate[] = [];

  for (const [index, vehicle] of items.entries()) {
    console.log(`[${offset + index + 1}/${missing.length}] ${vehicle.title}`);
    try {
      candidates.push(await getOilCandidate(vehicle));
    } catch (error) {
      candidates.push({
        bamaUrl: vehicle.bamaUrl,
        title: vehicle.title,
        ravenolUrl: null,
        matchConfidence: "none",
        viscosity: null,
        oilCapacityLit: null,
        specification: null,
        rawNotes: [error instanceof Error ? error.message : String(error)],
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  await mkdir(path.join(process.cwd(), "tmp"), { recursive: true });
  await writeFile(path.join(process.cwd(), "tmp", "liqui-moly-oil-candidates.json"), `${JSON.stringify(candidates, null, 2)}\n`, "utf8");
  const complete = candidates.filter((item) => item.viscosity && item.oilCapacityLit && item.specification).length;
  console.log(`Wrote ${candidates.length} Liqui Moly oil candidates (${complete} complete).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
