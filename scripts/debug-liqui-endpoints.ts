import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const html = await fetch("https://www.liqui-moly.com/en/service/oil-guide.html", {
    headers: { "user-agent": "Oilbar vehicle oil research bot; contact: support@oilbar.ir" },
  }).then((response) => response.text());

  await mkdir(path.join(process.cwd(), "tmp"), { recursive: true });
  await writeFile(path.join(process.cwd(), "tmp", "liqui-oil-guide.html"), html, "utf8");

  const fetchMatches = [...html.matchAll(/fetch\(([\s\S]{0,1400})/g)]
    .map((match) => html.slice(Math.max(0, match.index! - 400), match.index! + 1400))
    .filter((snippet) => /oww|vehicle|make|model|type|category/i.test(snippet));

  for (const snippet of fetchMatches) {
    console.log("\n---FETCH---");
    console.log(snippet.replace(/\s+/g, " ").slice(0, 1800));
  }

  const owwPaths = [...html.matchAll(/[`'"]([^`'"]*oww\/[^`'"]+)[`'"]/g)]
    .map((match) => match[1])
    .filter((value, index, values) => values.indexOf(value) === index);

  console.log("\nOWW paths:");
  console.log(owwPaths);

  const widgetConfigs = [...html.matchAll(/owwWidget\(([\s\S]{0,1600}?)\)/g)].map((match) => match[0]);
  console.log("\nowwWidget configs:");
  for (const config of widgetConfigs) {
    console.log(config.replace(/\s+/g, " ").slice(0, 1800));
  }

  const baseUrls = [...html.matchAll(/baseUrl\s*:\s*["']([^"']+)/g)].map((match) => match[1]);
  console.log("\nbaseUrl values:");
  console.log(baseUrls);

  const categorySnippets = [...html.matchAll(/selectedCategoryId|categoryId|categoryData|categories/g)]
    .slice(0, 30)
    .map((match) => html.slice(Math.max(0, match.index! - 250), match.index! + 700).replace(/\s+/g, " "));
  console.log("\ncategory snippets:");
  for (const snippet of categorySnippets) console.log(snippet);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
