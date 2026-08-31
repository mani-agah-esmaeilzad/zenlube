import test from "node:test";
import assert from "node:assert/strict";

import {
  applyCarManualOverrides,
  resolveCarOilCapacityLabel,
} from "@/lib/car-manual-overrides";

test("applyCarManualOverrides replaces MG 5 source links with the official manual and fills missing values", () => {
  const car = applyCarManualOverrides({
    slug: "hyundai-1109-mg-5-1-5l-cvt",
    manufacturer: "ام جی",
    model: "MG 5",
    engineType: "4 سیلندر بنزینی 1.5 لیتر",
    engineCode: "MG-5",
    viscosity: "0W-20",
    specification: null,
    oilCapacityLit: null,
    overviewDetails: "ام جی MG 5\nمنبع صفحه خودرو: https://mycarlubs.com/car_details/1109",
    engineDetails: "ویسکوزیته پیشنهادی روغن موتور: 0W-20\nمنبع روغن موتور: https://mycarlubs.com/car_details/1109/category/1",
    gearboxDetails: "نوع گیربکس: CVT\nمنبع روغن گیربکس: https://mycarlubs.com/car_details/1109/category/3",
    notebookSections: [
      {
        categoryId: 1,
        id: "engine-oil",
        title: "روغن موتور",
        tag: "روانکار",
        sourceTitle: "روغن موتور",
        description: "داده قدیمی روغن موتور",
        sourceUrl: "https://mycarlubs.com/car_details/1109/category/1",
      },
      {
        categoryId: 3,
        id: "gearbox-oil",
        title: "روغن گیربکس",
        tag: "گیربکس",
        sourceTitle: "روغن گیربکس",
        description: "داده قدیمی گیربکس",
        sourceUrl: "https://mycarlubs.com/car_details/1109/category/3",
      },
    ],
  });

  assert.equal(car.engineCode, "15FCD");
  assert.equal(car.specification, "ACEA C5");
  assert.equal(car.oilCapacityLit, 4);
  assert.match(car.engineDetails ?? "", /0W-20/u);
  assert.match(car.engineDetails ?? "", /منبع رسمی دفترچه/u);

  const sections = car.notebookSections as Array<{ categoryId: number; description: string; sourceUrl?: string }>;
  const engineSection = sections.find((section) => section.categoryId === 1);
  const gearboxSection = sections.find((section) => section.categoryId === 3);

  assert.equal(engineSection?.sourceUrl, "https://media-hub-prod.mgmotor.me/manuals/MG_5_English.pdf");
  assert.equal(gearboxSection?.sourceUrl, "https://media-hub-prod.mgmotor.me/manuals/MG_5_English.pdf");
  assert.match(engineSection?.description ?? "", /C5 0W-20/u);
  assert.match(gearboxSection?.description ?? "", /6.86/u);
});

test("applyCarManualOverrides marks MG4 EV as electric and without engine oil service", () => {
  const car = applyCarManualOverrides({
    slug: "hyundai-1106-mg4-ev",
    manufacturer: "ام جی",
    model: "MG4",
    engineType: "بنزینی",
    engineCode: "MG4",
    viscosity: null,
    specification: null,
    oilCapacityLit: null,
    engineDetails: "ویسکوزیته پیشنهادی روغن موتور در منبع ثبت نشده است.",
    gearboxDetails: "اطلاعات روغن گیربکس در منبع برای این مدل ثبت نشده است.",
    notebookSections: [],
  });

  assert.equal(car.engineType, "برقی");
  assert.equal(car.viscosity, "فاقد روغن موتور");
  assert.equal(car.specification, "روغن موتور ندارد");
  assert.equal(resolveCarOilCapacityLabel(car), "فاقد روغن موتور");
});

test("resolveCarOilCapacityLabel falls back to manual text for MG7 multi-trim capacities", () => {
  const car = applyCarManualOverrides({
    slug: "hyundai-1105-mg7",
    manufacturer: "ام جی",
    model: "MG7",
    engineType: "بنزینی",
    engineCode: "MG7",
    viscosity: null,
    specification: null,
    oilCapacityLit: null,
    engineDetails: null,
    notebookSections: [],
  });

  assert.equal(resolveCarOilCapacityLabel(car), "4 لیتر برای 1.5T و 4.8 لیتر برای 2.0T");
});

test("MG GS and RX5 MGE 2.0T overrides use the SAIC C3 bulletin instead of stale C5 data", () => {
  for (const slug of ["hyundai-62-mg-gs", "hyundai-68-mg-rx5"]) {
    const car = applyCarManualOverrides({
      slug,
      manufacturer: "ام جی",
      model: slug.includes("rx5") ? "RX5" : "GS",
      engineType: "4 سیلندر بنزینی توربو 2 لیتر",
      engineCode: "20L4E",
      viscosity: "5W-30 / 0W-30",
      specification: "API SN / ACEA C5",
      oilCapacityLit: 6,
      engineDetails: null,
      notebookSections: [],
    });

    assert.equal(car.specification, "ACEA C3 / API SN یا بالاتر");
    assert.match(car.engineDetails ?? "", /MGE 2\.0T/u);

    const sections = car.notebookSections as Array<{ categoryId: number; description: string; sourceUrl?: string }>;
    const engineSection = sections.find((section) => section.categoryId === 1);
    assert.match(engineSection?.description ?? "", /ACEA C3/u);
    assert.equal(engineSection?.sourceUrl, "https://mg-wiki.com/media/oils/SI-ALL-EN-20170811-The.pdf");
  }
});
