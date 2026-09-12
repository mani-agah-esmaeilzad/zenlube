import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("all original Vazirmatn weights and subsets are locally available with unchanged font behavior", () => {
  const css = readFileSync("src/app/vazirmatn.css", "utf8");
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => match[1]);
  assert.equal(faces.length, 18);
  for (const weight of [400, 500, 600, 700, 800, 900]) {
    for (const subset of ["arabic", "latin", "latin-ext"]) {
      const face = faces.find(value => value.includes(`vazirmatn-${subset}-${weight}-normal.woff2`));
      assert.ok(face);
      assert.ok(face.includes("font-family: 'Vazirmatn'"));
      assert.ok(face.includes(`font-weight: ${weight};`));
      assert.ok(face.includes("font-display: swap;"));
      assert.ok(face.includes("unicode-range:"));
      for (const extension of ["woff2", "woff"]) {
        const path = `/fonts/vazirmatn/vazirmatn-${subset}-${weight}-normal.${extension}`;
        assert.ok(face.includes(path));
        assert.equal(readFileSync(`public${path}`).subarray(0, 4).toString(), extension === "woff2" ? "wOF2" : "wOFF");
      }
    }
  }
  assert.equal(css.includes("https://fonts.bunny.net"), false);
  assert.ok(readFileSync("public/fonts/vazirmatn/OFL.txt", "utf8").includes("SIL OPEN FONT LICENSE"));
  assert.equal(readFileSync("src/app/globals.css", "utf8").includes('@import "./vazirmatn.css"'), true);
});
