export {};

async function main() {
  const html = await fetch("https://www.liqui-moly.com/en/service/oil-guide.html", {
    headers: { "user-agent": "test" },
  }).then((r) => r.text());

  const interesting = html.match(/data-[a-z-]+=\"[^\"]{0,200}\"/gi)?.slice(0, 20);
  console.log("data attrs", interesting);

  for (const pattern of ["fetch\\(", "axios", "vehicle", "manufacturer", "oilGuide", "oilguide", "typo3", "powermail", "oww"]) {
    const count = (html.match(new RegExp(pattern, "gi")) ?? []).length;
    console.log(pattern, count);
  }

  const urls = [...html.matchAll(/https:\/\/www\.liqui-moly\.com[^\"'\s<>]+/g)].map((m) => m[0]);
  const unique = [...new Set(urls)].filter((u) => /vehicle|manufacturer|oil|guide|api|json/i.test(u)).slice(0, 40);
  console.log("urls", unique);

  for (const needle of ["data-oww-client-id", "oilGuide", "oww", "fetch("]) {
    const index = html.indexOf(needle);
    console.log(`\n--- ${needle} ${index}`);
    console.log(html.slice(Math.max(0, index - 1000), index + 2000));
  }

  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((match) => match[1]);
  console.log(
    "scripts",
    scripts.filter((src) => /oww|oil|guide|app|main|require|bundle|js/i.test(src)).slice(0, 100),
  );
}

main().catch(console.error);
