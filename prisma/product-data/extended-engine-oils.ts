import {
  catalogProduct,
  mgMap,
  type CatalogCarMapping,
  type CatalogProductSeed,
} from "./catalog-types";

type BrandInfo = {
  slug: string;
  name: string;
  website: string;
  origin: string;
};

type EngineOilFamily = {
  model: string;
  slug: string;
  sku: string;
  viscosity: string;
  oilType: string;
  approvals: string;
  image: string;
  packImages?: Partial<Record<number, string>>;
  summary: string;
  source: string;
  packs: number[];
  specs?: Record<string, string>;
  tags?: string[];
  mappings?: CatalogCarMapping[];
};

const BARELIZ: BrandInfo = {
  slug: "bareliz",
  name: "بارلیز",
  website: "https://petrosharlub.com",
  origin: "ایران",
};
const Aisin: BrandInfo = {
  slug: "aisin",
  name: "آیسین",
  website: "https://aisinaftermarket.com",
  origin: "ژاپن",
};
const FOSSER: BrandInfo = {
  slug: "fosser",
  name: "فوسر",
  website: "https://fosser.de",
  origin: "آلمان",
};
const ZIC: BrandInfo = {
  slug: "zic",
  name: "زیک",
  website: "https://www.skzic.com/eng",
  origin: "کره جنوبی",
};

function oilFamily(brand: BrandInfo, family: EngineOilFamily): CatalogProductSeed[] {
  return family.packs.map((litres) =>
    catalogProduct({
      brandSlug: brand.slug,
      brandName: brand.name,
      brandWebsite: brand.website,
      categorySlug: "engine-oil",
      title: `روغن موتور ${brand.name} ${family.model} ${family.viscosity}`,
      latinName: `${brand.name} ${family.model} ${family.viscosity}`,
      volumeLabel: `حجم ${litres} لیتر`,
      slug: `${brand.slug}-${family.slug}-${litres}l`,
      sku: `${family.sku}-${litres}L`,
      summary: family.summary,
      productType: "روغن موتور",
      viscosity: family.viscosity,
      oilType: family.oilType,
      imageUrl: family.packImages?.[litres] ?? family.image,
      approvals: family.approvals,
      packagingSizeLit: litres,
      originCountry: brand.origin,
      productSourceUrl: family.source,
      specifications: family.specs,
      tags: [family.viscosity, ...(family.tags ?? [])],
      carMappings: family.mappings,
    }),
  );
}

const classicMgMaps = [
  mgMap(
    "hyundai-27-mg-550-1-8l-turbo",
    "برای موتور 18K4 توربو، گرانروی 5W-40 و سطح ACEA A3/B4 با توصیه فنی این خانواده هم‌خوان است؛ حجم سرویس حدود ۴.۹ لیتر است.",
  ),
  mgMap(
    "hyundai-66-mg6-1-8t",
    "برای موتور 18K4 توربو، گرانروی 5W-40 و سطح ACEA A3/B4 مناسب است؛ حجم سرویس حدود ۵.۱ لیتر است.",
  ),
  mgMap(
    "hyundai-67-mg6-new",
    "دفترچه MG6 نیوفیس روغن تمام‌سنتتیک 5W-40 با سطح API جدید را مجاز می‌داند؛ حجم سرویس حدود ۴.۹ لیتر است.",
  ),
];

const c3MgMaps = [
  mgMap(
    "hyundai-62-mg-gs",
    "موتور 2.0T این خودرو به 5W-30 با ACEA C3 نیاز دارد؛ ظرفیت سرویس حدود ۶ لیتر است.",
  ),
  mgMap(
    "hyundai-68-mg-rx5",
    "موتور 2.0T این خودرو به 5W-30 با ACEA C3 نیاز دارد؛ ظرفیت سرویس حدود ۶ لیتر است.",
  ),
];

const mg5w30Maps = [
  mgMap(
    "hyundai-60-mg-3-1-5l",
    "دفترچه MG3 روغن تمام‌سنتتیک 5W-30 با API SN یا بالاتر را مجاز می‌داند؛ حجم سرویس ۴.۵ لیتر است.",
  ),
  mgMap(
    "hyundai-66-mg6-1-8t",
    "روغن تمام‌سنتتیک 5W-30 در فهرست گریدهای مجاز MG6 قدیم قرار دارد؛ حجم سرویس ۵.۱ لیتر است.",
  ),
  mgMap(
    "hyundai-67-mg6-new",
    "روغن تمام‌سنتتیک 5W-30 در فهرست گریدهای مجاز MG6 نیوفیس قرار دارد؛ حجم سرویس ۴.۹ لیتر است.",
  ),
];

const barelizEngineOils = [
  ...oilFamily(BARELIZ, {
    model: "BZ1",
    slug: "bz1-5w40-sn-a3b4",
    sku: "BAR-BZ1-0540-SN",
    viscosity: "5W-40",
    oilType: "تمام‌سنتتیک PAO گروه IV",
    approvals:
      "API SN؛ ACEA A3/B4؛ VW 502 00/505 00؛ MB 229.3/229.5؛ BMW LL-01؛ Porsche A40؛ RN 0700/0710",
    image: "/products/bareliz/bz1-5w40.png",
    summary:
      "روغن تمام‌سنتتیک سری BZ1 با پایه گروه IV برای موتورهای بنزینی و دیزلی بدون فیلتر ذرات طراحی شده و پایداری دمایی و محافظت سایشی بالایی دارد.",
    source: "https://petrosharlub.com/product/14",
    packs: [4, 1],
    mappings: classicMgMaps,
  }),
  ...oilFamily(BARELIZ, {
    model: "BZ1",
    slug: "bz1-5w30-sn-c3",
    sku: "BAR-BZ1-0530-SN",
    viscosity: "5W-30",
    oilType: "تمام‌سنتتیک PAO گروه IV",
    approvals:
      "API SN؛ ACEA C3؛ ILSAC GF-5؛ VW 504 00/507 00؛ MB 229.51/229.52؛ BMW LL-04؛ GM dexos2؛ Porsche C30",
    image: "/products/bareliz/bz1-5w30.png",
    summary:
      "روغن کم‌خاکستر BZ1 5W-30 برای موتورهای مدرن بنزینی و دیزلی مجهز به سامانه‌های کنترل آلایندگی ساخته شده است.",
    source: "https://petrosharlub.com/product/13",
    packs: [4, 1],
    mappings: c3MgMaps,
  }),
  ...oilFamily(BARELIZ, {
    model: "BZ1 SN BZ",
    slug: "bz1-10w40-snbz",
    sku: "BAR-BZ1-1040-SNBZ",
    viscosity: "10W-40",
    oilType: "نیمه‌سنتتیک",
    approvals: "API SN؛ ACEA A3/B4؛ MB 229.1؛ VW 501 01/505 00",
    image: "/products/bareliz/bz1-10w40.png",
    summary:
      "روغن چنددرجه‌ای BZ1 10W-40 برای کارکرد روزانه موتورهای بنزینی و دیزلی سبک تهیه شده و پاک‌کنندگی و کنترل اکسیداسیون مناسبی دارد.",
    source: "https://petrosharlub.com/product/12",
    packs: [4, 1],
  }),
  ...oilFamily(BARELIZ, {
    model: "M7 Racing",
    slug: "m7-racing-10w60",
    sku: "BAR-M7-1060",
    viscosity: "10W-60",
    oilType: "تمام‌سنتتیک PAO و استر",
    approvals: "API SP؛ JASO MA2",
    image: "/products/bareliz/m7-10w60.png",
    summary:
      "روغن مسابقه‌ای M7 برای موتورهای پرفشار و دمای بالا فرموله شده و از ترکیب پایه PAO و استر برای استحکام فیلم روغن استفاده می‌کند.",
    source: "https://petrosharlub.com/product/149",
    packs: [1],
  }),
  ...oilFamily(BARELIZ, {
    model: "M7 Racing",
    slug: "m7-racing-5w50",
    sku: "BAR-M7-0550",
    viscosity: "5W-50",
    oilType: "تمام‌سنتتیک PAO و استر",
    approvals: "API SP؛ JASO MA2",
    image: "/products/bareliz/m7-5w50.png",
    summary:
      "گرید 5W-50 خانواده مسابقه‌ای M7 برای استارت سرد بهتر همراه با حفظ فیلم روغن در فشار و دمای زیاد طراحی شده است.",
    source: "https://www.linkedin.com/company/bareliz-lubricants/",
    packs: [1],
  }),
  ...oilFamily(BARELIZ, {
    model: "BZ7",
    slug: "bz7-5w30-sp",
    sku: "BAR-BZ7-0530-SP",
    viscosity: "5W-30",
    oilType: "تمام‌سنتتیک",
    approvals: "API SP؛ ILSAC GF-6A",
    image: "/products/bareliz/bz7-5w30-sp.png",
    summary:
      "روغن نسل جدید BZ7 با سطح API SP برای کاهش رسوب، محافظت زنجیر تایم و مقابله با پیش‌احتراق دورپایین در موتورهای توربو طراحی شده است.",
    source: "https://petrosharlub.com/product/83",
    packs: [1],
  }),
  ...oilFamily(BARELIZ, {
    model: "BZ7",
    slug: "bz7-5w40-sp",
    sku: "BAR-BZ7-0540-SP",
    viscosity: "5W-40",
    oilType: "تمام‌سنتتیک PAO و استر",
    approvals: "API SP",
    image: "/products/bareliz/bz7-5w40-sp.png",
    summary:
      "روغن BZ7 5W-40 با پایه سنتتیک برای موتورهای بنزینی جدید، حفاظت در برابر LSPI و پایداری بهتر در دمای بالا ساخته شده است.",
    source: "https://petrosharlub.com/product/84",
    packs: [1],
  }),
];

const aisinEngineOils = oilFamily(Aisin, {
  model: "evoTECH+ PAO",
  slug: "evotech-plus-pao-5w30-sn",
  sku: "AIS-ESEN0535PC-0530-SN",
  viscosity: "5W-30",
  oilType: "تمام‌سنتتیک PAO",
  approvals: "API SN؛ ACEA A3/B4",
  image: "/products/aisin/evotech-5w30.webp",
  summary:
    "روغن موتور evoTECH+ آیسین با پایه PAO برای موتورهای بنزینی و دیزلی سواری طراحی شده و کنترل رسوب و پایداری برشی بالایی ارائه می‌دهد.",
  source: "https://aisinaftermarket.com/products/33/6",
  packs: [5],
  specs: { "کد قطعه رسمی": "ESEN0535PC" },
  mappings: mg5w30Maps,
});

const fosserEngineOils = [
  ...oilFamily(FOSSER, {
    model: "Premium Plus",
    slug: "premium-plus-0w40",
    sku: "FOS-PP-0040",
    viscosity: "0W-40",
    oilType: "تمام‌سنتتیک",
    approvals: "API SN/CF؛ ACEA A3/B4؛ MB 229.5؛ VW 502 00/505 00؛ BMW LL-01؛ Porsche A40",
    image: "/products/fosser/premium-plus-0w40.png",
    summary:
      "Premium Plus 0W-40 روغن تمام‌سنتتیک برای استارت سرد سریع و حفظ فیلم روانکار در بار و دمای بالا است.",
    source: "https://petrosharlub.com/product-category/fosser/",
    packs: [4],
  }),
  ...oilFamily(FOSSER, {
    model: "Premium LA",
    slug: "premium-la-5w40",
    sku: "FOS-PLA-0540",
    viscosity: "5W-40",
    oilType: "تمام‌سنتتیک Low SAPS",
    approvals: "API SN/CF؛ ACEA C3؛ MB 229.51؛ BMW LL-04؛ GM dexos2؛ VW 505 00/505 01",
    image: "/products/fosser/premium-la-5w40.png",
    summary:
      "Premium LA 5W-40 روغن کم‌خاکستر برای موتورهای مدرن مجهز به فیلتر ذرات است و از سامانه‌های کنترل آلایندگی محافظت می‌کند.",
    source: "https://petrosharlub.com/product-category/fosser/",
    packs: [1],
  }),
  ...oilFamily(FOSSER, {
    model: "Premium Longlife",
    slug: "premium-longlife-5w30",
    sku: "FOS-PLL-0530",
    viscosity: "5W-30",
    oilType: "تمام‌سنتتیک",
    approvals:
      "API SN/CF؛ ACEA A3/B4؛ MB 229.3/229.5؛ VW 502 00/505 00؛ BMW LL-01؛ RN 0700/0710",
    image: "/products/fosser/premium-longlife-5w30.jpg",
    summary:
      "Premium Longlife 5W-30 برای فواصل سرویس طولانی و حفاظت موتورهای بنزینی و دیزلی بدون DPF تولید شده است.",
    source: "https://fosser.de/en/product/fosser-premium-longlife-5w-30/",
    packs: [4, 1],
    specs: {
      "گرانروی سینماتیک در ۴۰°C": "72.5 cSt",
      "گرانروی سینماتیک در ۱۰۰°C": "12.0 cSt",
      "نقطه ریزش": "‎-39°C",
    },
    mappings: mg5w30Maps,
  }),
  ...oilFamily(FOSSER, {
    model: "Drive TS",
    slug: "drive-ts-10w40",
    sku: "FOS-DTS-1040",
    viscosity: "10W-40",
    oilType: "نیمه‌سنتتیک",
    approvals: "API SN/CF؛ ACEA A3/B4؛ MB 229.1؛ VW 502 00/505 00؛ RN 0700؛ PSA B71 2296",
    image: "/products/fosser/drive-ts-10w40.webp",
    summary:
      "Drive TS 10W-40 روغن نیمه‌سنتتیک برای کارکرد روزمره است و پاکیزگی موتور و مقاومت اکسیداسیونی خوبی فراهم می‌کند.",
    source: "https://fosser.de/en/product/fosser-drive-ts-10w-40/",
    packs: [4],
    specs: { "شاخص گرانروی": "158", "نقطه ریزش": "‎-42°C", "TBN": "10.1 mgKOH/g" },
  }),
  ...oilFamily(FOSSER, {
    model: "Premium GM",
    slug: "premium-gm-0w20",
    sku: "FOS-PGM-0020",
    viscosity: "0W-20",
    oilType: "تمام‌سنتتیک",
    approvals: "API SQ/SP Resource Conserving؛ ILSAC GF-7A/GF-6A/GF-5؛ GM dexos1 Gen 3",
    image: "/products/fosser/premium-gm-0w20.jpg",
    summary:
      "Premium GM 0W-20 نسل جدید روغن کم‌گرانروی برای موتورهای بنزینی و هیبریدی است و محافظت در برابر LSPI و رسوب را هدف می‌گیرد.",
    source: "https://fosser.de/en/product/fosser-premium-gm-0w-20/",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "172", "نقطه ریزش": "‎-45°C", "نقطه اشتعال": "234°C" },
  }),
];

const zicEngineOils = [
  ...oilFamily(ZIC, {
    model: "X9",
    slug: "x9-5w40",
    sku: "ZIC-X9-0540",
    viscosity: "5W-40",
    oilType: "تمام‌سنتتیک VHVI",
    approvals:
      "API SQ؛ ACEA A3/B4؛ MB-Approval 229.3/229.5؛ VW 502 00/505 00؛ RN 0700/0710؛ BMW LL-01؛ Porsche A40",
    image: "/products/zic/x9-5w40-4l.png",
    packImages: { 1: "/products/zic/x9-5w40-1l.png" },
    summary:
      "ZIC X9 روغن تمام‌سنتتیک پرچم‌دار برای حفاظت موتورهای بنزینی، LPG و دیزلی بدون DPF در شرایط سخت است.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/detail.do?menu_idx=170&prductCode=PROCD0000173&sCtgryCode=CA0000000017",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "172", "نقطه ریزش": "‎-39°C", "HTHS در ۱۵۰°C": "3.8 mPa·s" },
    mappings: classicMgMaps,
  }),
  ...oilFamily(ZIC, {
    model: "X9 ZERO",
    slug: "x9-zero-0w20",
    sku: "ZIC-X9Z-0020",
    viscosity: "0W-20",
    oilType: "تمام‌سنتتیک YUBASE Plus",
    approvals: "API SQ؛ ILSAC GF-7A؛ GM dexos1 Gen 3",
    image: "/products/zic/zero-0w20-4l.png",
    packImages: { 1: "/products/zic/zero-0w20-1l.png" },
    summary:
      "X9 ZERO 0W-20 روغن کم‌گرانروی برای خودروهای بنزینی و هیبریدی است و مصرف سوخت، رسوب و محافظت استارت سرد را بهبود می‌دهد.",
    source:
      "https://www.skzic.com/productmanage/info/product/detail.do?menu_idx=213&prductCode=PROCD0000054&sCtgryCode=CA0000000001",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "170", "نقطه ریزش": "‎-42°C", "HTHS در ۱۵۰°C": "2.7 mPa·s" },
  }),
  ...oilFamily(ZIC, {
    model: "X9 ZERO",
    slug: "x9-zero-0w16",
    sku: "ZIC-X9Z-0016",
    viscosity: "0W-16",
    oilType: "تمام‌سنتتیک YUBASE Plus",
    approvals: "API SQ؛ ILSAC GF-7B؛ ACEA C7",
    image: "/products/zic/zero-0w16-4l.png",
    summary:
      "X9 ZERO 0W-16 برای موتورهایی ساخته شده که دفترچه آن‌ها صراحتاً گرانروی فوق‌کم 0W-16 را مجاز می‌داند و برای خودروهای هیبریدی مناسب است.",
    source:
      "https://www.skzic.com/productmanage/info/product/detail.do?menu_idx=213&prductCode=PROCD0000054&sCtgryCode=CA0000000001",
    packs: [4],
    specs: { "شاخص گرانروی": "160", "نقطه ریزش": "‎-45°C", "HTHS در ۱۵۰°C": "2.4 mPa·s" },
  }),
  ...oilFamily(ZIC, {
    model: "X7 SQ",
    slug: "x7-5w30-sq",
    sku: "ZIC-X7-0530-SQ",
    viscosity: "5W-30",
    oilType: "تمام‌سنتتیک YUBASE",
    approvals: "API SQ؛ ILSAC GF-7A",
    image: "/products/zic/x7-5w30-sq-4l.png",
    packImages: { 1: "/products/zic/x7-5w30-sq-1l.png" },
    summary:
      "ZIC X7 5W-30 SQ برای موتورهای بنزینی، LPG و توربو GDI جدید ساخته شده و محافظت LSPI و پاکیزگی موتور را بهبود می‌دهد.",
    source:
      "https://www.skzic.com/productmanage/info/product/detail.do?menu_idx=11&prductCode=PROCD0000039&sCtgryCode=CA0000000001",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "160", "نقطه ریزش": "‎-42°C", "گرانروی در ۱۰۰°C": "10.97 cSt" },
  }),
  ...oilFamily(ZIC, {
    model: "X9",
    slug: "x9-5w30",
    sku: "ZIC-X9-0530",
    viscosity: "5W-30",
    oilType: "تمام‌سنتتیک VHVI",
    approvals: "ACEA A3/B4؛ MB-Approval 229.3/229.5؛ VW 502 00/505 00؛ BMW LL-01؛ RN 0700/0710",
    image: "/products/zic/x9-5w30-4l.png",
    packImages: { 1: "/products/zic/x9-5w30-1l.png" },
    summary:
      "X9 5W-30 روغن تمام‌سنتتیک اروپایی برای موتورهای بنزینی، LPG و دیزلی بدون DPF است و استحکام فیلم روغن بالایی دارد.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/detail.do?menu_idx=170&prductCode=PROCD0000173&sCtgryCode=CA0000000017",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "167", "نقطه ریزش": "‎-39°C", "HTHS در ۱۵۰°C": "3.6 mPa·s" },
    mappings: mg5w30Maps,
  }),
  ...oilFamily(ZIC, {
    model: "X7+",
    slug: "x7-plus-10w40",
    sku: "ZIC-X7P-1040",
    viscosity: "10W-40",
    oilType: "تمام‌سنتتیک VHVI",
    approvals: "API SP؛ ILSAC GF-6A",
    image: "/products/zic/x7-10w40.jpg",
    summary:
      "X7+ 10W-40 برای موتورهای بنزینی و دوگانه‌سوز طراحی شده و کنترل رسوب، دوام اکسیداسیونی و محافظت LSPI را ارائه می‌کند.",
    source:
      "https://m.skzic.com/eng/productmanage/info/product/detail.do?menu_idx=&prductCode=PROCD0000169&sCtgryCode=CA0000000017",
    packs: [4],
    specs: { "شاخص گرانروی": "150", "نقطه ریزش": "‎-39°C", "HTHS در ۱۵۰°C": "4.1 mPa·s" },
  }),
];

export const extendedEngineOils: CatalogProductSeed[] = [
  ...barelizEngineOils,
  ...aisinEngineOils,
  ...fosserEngineOils,
  ...zicEngineOils,
];
