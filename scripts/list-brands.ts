import { readFileSync } from "node:fs";

const draft = JSON.parse(readFileSync("tmp/bama-vehicles-draft.json", "utf8")) as { brandSlug: string }[];
const brands = [...new Set(draft.map((x) => x.brandSlug))].sort();
console.log("count", brands.length);
console.log(brands.join("\n"));
