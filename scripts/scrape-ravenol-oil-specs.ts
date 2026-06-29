import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type BamaVehicleDetail = {
  brandSlug: string;
  modelSlug: string;
  bamaUrl: string;
  title: string;
  engineType: string | null;
  engineDisplacement: string | null;
  gearbox: string | null;
  yearFrom: number | null;
  yearTo: number | null;
};

type RavenolBrand = {
  name: string;
  url: string;
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

const brandSlugOverrides: Record<string, string> = {
  amg: "370-mg",
  amico: "609-foton",
  arisun: "437-renault",
  mvm: "73-brilliance",
  saipa: "859-Saipa",
  quick: "859-Saipa",
  saina: "859-Saipa",
  shahin: "859-Saipa",
  tiba: "859-Saipa",
  fownix: "97-chery",
  pride: "415-peugeot",
  samand: "415-peugeot",
  runna: "415-peugeot",
  tara: "415-peugeot",
  dena: "415-peugeot",
  paykan: "415-peugeot",
  peykan: "415-peugeot",
  zamyad: "437-renault",
  baic: "135-dongfeng",
  beijing: "135-dongfeng",
  capra: "609-foton",
  changan: "102-changan",
  haima: "102-changan",
  brilliance: "73-brilliance",
  jac: "270-jac",
  jmc: "270-jac",
  kmc: "270-jac",
  dongfeng: "135-dongfeng",
  farda: "135-dongfeng",
  venucia: "437-renault",
  respect: "97-chery",
  rayen: "97-chery",
  foton: "609-foton",
  greatwall: "great-wall",
  gacgonow: "gac",
  landrover: "land-rover",
  rollsroyce: "rolls-royce",
  alfaromeo: "alfa-romeo",
  mercedesbenz: "mercedes-benz",
};

const brandAliases: Record<string, string[]> = {
  alfaromeo: ["alfa romeo", "alfa-romeo", "alfa_romeo"],
  mercedesbenz: ["mercedes-benz", "mercedes benz", "mercedes"],
  volkswagen: ["volkswagen", "vw"],
  citroen: ["citroen", "citroën"],
  greatwall: ["great wall", "great-wall"],
  landrover: ["land rover", "land-rover"],
  rollsroyce: ["rolls royce", "rolls-royce"],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, "");
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const pageCache = new Map<string, string>();

async function fetchText(url: string, attempts = 3) {
  const cached = pageCache.get(url);
  if (cached) return cached;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(45_000),
        headers: {
          "user-agent": "Oilbar vehicle oil research bot; contact: support@oilbar.ir",
          accept: "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) throw new Error(`Ravenol request failed ${response.status}: ${url}`);
      const text = await response.text();
      pageCache.set(url, text);
      return text;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function parseLinks(html: string, baseUrl: string) {
  const links: { label: string; url: string }[] = [];
  const re = /<a\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(html))) {
    const href = match[1];
    const label = stripTags(match[2]);
    if (!label || !href.includes("1-cars")) continue;
    links.push({
      label,
      url: new URL(href, baseUrl).toString(),
    });
  }

  return links;
}

function childLinks(html: string, baseUrl: string, parentUrl: string) {
  const parentPath = new URL(parentUrl).pathname.replace(/\/$/, "");
  return parseLinks(html, baseUrl).filter((link) => {
    const path = new URL(link.url).pathname.replace(/\/$/, "");
    return path.startsWith(`${parentPath}/`) && path !== parentPath;
  });
}

function extractOilSpecFromHtml(html: string) {
  const liquidMatch = html.match(/Liquid volume \(basic\):\s*([\d.,]+)\s*L/i);
  const text = stripTags(html);
  const viscosities = Array.from(new Set(text.match(/\b(?:0W|5W|10W|15W|20W)-\d{2}\b/g) ?? []));
  const apiMatch = text.match(/\bAPI\s+([A-Z]{1,2}(?:\/[A-Z]{1,2})?)\b/);
  const aceaMatch = text.match(/\bACEA\s+([A-Z][0-9](?:\/[A-Z][0-9])*)\b/);
  const oemMatches = Array.from(
    new Set(
      (text.match(/\b(?:VW|MB|BMW|Porsche|Renault|PSA|Ford|GM|Toyota|Hyundai|Kia)\s?[A-Z0-9./ -]{2,20}\b/g) ?? [])
        .map((item) => item.replace(/\s+/g, " ").trim())
        .filter((item) => !item.includes("WSS-M2C") || item.length < 30),
    ),
  ).slice(0, 6);

  const engineOilSpecs = [
    apiMatch ? `API ${apiMatch[1]}` : null,
    aceaMatch ? `ACEA ${aceaMatch[1]}` : null,
    ...oemMatches.filter((item) => /VW|MB |BMW |504|507|502|505|229|LL-/.test(item)),
  ].filter((item): item is string => Boolean(item));

  return {
    viscosity: viscosities[0] ?? null,
    oilCapacityLit: liquidMatch ? Number(liquidMatch[1].replace(",", ".")) : null,
    specification: engineOilSpecs.length > 0 ? Array.from(new Set(engineOilSpecs)).join(" / ") : null,
    rawNotes: viscosities.slice(0, 5),
  };
}

async function resolveBestOilPage(startUrl: string, vehicle: BamaVehicleDetail) {
  const queue = [startUrl];
  const visited = new Set<string>();
  let best: { url: string; spec: ReturnType<typeof extractOilSpecFromHtml>; score: number } | null = null;

  while (queue.length > 0) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    const html = await fetchText(url);
    const spec = extractOilSpecFromHtml(html);
    const score =
      (spec.oilCapacityLit ? 4 : 0) +
      (spec.viscosity ? 3 : 0) +
      (spec.specification ? 2 : 0) +
      url.split("/").length;

    if (score > (best?.score ?? 0)) {
      best = { url, spec, score };
    }

    if (spec.oilCapacityLit && spec.viscosity) {
      return { url, spec, confidence: "type" as const };
    }

    const children = filterLinksForVehicle(childLinks(html, url, url), vehicle);
    const engineNeedles = [vehicle.engineDisplacement, vehicle.engineType, vehicle.modelSlug]
      .filter((value): value is string => Boolean(value))
      .map(normalize)
      .filter(Boolean);

    const rankedChildren = children
      .map((link) => ({
        link,
        score: engineNeedles.reduce((acc, needle) => acc + (normalize(link.label).includes(needle) ? 2 : 0), 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    for (const child of rankedChildren) {
      queue.push(child.link.url);
    }
  }

  if (best && best.spec.oilCapacityLit && best.spec.viscosity) {
    return { url: best.url, spec: best.spec, confidence: "type" as const };
  }

  if (best && (best.spec.oilCapacityLit || best.spec.viscosity)) {
    return { url: best.url, spec: best.spec, confidence: "model" as const };
  }

  return null;
}

async function getRavenolBrands() {
  const html = await fetchText("https://choise.ravenol.com/");
  const seen = new Set<string>();
  const brands: RavenolBrand[] = [];

  for (const link of parseLinks(html, "https://choise.ravenol.com/")) {
    if (seen.has(link.url)) continue;
    seen.add(link.url);
    brands.push({ name: link.label, url: link.url });
  }

  return brands;
}

function findBrand(vehicle: BamaVehicleDetail, brands: RavenolBrand[]) {
  const overridePath = brandSlugOverrides[vehicle.brandSlug];
  if (overridePath) {
    const overrideBrand = brands.find((brand) =>
      brand.url.toLowerCase().includes(`/1-cars/${overridePath.toLowerCase()}/`),
    );
    if (overrideBrand) return overrideBrand;
  }

  const aliases = [
    ...(brandAliases[vehicle.brandSlug] ?? []),
    vehicle.brandSlug.replace(/([a-z])([A-Z])/g, "$1 $2"),
    vehicle.brandSlug,
  ].map(normalize);

  return brands.find((brand) => {
    const normalizedBrand = normalize(brand.name);
    return aliases.some((alias) => {
      if (alias.length < 3 || normalizedBrand.length < 3) {
        return alias === normalizedBrand;
      }
      return alias === normalizedBrand || normalizedBrand.startsWith(alias) || alias.startsWith(normalizedBrand);
    });
  });
}

function isPureElectricVehicle(vehicle: BamaVehicleDetail) {
  const haystack = `${vehicle.title} ${vehicle.engineType ?? ""} ${vehicle.modelSlug} ${vehicle.bamaUrl}`.toLowerCase();
  if (/\bphev\b|\berev\b|\bhybrid\b|\bhev\b|هیبری/i.test(haystack)) return false;
  return /\bev\b|\bbev\b|e-tron|edrive|xdrive\s*30l|برقی|electr|kwh|کیلووات|battery/i.test(haystack);
}

function isElectricLink(url: string, label: string) {
  const haystack = `${url} ${label}`.toLowerCase();
  return /ev|electric|kwh|battery|phev|bev|e-/i.test(haystack);
}

function filterLinksForVehicle(links: { label: string; url: string }[], vehicle: BamaVehicleDetail) {
  if (isPureElectricVehicle(vehicle)) return links;
  return links.filter((link) => !isElectricLink(link.url, link.label));
}

function directModelMatchScore(link: { label: string; url: string }, vehicle: BamaVehicleDetail) {
  const normalizedModel = normalize(vehicle.modelSlug.replace(/ir$/, ""));
  const label = normalize(link.label);
  const url = normalize(link.url);
  if (normalizedModel.length < 3 || label.length < 3) return 0;

  if (label === normalizedModel || url.includes(normalizedModel)) return 10;
  if (label.includes(normalizedModel)) return 8;
  if (normalizedModel.length >= 5 && normalizedModel.includes(label)) return 5;

  const parts = normalizedModel.match(/[a-z]+|\d+/g) ?? [];
  const matched = parts.filter((part) => part.length >= 2 && (label.includes(part) || url.includes(part))).length;
  if (matched >= Math.min(2, parts.length)) return matched;

  return 0;
}

function pickModelLink(links: { label: string; url: string }[], vehicle: BamaVehicleDetail) {
  const filteredLinks = filterLinksForVehicle(links, vehicle);
  const direct = filteredLinks
    .map((link) => ({ link, score: directModelMatchScore(link, vehicle) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.link;

  if (direct) return direct;

  if (vehicle.brandSlug === "arisun") {
    const pickup = filteredLinks.find((link) => /logan|pick-up|pickup/i.test(link.url) || /logan|pick-up|pickup/i.test(link.label));
    if (pickup) return pickup;
  }

  const displacement = vehicle.engineDisplacement?.match(/([\d.]+)/)?.[1];
  if (!displacement) return null;

  const scored = filteredLinks
    .map((link) => {
      const label = normalize(link.label);
      let score = 0;
      if (label.includes(normalize(displacement))) score += 3;
      if (vehicle.engineType && label.includes(normalize(vehicle.engineType.split(" ")[0] ?? ""))) score += 1;
      if (label.includes("turbo") && vehicle.engineType?.includes("توربو")) score += 2;
      return { link, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.link ?? null;
}

async function main() {
  const detailsPath = process.argv[2] ?? path.join(process.cwd(), "tmp", "bama-vehicle-details.json");
  let vehicles: BamaVehicleDetail[] = [];

  try {
    vehicles = JSON.parse(await readFile(detailsPath, "utf8")) as BamaVehicleDetail[];
  } catch {
    vehicles = JSON.parse(await readFile(path.join(process.cwd(), "tmp", "bama-vehicles-draft.json"), "utf8")) as BamaVehicleDetail[];
  }

  const limit = process.env.RAVENOL_LIMIT ? Number(process.env.RAVENOL_LIMIT) : undefined;
  const offset = process.env.RAVENOL_OFFSET ? Number(process.env.RAVENOL_OFFSET) : 0;
  const items = (Number.isFinite(limit) ? vehicles.slice(offset, offset + limit!) : vehicles.slice(offset));
  const brands = await getRavenolBrands();
  const candidates: OilSpecCandidate[] = [];

  for (const [index, vehicle] of items.entries()) {
    console.log(`[${offset + index + 1}/${vehicles.length}] ${vehicle.title ?? vehicle.bamaUrl}`);
    const brand = findBrand(vehicle, brands);
    if (!brand) {
      candidates.push({
        bamaUrl: vehicle.bamaUrl,
        title: vehicle.title ?? vehicle.bamaUrl,
        ravenolUrl: null,
        matchConfidence: "none",
        viscosity: null,
        oilCapacityLit: null,
        specification: null,
        rawNotes: ["No Ravenol brand match"],
      });
      continue;
    }

    try {
      const brandHtml = await fetchText(brand.url);
      const links = childLinks(brandHtml, brand.url, brand.url);
      const modelLink = pickModelLink(links, vehicle);

      if (!modelLink) {
        candidates.push({
          bamaUrl: vehicle.bamaUrl,
          title: vehicle.title ?? vehicle.bamaUrl,
          ravenolUrl: brand.url,
          matchConfidence: "brand",
          viscosity: null,
          oilCapacityLit: null,
          specification: null,
          rawNotes: [`Matched brand ${brand.name}, no model match`],
        });
        continue;
      }

      const resolved = await resolveBestOilPage(modelLink.url, vehicle);
      if (!resolved) {
        candidates.push({
          bamaUrl: vehicle.bamaUrl,
          title: vehicle.title ?? vehicle.bamaUrl,
          ravenolUrl: modelLink.url,
          matchConfidence: "model",
          viscosity: null,
          oilCapacityLit: null,
          specification: null,
          rawNotes: [`Matched model ${modelLink.label}, no oil data`],
        });
        continue;
      }

      let specification = resolved.spec.specification;
      if (!specification && resolved.spec.viscosity) {
        specification = `SAE ${resolved.spec.viscosity}`;
      }

      candidates.push({
        bamaUrl: vehicle.bamaUrl,
        title: vehicle.title ?? vehicle.bamaUrl,
        ravenolUrl: resolved.url,
        matchConfidence: resolved.confidence,
        viscosity: resolved.spec.viscosity,
        oilCapacityLit: resolved.spec.oilCapacityLit,
        specification,
        rawNotes: resolved.spec.rawNotes,
      });
    } catch (error) {
      candidates.push({
        bamaUrl: vehicle.bamaUrl,
        title: vehicle.title ?? vehicle.bamaUrl,
        ravenolUrl: brand.url,
        matchConfidence: "brand",
        viscosity: null,
        oilCapacityLit: null,
        specification: null,
        rawNotes: [error instanceof Error ? error.message : String(error)],
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  const outputDir = path.join(process.cwd(), "tmp");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "ravenol-oil-candidates.json");

  let merged = candidates;
  if (offset > 0) {
    try {
      const existing = JSON.parse(await readFile(outputPath, "utf8")) as OilSpecCandidate[];
      merged = [...existing.slice(0, offset), ...candidates, ...existing.slice(offset + candidates.length)];
    } catch {
      merged = candidates;
    }
  }

  await writeFile(outputPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  const complete = merged.filter((item) => item.viscosity && item.oilCapacityLit && item.specification).length;
  console.log(`Wrote ${merged.length} Ravenol oil candidates (${complete} complete).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
