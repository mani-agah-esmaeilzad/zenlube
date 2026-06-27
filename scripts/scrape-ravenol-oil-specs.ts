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

const brandAliases: Record<string, string[]> = {
  mercedesbenz: ["mercedes-benz", "mercedes benz", "mercedes"],
  bmw: ["bmw"],
  peugeot: ["peugeot"],
  hyundai: ["hyundai"],
  kia: ["kia"],
  toyota: ["toyota"],
  renault: ["renault"],
  nissan: ["nissan"],
  mazda: ["mazda"],
  mitsubishi: ["mitsubishi"],
  lexus: ["lexus"],
  volkswagen: ["volkswagen", "vw"],
  audi: ["audi"],
  opel: ["opel"],
  honda: ["honda"],
  porsche: ["porsche"],
  volvo: ["volvo"],
  suzuki: ["suzuki"],
  fiat: ["fiat"],
  citroen: ["citroen", "citroën"],
  alfaRomeo: ["alfa romeo", "alfaromeo"],
  alfaromeo: ["alfa romeo", "alfaromeo"],
  mini: ["mini"],
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

async function fetchText(url: string, attempts = 2) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        headers: {
          "user-agent": "Oilbar vehicle oil research bot; contact: support@oilbar.ir",
          accept: "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) throw new Error(`Ravenol request failed ${response.status}: ${url}`);
      return response.text();
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
  const aliases = brandAliases[vehicle.brandSlug] ?? [vehicle.brandSlug];
  const normalizedAliases = aliases.map(normalize);

  return brands.find((brand) => {
    const normalizedBrand = normalize(brand.name);
    return normalizedAliases.some((alias) => normalizedBrand.includes(alias) || alias.includes(normalizedBrand));
  });
}

function extractOilSpecFromHtml(html: string) {
  const text = stripTags(html);
  const viscosities = Array.from(new Set(text.match(/\b(?:0W|5W|10W|15W|20W)-\d{2}\b/g) ?? []));
  const capacityMatch = text.match(/(?:Liquid volume[^0-9]{0,80}|Capacity[^0-9]{0,80})(\d+(?:[.,]\d+)?)\s*(?:l|L|liter|litre)/);
  const apiMatch = text.match(/\bAPI\s+([A-Z]{1,2}(?:\/[A-Z]{1,2})?)\b/);
  const aceaMatch = text.match(/\bACEA\s+([A-Z][0-9](?:\/[A-Z][0-9])*)\b/);
  const approvals = Array.from(new Set(text.match(/\b(?:VW|MB|BMW|Porsche|Renault|PSA|Ford|GM)\s?[A-Z0-9. -]{2,16}\b/g) ?? []));
  const specs = [apiMatch ? `API ${apiMatch[1]}` : null, aceaMatch ? `ACEA ${aceaMatch[1]}` : null, ...approvals]
    .filter((item): item is string => Boolean(item));

  return {
    viscosity: viscosities[0] ?? null,
    oilCapacityLit: capacityMatch ? Number(capacityMatch[1].replace(",", ".")) : null,
    specification: specs.length > 0 ? Array.from(new Set(specs)).join(" / ") : null,
    rawNotes: viscosities.slice(0, 5),
  };
}

async function main() {
  const detailsPath = process.argv[2] ?? path.join(process.cwd(), "tmp", "bama-vehicle-details.json");
  const vehicles = JSON.parse(await readFile(detailsPath, "utf8")) as BamaVehicleDetail[];
  const limit = process.env.RAVENOL_LIMIT ? Number(process.env.RAVENOL_LIMIT) : undefined;
  const items = Number.isFinite(limit) ? vehicles.slice(0, limit) : vehicles;
  const brands = await getRavenolBrands();
  const candidates: OilSpecCandidate[] = [];

  for (const [index, vehicle] of items.entries()) {
    console.log(`[${index + 1}/${items.length}] ${vehicle.title}`);
    const brand = findBrand(vehicle, brands);
    if (!brand) {
      candidates.push({
        bamaUrl: vehicle.bamaUrl,
        title: vehicle.title,
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
      const links = parseLinks(brandHtml, brand.url);
      const normalizedModel = normalize(vehicle.modelSlug.replace(/ir$/, ""));
      const modelLink = links.find((link) => normalize(link.label).includes(normalizedModel) || normalizedModel.includes(normalize(link.label)));

      if (!modelLink) {
        candidates.push({
          bamaUrl: vehicle.bamaUrl,
          title: vehicle.title,
          ravenolUrl: brand.url,
          matchConfidence: "brand",
          viscosity: null,
          oilCapacityLit: null,
          specification: null,
          rawNotes: [`Matched brand ${brand.name}, no model match`],
        });
        continue;
      }

      const modelHtml = await fetchText(modelLink.url);
      const typeLinks = parseLinks(modelHtml, modelLink.url);
      const engineNeedles = [vehicle.engineDisplacement, vehicle.engineType]
        .filter((value): value is string => Boolean(value))
        .map(normalize)
        .filter(Boolean);
      const typeLink =
        typeLinks.find((link) => engineNeedles.some((needle) => normalize(link.label).includes(needle) || needle.includes(normalize(link.label)))) ??
        typeLinks[0];

      if (!typeLink) {
        candidates.push({
          bamaUrl: vehicle.bamaUrl,
          title: vehicle.title,
          ravenolUrl: modelLink.url,
          matchConfidence: "model",
          viscosity: null,
          oilCapacityLit: null,
          specification: null,
          rawNotes: [`Matched model ${modelLink.label}, no type match`],
        });
        continue;
      }

      const typeHtml = await fetchText(typeLink.url);
      const oilSpec = extractOilSpecFromHtml(typeHtml);
      candidates.push({
        bamaUrl: vehicle.bamaUrl,
        title: vehicle.title,
        ravenolUrl: typeLink.url,
        matchConfidence: "type",
        ...oilSpec,
      });
    } catch (error) {
      candidates.push({
        bamaUrl: vehicle.bamaUrl,
        title: vehicle.title,
        ravenolUrl: brand.url,
        matchConfidence: "brand",
        viscosity: null,
        oilCapacityLit: null,
        specification: null,
        rawNotes: [error instanceof Error ? error.message : String(error)],
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  const outputDir = path.join(process.cwd(), "tmp");
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "ravenol-oil-candidates.json"), `${JSON.stringify(candidates, null, 2)}\n`, "utf8");
  console.log(`Wrote ${candidates.length} Ravenol oil candidates.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
