import { readFileSync } from "node:fs";

const details = JSON.parse(readFileSync("tmp/bama-vehicle-details.json", "utf8")) as Record<string, unknown>[];
console.log("count", details.length);
for (const field of ["title", "imageUrl", "yearFrom", "engineType", "gearbox", "reviewBody"]) {
  console.log(field, details.filter((item) => item[field]).length);
}
