import { readFileSync } from "node:fs";

type Incomplete = { bamaUrl: string; title: string; missing: string[] };
const items = JSON.parse(readFileSync("tmp/verified-cars-incomplete.json", "utf8")) as Incomplete[];

const counts = new Map<string, number>();
for (const item of items) {
  for (const field of item.missing) {
    counts.set(field, (counts.get(field) ?? 0) + 1);
  }
}

console.log("total incomplete", items.length);
console.log("missing field counts", Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1])));
console.log("\nSample oilSpec failures:");
for (const item of items.filter((entry) => entry.missing.includes("oilSpec")).slice(0, 15)) {
  console.log("-", item.title);
}
