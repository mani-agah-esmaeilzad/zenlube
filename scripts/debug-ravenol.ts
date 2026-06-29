export {};

async function main() {
  const html = await fetch("https://choise.ravenol.com/", { headers: { "user-agent": "test" } }).then((r) => r.text());
  for (const needle of ["foton", "amico", "pickup", "hunter"]) {
    const hits = [...html.matchAll(new RegExp(`href=\"(/1-cars/[^\"]*${needle}[^\"]*)\"`, "gi"))].map((m) => m[1]);
    console.log(needle, hits.slice(0, 5));
  }
}

main().catch(console.error);
