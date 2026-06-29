import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function run(command: string, args: string[], env: Partial<NodeJS.ProcessEnv> = {}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...env },
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function fileExists(target: string) {
  try {
    await readFile(target, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const cwd = process.cwd();
  const draftPath = path.join(cwd, "tmp", "bama-vehicles-draft.json");
  const detailsPath = path.join(cwd, "tmp", "bama-vehicle-details.json");
  const oilPath = path.join(cwd, "tmp", "ravenol-oil-candidates.json");

  if (!(await fileExists(draftPath))) {
    console.log("Step 1/5: scraping Bama vehicle list...");
    await run("npm", ["run", "vehicles:bama:draft"]);
  } else {
    console.log("Step 1/5: Bama draft already exists, skipping.");
  }

  if (!(await fileExists(detailsPath))) {
    console.log("Step 2/5: scraping Bama vehicle details...");
    await run("npm", ["run", "vehicles:bama:details"]);
  } else {
    const details = JSON.parse(await readFile(detailsPath, "utf8")) as unknown[];
    if (details.length < 500) {
      console.log("Step 2/5: refreshing incomplete Bama details...");
      await run("npm", ["run", "vehicles:bama:details"]);
    } else {
      console.log(`Step 2/5: Bama details already exist (${details.length}), skipping.`);
    }
  }

  const details = JSON.parse(await readFile(detailsPath, "utf8")) as { bamaUrl: string }[];
  let oilCount = 0;
  if (await fileExists(oilPath)) {
    const oil = JSON.parse(await readFile(oilPath, "utf8")) as unknown[];
    oilCount = oil.length;
  }

  if (oilCount < details.length) {
    console.log("Step 3/5: scraping Ravenol oil specs in batches...");
    const batchSize = 50;
    for (let offset = oilCount; offset < details.length; offset += batchSize) {
      console.log(`Ravenol batch offset=${offset}`);
      await run("npm", ["run", "vehicles:oil:candidates"], {
        RAVENOL_OFFSET: String(offset),
        RAVENOL_LIMIT: String(batchSize),
      });
    }
  } else {
    console.log(`Step 3/5: Ravenol oil candidates already exist (${oilCount}), skipping.`);
  }

  console.log("Step 4/5: enriching remaining oil specs from Liqui Moly...");
  await run("npm", ["run", "vehicles:oil:liqui"]);
  await run("npm", ["run", "vehicles:oil:merge"]);

  console.log("Step 5/5: building verified cars...");
  await run("npm", ["run", "vehicles:build:verified"]);

  const builtPath = path.join(cwd, "tmp", "verified-cars-built.json");
  const incompletePath = path.join(cwd, "tmp", "verified-cars-incomplete.json");
  const built = JSON.parse(await readFile(builtPath, "utf8")) as unknown[];
  const incomplete = JSON.parse(await readFile(incompletePath, "utf8")) as unknown[];

  const summary = {
    complete: built.length,
    incomplete: incomplete.length,
    total: details.length,
    generatedAt: new Date().toISOString(),
  };

  await mkdir(path.join(cwd, "tmp"), { recursive: true });
  await writeFile(path.join(cwd, "tmp", "vehicle-pipeline-summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(JSON.stringify(summary, null, 2));

  if (incomplete.length === 0 || process.env.ALLOW_PARTIAL_VERIFIED === "1") {
    console.log("Writing verified-cars.ts ...");
    await run("npm", ["run", "vehicles:build:verified"], { WRITE_VERIFIED: "1" });
  } else {
    console.log(
      `Not writing verified-cars.ts because ${incomplete.length} records are incomplete. ` +
        "Set ALLOW_PARTIAL_VERIFIED=1 only if a partial seed is intentional.",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
