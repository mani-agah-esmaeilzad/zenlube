export {};

async function main() {
  const html = await fetch("https://www.motul.com/en/lubricants/oil-selector", {
    headers: { "user-agent": "test", accept: "text/html" },
  }).then((r) => r.text());

  console.log("status ok, len", html.length);
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((m) => m[1]);
  console.log(
    "scripts",
    scripts.filter((s) => /oil|vehicle|selector|main|app/i.test(s)),
  );

  const apiPaths = [...html.matchAll(/["'](\/[^"']*(?:api|vehicle|manufacturer|selector|oil)[^"']*)["']/gi)]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 40);
  console.log("paths", apiPaths);

  const jsonBlocks = [...html.matchAll(/type=\"application\/json\"[^>]*>([\s\S]*?)<\/script>/g)].slice(0, 3);
  console.log("json blocks", jsonBlocks.length);
}

main().catch(console.error);
