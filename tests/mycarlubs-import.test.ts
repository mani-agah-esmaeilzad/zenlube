import test from "node:test";
import assert from "node:assert/strict";
import {
  extractOilCapacityLit,
  extractOilSpecification,
  extractServiceInterval,
  extractViscosities,
  htmlToPlainText,
  normalizeCarModelTitle,
} from "../scripts/lib/mycarlubs";

test("htmlToPlainText keeps list structure readable", () => {
  const source = "<ul><li>روغن موتور <strong>SAE 5W-30</strong></li><li>زمان تعویض 7000 کیلومتر</li></ul>";
  assert.equal(htmlToPlainText(source), "- روغن موتور SAE 5W-30\n- زمان تعویض 7000 کیلومتر");
});

test("extractViscosities returns ordered unique grades", () => {
  const source = "روغن موتور SAE 5W-30 و روغن موتور SAE 5W-40 و دوباره SAE 5W-30";
  assert.deepEqual(extractViscosities(source), ["5W-30", "5W-40"]);
});

test("extractOilSpecification collects API grades", () => {
  const source = "تاییدیه API SN یا API SP یا API SQ داشته باشد";
  assert.equal(extractOilSpecification(source), "API SN / API SP / API SQ");
});

test("extractOilCapacityLit prefers with-filter amount over purchase amount", () => {
  const source = "مقدار 4.9 لیتر با تعویض فیلتر روغن میباشد. مقدار 4.5 لیتر بدون تعویض فیلتر است. میزان 5 لیتر تهیه نمایید.";
  assert.equal(extractOilCapacityLit(source), 4.9);
});

test("extractServiceInterval parses kilometer and month/year hints", () => {
  const source = "زمان تعویض روغن ترمز در هر 50000 کیلومتر یا دو سال";
  const result = extractServiceInterval(source.replace("دو", "2"));
  assert.equal(result.intervalKm, 50000);
  assert.equal(result.intervalMonths, 24);
});

test("normalizeCarModelTitle removes duplicated Persian brand prefix", () => {
  assert.equal(normalizeCarModelTitle("ام جی 3", "ام جی"), "3");
  assert.equal(normalizeCarModelTitle("بی ام و F83 M4 مدل 2014-2019", "بی ام و"), "F83 M4 مدل 2014-2019");
});

test("normalizeCarModelTitle handles short aliases like بنز", () => {
  assert.equal(
    normalizeCarModelTitle("بنز C292.356 GLE400 فورماتیک 2015-2019", "مرسدس بنز"),
    "C292.356 GLE400 فورماتیک 2015-2019",
  );
  assert.equal(normalizeCarModelTitle("ون هیوندای H350", "هیوندای"), "ون H350");
});
