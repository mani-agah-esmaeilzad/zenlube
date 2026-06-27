import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type BamaDraftModel = {
  brandSlug: string;
  modelSlug: string;
  bamaUrl: string;
  imageUrl: string | null;
};

function decodeEscaped(value: string) {
  return value.replace(/\\u002F/g, "/").replace(/&amp;/g, "&");
}

function discoverBrandSlugs(html: string) {
  const matches = html.match(/\\u002Fcar-reviews\\u002F[a-z0-9-]+/g) ?? [];
  return Array.from(
    new Set(
      matches
        .map((match) => decodeEscaped(match).split("/").pop())
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ).sort((a, b) => a.localeCompare(b));
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
        throw new Error(`Bama request failed ${response.status}: ${url}`);
      }

      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function getBrandIndexHtml() {
  try {
    const html = await fetchText("https://bama.ir/car-reviews");
    await mkdir(path.join(process.cwd(), "tmp"), { recursive: true });
    await writeFile(path.join(process.cwd(), "tmp", "bama-car-reviews.html"), html, "utf8");
    return html;
  } catch (error) {
    const cachedPath = path.join(process.cwd(), "tmp", "bama-car-reviews.html");
    console.warn(`Using cached Bama brand index after fetch failure: ${error instanceof Error ? error.message : String(error)}`);
    return readFile(cachedPath, "utf8");
  }
}

async function main() {
  const brandSlugs =
    process.argv.slice(2).length > 0
      ? process.argv.slice(2)
      : discoverBrandSlugs(await getBrandIndexHtml());
  const draft: BamaDraftModel[] = [];
  const failedBrands: { brandSlug: string; error: string }[] = [];

  for (const brandSlug of brandSlugs) {
    const url = `https://bama.ir/car-reviews/${brandSlug}`;
    console.log(`Fetching ${url}`);
    try {
      const html = await fetchText(url);
      draft.push(...extractModels(brandSlug, html));
    } catch (error) {
      failedBrands.push({
        brandSlug,
        error: error instanceof Error ? error.message : String(error),
      });
      console.warn(`Skipped ${brandSlug}: ${failedBrands.at(-1)?.error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  const unique = Array.from(new Map(draft.map((item) => [item.bamaUrl, item])).values()).sort((a, b) =>
    a.bamaUrl.localeCompare(b.bamaUrl),
  );

  const outputDir = path.join(process.cwd(), "tmp");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "bama-vehicles-draft.json");
  await writeFile(outputPath, `${JSON.stringify(unique, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputDir, "bama-failed-brands.json"), `${JSON.stringify(failedBrands, null, 2)}\n`, "utf8");
  console.log(`Wrote ${unique.length} Bama draft records to ${outputPath}`);
  console.log(`Skipped ${failedBrands.length} failed Bama brand pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
