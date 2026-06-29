import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

function isComplete(candidate: OilSpecCandidate | undefined) {
  return Boolean(candidate?.viscosity && candidate.oilCapacityLit && candidate.oilCapacityLit > 0 && candidate.specification);
}

async function main() {
  const ravenolPath = path.join(process.cwd(), "tmp", "ravenol-oil-candidates.json");
  const liquiPath = path.join(process.cwd(), "tmp", "liqui-moly-oil-candidates.json");
  const ravenol = JSON.parse(await readFile(ravenolPath, "utf8")) as OilSpecCandidate[];
  const liqui = JSON.parse(await readFile(liquiPath, "utf8")) as OilSpecCandidate[];
  const liquiByUrl = new Map(liqui.map((candidate) => [candidate.bamaUrl, candidate]));

  let replaced = 0;
  const merged = ravenol.map((candidate) => {
    const liquiCandidate = liquiByUrl.get(candidate.bamaUrl);
    if (!isComplete(candidate) && isComplete(liquiCandidate)) {
      replaced += 1;
      return {
        ...liquiCandidate!,
        rawNotes: ["Source provider: Liqui Moly", ...liquiCandidate!.rawNotes],
      };
    }
    return candidate;
  });

  await writeFile(ravenolPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Merged ${replaced} complete Liqui Moly candidates into ${ravenolPath}.`);
  console.log(`Complete total: ${merged.filter(isComplete).length}/${merged.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
