import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type VehicleTableModel = {
  brand: string;
  model: string;
};

function cleanCell(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/،/g, "،")
    .trim();
}

function parseMarkdownTable(input: string) {
  const rows: VehicleTableModel[] = [];
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));

  for (const line of lines) {
    if (/^\|\s*-+/.test(line) || line.includes("| برند")) continue;

    const cells = line
      .slice(1, -1)
      .split("|")
      .map(cleanCell);

    const [brand, modelsText] = cells;
    if (!brand || !modelsText) continue;

    const models = modelsText
      .split("،")
      .map(cleanCell)
      .filter(Boolean);

    for (const model of models) {
      rows.push({ brand, model });
    }
  }

  return rows;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: npm run vehicles:table:draft -- <path-to-pasted-table.txt>");
  }

  const input = await readFile(inputPath, "utf8");
  const rows = parseMarkdownTable(input);
  const brandCount = new Set(rows.map((row) => row.brand)).size;

  const outputDir = path.join(process.cwd(), "tmp");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "vehicle-table-draft.json");

  await writeFile(outputPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");

  console.log(`Parsed ${brandCount} brands and ${rows.length} models.`);
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
