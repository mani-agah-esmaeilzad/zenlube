import { readFileSync } from "node:fs";

const details = JSON.parse(readFileSync("tmp/bama-vehicle-details.json", "utf8")) as {
  brandSlug: string;
  bamaUrl: string;
  title: string;
}[];
const oil = JSON.parse(readFileSync("tmp/ravenol-oil-candidates.json", "utf8")) as {
  bamaUrl: string;
  matchConfidence: string;
  viscosity: string | null;
  oilCapacityLit: number | null;
  specification: string | null;
}[];

const failed = oil.filter((item) => !(item.viscosity && item.oilCapacityLit && item.specification));
const byBrand = new Map<string, number>();

for (const item of failed) {
  const detail = details.find((entry) => entry.bamaUrl === item.bamaUrl);
  const brand = detail?.brandSlug ?? "unknown";
  byBrand.set(brand, (byBrand.get(brand) ?? 0) + 1);
}

console.log(
  [...byBrand.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([brand, count]) => `${brand}: ${count}`)
    .join("\n"),
);
