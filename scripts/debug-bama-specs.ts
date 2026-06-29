export {};

async function fetchSpecs(url: string) {
  const html = await fetch(url, { headers: { "user-agent": "test" } }).then((r) => r.text());
  function strip(v: string) {
    return v.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const specs: Record<string, string> = {};
  for (const match of html.matchAll(
    /spec-item__title[^>]*>([\s\S]*?)<\/h3>\s*<span class="spec-item__value"[^>]*>([\s\S]*?)<\/span>/g,
  )) {
    specs[strip(match[1])] = strip(match[2]);
  }
  return specs;
}

async function main() {
  const urls = [
    "https://bama.ir/car-reviews/bmw/320i-specs-1469-2.0literturbo",
    "https://bama.ir/car-reviews/peugeot/206-specs-965",
    "https://bama.ir/car-reviews/hyundai/sonata-specs-1288-2.4liter",
  ];

  for (const url of urls) {
    const specs = await fetchSpecs(url);
    console.log("\n===", url);
    console.log(JSON.stringify(specs, null, 2));
  }
}

main().catch(console.error);
