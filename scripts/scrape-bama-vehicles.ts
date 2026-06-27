import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type BamaDraftModel = {
  brandSlug: string;
  modelSlug: string;
  bamaUrl: string;
  imageUrl: string | null;
};

const defaultBrands = [
  "peugeot",
  "iran-khodro",
  "saipa",
  "renault",
  "hyundai",
  "kia",
  "toyota",
  "nissan",
  "mazda",
  "mitsubishi",
  "chery",
  "mvm",
  "fownix",
  "jac",
  "kmc",
  "lifan",
  "haima",
  "dongfeng",
  "brilliance",
  "bmw",
  "benz",
  "lexus",
  "volkswagen",
  "haval",
  "byd",
  "hongqi",
];

function decodeEscaped(value: string) {
  return value.replace(/\\u002F/g, "/").replace(/&amp;/g, "&");
}

function extractModels(brandSlug: string, html: string): BamaDraftModel[] {
  const models: BamaDraftModel[] = [];
  const seen = new Set<string>();
  const modelPattern = /brand_model_en:"([^"]+)"[\s\S]{0,900}?url:"(\\u002Fcar-reviews\\u002F[^"]+)"[\s\S]{0,900}?model_image_url:"([^"]+)"/g;
  let match: RegExpExecArray | null;

  while ((match = modelPattern.exec(html))) {
    const [, modelSlug, rawUrl, rawImageUrl] = match;
    const bamaPath = decodeEscaped(rawUrl);
    const bamaUrl = `https://bama.ir${bamaPath}`;
    const key = `${brandSlug}:${bamaUrl}`;

    if (seen.has(key)) continue;
    seen.add(key);

    models.push({
      brandSlug,
      modelSlug,
      bamaUrl,
      imageUrl: decodeEscaped(rawImageUrl),
    });
  }

  return models;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Oilbar vehicle research bot; contact: support@oilbar.ir",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Bama request failed ${response.status}: ${url}`);
  }

  return response.text();
}

async function main() {
  const brandSlugs = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultBrands;
  const draft: BamaDraftModel[] = [];

  for (const brandSlug of brandSlugs) {
    const url = `https://bama.ir/car-reviews/${brandSlug}`;
    console.log(`Fetching ${url}`);
    const html = await fetchText(url);
    draft.push(...extractModels(brandSlug, html));
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  const unique = Array.from(new Map(draft.map((item) => [item.bamaUrl, item])).values()).sort((a, b) =>
    a.bamaUrl.localeCompare(b.bamaUrl),
  );

  const outputDir = path.join(process.cwd(), "tmp");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "bama-vehicles-draft.json");
  await writeFile(outputPath, `${JSON.stringify(unique, null, 2)}\n`, "utf8");
  console.log(`Wrote ${unique.length} Bama draft records to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
