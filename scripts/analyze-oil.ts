import { readFileSync } from "node:fs";

type Oil = {
  matchConfidence: string;
  viscosity: string | null;
  oilCapacityLit: number | null;
  specification: string | null;
};

const oil = JSON.parse(readFileSync("tmp/ravenol-oil-candidates.json", "utf8")) as Oil[];
const complete = oil.filter((item) => item.viscosity && item.oilCapacityLit && item.specification);
console.log(
  JSON.stringify(
    {
      total: oil.length,
      complete: complete.length,
      none: oil.filter((item) => item.matchConfidence === "none").length,
      brand: oil.filter((item) => item.matchConfidence === "brand").length,
      model: oil.filter((item) => item.matchConfidence === "model").length,
      type: oil.filter((item) => item.matchConfidence === "type").length,
    },
    null,
    2,
  ),
);
