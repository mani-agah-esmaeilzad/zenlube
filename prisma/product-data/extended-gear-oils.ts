import {
  catalogProduct,
  mgMap,
  type CatalogCarMapping,
  type CatalogProductSeed,
} from "./catalog-types";

type BrandInfo = { slug: string; name: string; website: string; origin: string };
type GearFamily = {
  model: string;
  slug: string;
  sku: string;
  fluidType: string;
  viscosity?: string;
  approvals: string;
  image: string;
  packImages?: Partial<Record<number, string>>;
  summary: string;
  source: string;
  packs: number[];
  specs?: Record<string, string>;
  mappings?: CatalogCarMapping[];
};

const brands = {
  bareliz: {
    slug: "bareliz",
    name: "بارلیز",
    website: "https://petrosharlub.com",
    origin: "ایران",
  },
  fosser: { slug: "fosser", name: "فوسر", website: "https://fosser.de", origin: "آلمان" },
  aisin: {
    slug: "aisin",
    name: "آیسین",
    website: "https://www.aisin.com.sg",
    origin: "ژاپن",
  },
  aidlube: {
    slug: "aidlube",
    name: "ایدلوب",
    website: "https://aidlube.de",
    origin: "ایران (با فناوری آلمان)",
  },
  xado: { slug: "xado", name: "زادو", website: "https://xado.com", origin: "اوکراین" },
  zic: {
    slug: "zic",
    name: "زیک",
    website: "https://www.skzic.com/eng",
    origin: "کره جنوبی",
  },
  caspian: {
    slug: "caspian",
    name: "کاسپین",
    website: "https://caspian.com",
    origin: "ایران",
  },
} satisfies Record<string, BrandInfo>;

function gearFamily(brand: BrandInfo, family: GearFamily): CatalogProductSeed[] {
  return family.packs.map((litres) =>
    catalogProduct({
      brandSlug: brand.slug,
      brandName: brand.name,
      brandWebsite: brand.website,
      categorySlug: "gear-oil",
      title: `روغن گیربکس ${brand.name} ${family.model}`,
      latinName: `${brand.name} ${family.model}`,
      volumeLabel: `حجم ${litres} لیتر`,
      slug: `${brand.slug}-${family.slug}-${litres}l`,
      sku: `${family.sku}-${litres}L`,
      summary: family.summary,
      productType: family.fluidType,
      viscosity: family.viscosity,
      oilType: "روغن گیربکس",
      imageUrl: family.packImages?.[litres] ?? family.image,
      approvals: family.approvals,
      packagingSizeLit: litres,
      originCountry: brand.origin,
      productSourceUrl: family.source,
      specifications: family.specs,
      tags: [family.fluidType, ...(family.viscosity ? [family.viscosity] : [])],
      carMappings: family.mappings,
    }),
  );
}

const mg3ManualMaps = [
  mgMap(
    "hyundai-60-mg-3-1-5l",
    "بخش دنده گیربکس AMT این خودرو به 75W-80 یا 75W-90 با API GL-4/GL-5 و ظرفیت حدود ۱.۸ لیتر نیاز دارد؛ این روغن برای مدار عملگر نیست.",
  ),
];
const mgAisin3309Maps = [
  mgMap(
    "hyundai-61-mg-350",
    "گیربکس AW 81-40LE این خودرو روغن JWS 3309 / Toyota T-IV را می‌پذیرد؛ ظرفیت کامل حدود ۵.۶ لیتر است.",
  ),
  mgMap(
    "hyundai-27-mg-550-1-8l-turbo",
    "گیربکس AW55-50SN این خودرو روغن JWS 3309 / Toyota T-IV را می‌پذیرد؛ ظرفیت کامل حدود ۷.۸ لیتر است.",
  ),
  mgMap(
    "hyundai-66-mg6-1-8t",
    "گیربکس اتومات آیسین این نسل روغن JWS 3309 / Toyota T-IV را می‌پذیرد؛ ظرفیت کامل حدود ۷.۱ لیتر است.",
  ),
];
const mgWetDctMaps = [
  mgMap(
    "hyundai-67-mg6-new",
    "گیربکس 6DCT360 تر این خودرو به VW TL 052 182 / FFL-2/3/4 نیاز دارد؛ تعویض دستی حدود ۴ لیتر است.",
  ),
  mgMap(
    "hyundai-62-mg-gs",
    "گیربکس دوکلاچه تر این خودرو به سیال سازگار با VW TL 052 182 نیاز دارد؛ ظرفیت و روش سرویس باید با دفترچه کنترل شود.",
  ),
  mgMap(
    "hyundai-68-mg-rx5",
    "گیربکس دوکلاچه تر این خودرو به سیال سازگار با VW TL 052 182 نیاز دارد؛ ظرفیت و روش سرویس باید با دفترچه کنترل شود.",
  ),
];

const barelizGearOils = [
  ...gearFamily(brands.bareliz, {
    model: "G5 75W-80",
    slug: "g5-75w80",
    sku: "BAR-G5-7580",
    fluidType: "روغن دنده دستی",
    viscosity: "75W-80",
    approvals: "API GL-4/GL-5؛ ZF TE-ML 07A",
    image: "/products/bareliz/g5-75w80.png",
    summary:
      "G5 75W-80 روغن دنده چندمنظوره فشارپذیر برای گیربکس‌های دستی و دیفرانسیل‌هایی است که سازنده این سطح را مجاز کرده است.",
    source: "https://petrosharlub.com/product/97",
    packs: [1],
    mappings: mg3ManualMaps,
  }),
  ...gearFamily(brands.bareliz, {
    model: "ATF AL4/DP0",
    slug: "atf-al4-dp0",
    sku: "BAR-ATF-AL4",
    fluidType: "روغن گیربکس اتوماتیک",
    approvals: "PSA AL4؛ Renault DP0؛ Renaultmatic D3 Syn",
    image: "/products/bareliz/atf-al4.png",
    summary:
      "ATF AL4/DP0 بارلیز به‌صورت اختصاصی برای گیربکس‌های اتوماتیک چهارسرعته خانواده AL4 و DP0 فرموله شده است.",
    source: "https://petrosharlub.com/product/6",
    packs: [1],
  }),
  ...gearFamily(brands.bareliz, {
    model: "ATF DCT",
    slug: "atf-dct",
    sku: "BAR-ATF-DCT",
    fluidType: "روغن گیربکس دوکلاچه تر",
    approvals: "DCT/DSG تر؛ استفاده فقط پس از تطبیق کد سیال سازنده",
    image: "/products/bareliz/atf-dct.png",
    summary:
      "ATF DCT بارلیز برای سامانه‌های دوکلاچه تر ساخته شده و اصطکاک کلاچ، خنک‌کاری و تعویض نرم دنده را پشتیبانی می‌کند.",
    source: "https://petrosharlub.com/product/30",
    packs: [1],
  }),
  ...gearFamily(brands.bareliz, {
    model: "DMT 75W",
    slug: "dmt-75w",
    sku: "BAR-DMT-75W",
    fluidType: "روغن گیربکس دوکلاچه خشک",
    viscosity: "75W",
    approvals: "DCT خشک / MTF؛ استفاده مطابق کد سیال سازنده",
    image: "/products/bareliz/dmt-75w.png",
    summary:
      "DMT 75W برای بخش چرخ‌دنده گیربکس‌های دوکلاچه خشک و دستی جدید طراحی شده و با ATF گیربکس دوکلاچه تر متفاوت است.",
    source: "https://petrosharlub.com/product/154",
    packs: [1],
  }),
  ...gearFamily(brands.bareliz, {
    model: "G5 75W-90",
    slug: "g5-75w90",
    sku: "BAR-G5-7590",
    fluidType: "روغن دنده دستی و دیفرانسیل",
    viscosity: "75W-90",
    approvals: "API GL-4/GL-5",
    image: "/products/bareliz/g5-75w90.png",
    summary:
      "G5 75W-90 برای گیربکس دستی و دیفرانسیل در بار و دمای گسترده ساخته شده و محافظت فشار بالا فراهم می‌کند.",
    source: "https://petrosharlub.com/product/198",
    packs: [1],
    mappings: mg3ManualMaps,
  }),
  ...gearFamily(brands.bareliz, {
    model: "ATF Multi 4-9 Speed",
    slug: "atf-multi-4-9-speed",
    sku: "BAR-ATF-M49",
    fluidType: "روغن گیربکس اتوماتیک چندخودرویی",
    approvals: "ATF چهار تا نه سرعته؛ برای DCT و CVT مناسب نیست",
    image: "/products/bareliz/atf-multi-4-9.png",
    summary:
      "ATF Multi 4-9 Speed برای طیف گسترده گیربکس‌های اتوماتیک پله‌ای طراحی شده و برای CVT یا DCT نباید استفاده شود.",
    source: "https://petrosharlub.com/product/153",
    packs: [1],
  }),
];

const fosserGearOils = [
  ...gearFamily(brands.fosser, {
    model: "Dexron D-VI",
    slug: "dexron-d-vi",
    sku: "FOS-ATF-DVI",
    fluidType: "روغن گیربکس اتوماتیک کم‌گرانروی",
    approvals: "GM Dexron VI؛ Ford Mercon LV؛ Toyota WS؛ Hyundai/Kia SP-IV؛ MB 236.14/15",
    image: "/products/fosser/dexron-vi.jpg",
    summary:
      "Dexron D-VI روغن تمام‌سنتتیک کم‌گرانروی برای گیربکس‌های اتوماتیک جدید است و نباید جایگزین سیال‌های CVT یا DCT شود.",
    source: "https://fosser.de/en/product/fosser-dexron-d-vi/",
    packs: [1],
    specs: { "شاخص گرانروی": "161", "نقطه ریزش": "‎-48°C", "گرانروی در ۱۰۰°C": "6.0 cSt" },
  }),
  ...gearFamily(brands.fosser, {
    model: "ATF CVT",
    slug: "atf-cvt",
    sku: "FOS-ATF-CVT",
    fluidType: "روغن گیربکس CVT",
    approvals: "CVT تسمه‌ای و زنجیری چندخودرویی؛ نه DCT و نه e-CVT هیبریدی",
    image: "/products/fosser/atf-cvt.png",
    summary:
      "ATF CVT فوسر برای انتقال قدرت پیوسته تسمه‌ای و زنجیری طراحی شده و پایداری اصطکاکی و ضدلرزش فراهم می‌کند.",
    source: "https://fosser.de/en/product/fosser-atf-cvt/",
    packs: [1],
    specs: { "شاخص گرانروی": "173", "نقطه ریزش": "‎-51°C", "گرانروی در ۱۰۰°C": "7.3 cSt" },
  }),
  ...gearFamily(brands.fosser, {
    model: "ATF MB 15",
    slug: "atf-mb-15",
    sku: "FOS-ATF-MB15",
    fluidType: "روغن گیربکس اتوماتیک مرسدس",
    approvals: "MB 236.15؛ مخصوص 7G-Tronic Plus؛ رنگ آبی؛ با MB 236.14 اختلاط نشود",
    image: "/products/fosser/atf-mb15.jpg",
    summary:
      "ATF MB 15 سیال کم‌گرانروی اختصاصی گیربکس‌های مرسدس 7G-Tronic Plus است و سازگاری معکوس عمومی ندارد.",
    source: "https://fosser.de/en/product/fosser-atf-mb-15/",
    packs: [1],
    specs: { رنگ: "آبی", "شاخص گرانروی": "158", "نقطه ریزش": "‎-42°C" },
  }),
  ...gearFamily(brands.fosser, {
    model: "ATF 6 Speed BMW/ZF 6HP",
    slug: "atf-6hp-bmw",
    sku: "FOS-ATF-6HP",
    fluidType: "روغن گیربکس اتوماتیک ZF",
    approvals: "ZF 6HP و 5HP؛ ZF LifeguardFluid 6؛ BMW M-1375.4",
    image: "/products/fosser/atf-6-speed.png",
    summary:
      "ATF 6 Speed برای گیربکس‌های ZF 6HP و برخی خانواده‌های قدیمی‌تر 5HP تولید شده و تعویض نرم و دوام حرارتی را پشتیبانی می‌کند.",
    source: "https://fosser.de/en/product/fosser-atf-6-speed/",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "154", "نقطه ریزش": "‎-42°C", رنگ: "زرد-قهوه‌ای" },
  }),
  ...gearFamily(brands.fosser, {
    model: "ATF 8 Speed BMW/ZF 8HP",
    slug: "atf-8hp-bmw",
    sku: "FOS-ATF-8HP",
    fluidType: "روغن گیربکس اتوماتیک ZF",
    approvals: "ZF 6HP/8HP/9HP؛ ZF LifeguardFluid 8؛ BMW L12108",
    image: "/products/fosser/atf-8-speed.jpg",
    summary:
      "ATF 8 Speed روغن تمام‌سنتتیک کم‌گرانروی برای نسل‌های ZF 6HP، 8HP و 9HP است و برای جعبه‌دنده‌های دارای کد منطبق استفاده می‌شود.",
    source: "https://fosser.de/en/product/fosser-atf-8-speed/",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "157", "نقطه ریزش": "‎-45°C", رنگ: "سبز" },
  }),
];

const aisinGearOils = [
  ...gearFamily(brands.aisin, {
    model: "AFW+",
    slug: "afw-plus",
    sku: "AIS-AFWP",
    fluidType: "روغن گیربکس اتوماتیک چندخودرویی",
    approvals:
      "JWS 3309؛ Toyota T-III/T-IV/WS؛ Mitsubishi SP-II/SP-III؛ Dexron III؛ Mercon V؛ Allison C-4",
    image: "/products/aisin/afw-plus.png",
    summary:
      "AFW+ آیسین سیال اتوماتیک چندخودرویی برای طیف گسترده گیربکس‌های آیسین و استانداردهای آسیایی و آمریکایی است.",
    source: "https://www.aisin.com.sg/product/automatic-transmission-fluids/",
    packs: [4],
    mappings: mgAisin3309Maps,
  }),
  ...gearFamily(brands.aisin, {
    model: "AFW-VI",
    slug: "afw-vi",
    sku: "AIS-AFWVI",
    fluidType: "روغن گیربکس اتوماتیک کم‌گرانروی",
    approvals: "GM Dexron VI؛ مناسب بسیاری از گیربکس‌های شش‌سرعته و جدیدتر با استاندارد منطبق",
    image: "/products/aisin/afw-vi.png",
    summary:
      "AFW-VI آیسین سیال تمام‌سنتتیک کم‌گرانروی برای گیربکس‌های اتوماتیک مدرن است و پایداری برشی و عملکرد سرد مناسبی دارد.",
    source: "https://www.aisin.com.sg/product/automatic-tramission-fluid-afw-six/",
    packs: [4],
    specs: { "شاخص گرانروی": "151", "نقطه ریزش": "‎-48°C", "نقطه اشتعال": "220°C" },
  }),
  ...gearFamily(brands.aisin, {
    model: "CFEx+",
    slug: "cfex-plus",
    sku: "AIS-CFEXP",
    fluidType: "روغن گیربکس CVT",
    approvals: "CVT تسمه‌ای و زنجیری چندخودرویی؛ تطبیق کد OEM الزامی است",
    image: "/products/aisin/cfex-plus.jpg",
    summary:
      "CFEx+ آیسین برای گیربکس‌های CVT تسمه‌ای و زنجیری طراحی شده و اصطکاک پایدار و کاهش لرزش را هدف می‌گیرد.",
    source: "https://www.aisin.com.sg/product/automatic-transmission-fluids/",
    packs: [4],
  }),
];

const aidlubeGearOils = [
  ...gearFamily(brands.aidlube, {
    model: "GFO 75W-80 GL-4",
    slug: "gfo-75w80-gl4",
    sku: "AID-GFO-7580",
    fluidType: "روغن دنده دستی",
    viscosity: "75W-80",
    approvals: "API GL-4",
    image: "/products/aidlube/gfo-75w80-gl4-1l.svg",
    summary:
      "GFO 75W-80 ایدلوب روغن دنده دستی با افزودنی فشارپذیر کنترل‌شده برای روانکاری چرخ‌دنده و سینکرونایزر است.",
    source: "https://aidlube.de/wp-content/uploads/2025/04/aidlube-catalog-2025.pdf",
    packs: [1],
    mappings: mg3ManualMaps,
  }),
  ...gearFamily(brands.aidlube, {
    model: "ATF AL4",
    slug: "atf-al4",
    sku: "AID-ATF-AL4",
    fluidType: "روغن گیربکس اتوماتیک",
    approvals: "PSA AL4؛ Renault DP0؛ تطبیق کد سیال سازنده الزامی است",
    image: "/products/aidlube/atf-al4-1l.jpg",
    summary:
      "ATF AL4 ایدلوب برای گیربکس‌های چهارسرعته AL4/DP0 طراحی شده و عملکرد اصطکاکی و ضدلرزش لازم این خانواده را فراهم می‌کند.",
    source: "https://www.ravanmotor.com/p/1012/",
    packs: [1],
  }),
];

const xadoGearOils = [
  ...gearFamily(brands.xado, {
    model: "Atomic Oil 75W-80 GL-4 Red Boost",
    slug: "atomic-oil-75w80-gl4",
    sku: "XAD-AT-7580",
    fluidType: "روغن دنده دستی",
    viscosity: "75W-80",
    approvals: "API GL-4؛ MB 235.4؛ MAN 341 E3/Z4؛ ZF TE-ML 02D/08",
    image: "/products/xado/atomic-75w80-1l.png",
    summary:
      "Atomic Oil 75W-80 روغن تمام‌سنتتیک دنده دستی با فناوری Red Boost برای تعویض نرم و محافظت سطوح تحت فشار است.",
    source:
      "https://xado.com/masla/transmisiyni-olivi/transmisiyna-oliva-xado-atomic-oil-75w-80-gl-4-red-boost",
    packs: [1],
    specs: { "شاخص گرانروی": "156", "نقطه ریزش": "‎-39°C", "گرانروی در ۱۰۰°C": "9.2 cSt" },
    mappings: mg3ManualMaps,
  }),
  ...gearFamily(brands.xado, {
    model: "Atomic Oil 75W-90",
    slug: "atomic-oil-75w90",
    sku: "XAD-AT-7590",
    fluidType: "روغن دنده دستی و دیفرانسیل",
    viscosity: "75W-90",
    approvals: "API GL-4/GL-5؛ سطح دقیق روی بسته با دفترچه تطبیق داده شود",
    image: "/products/xado/atomic-75w90-1l.jpg",
    summary:
      "Atomic Oil 75W-90 روغن دنده سنتتیک برای کار در بازه دمایی گسترده و محافظت چرخ‌دنده در فشار بالا است.",
    source: "https://www.ravanmotor.com/p/1604/",
    packs: [1],
    mappings: mg3ManualMaps,
  }),
  ...gearFamily(brands.xado, {
    model: "Atomic Oil 80W-90",
    slug: "atomic-oil-80w90",
    sku: "XAD-AT-8090",
    fluidType: "روغن دنده و دیفرانسیل",
    viscosity: "80W-90",
    approvals: "API GL-4/GL-5؛ سطح دقیق روی بسته با دفترچه تطبیق داده شود",
    image: "/products/xado/atomic-80w90-1l.jpg",
    summary:
      "Atomic Oil 80W-90 برای دیفرانسیل و گیربکس دستی دارای گرانروی مجاز 80W-90 طراحی شده و پایداری فشار بالا دارد.",
    source: "https://www.ravanmotor.com/p/1340/",
    packs: [1],
  }),
  ...gearFamily(brands.xado, {
    model: "Atomic Oil ATF CVT",
    slug: "atomic-atf-cvt",
    sku: "XAD-ATF-CVT",
    fluidType: "روغن گیربکس CVT",
    approvals: "CVT چندخودرویی؛ تطبیق کد دقیق OEM الزامی است",
    image: "/products/xado/atf-cvt-1l.jpg",
    summary:
      "Atomic ATF CVT برای گیربکس‌های پیوسته تسمه‌ای و زنجیری ساخته شده و پایداری اصطکاکی و محافظت سایشی فراهم می‌کند.",
    source: "https://www.ravanmotor.com/p/1343/",
    packs: [1],
  }),
  ...gearFamily(brands.xado, {
    model: "Atomic Oil ATF III/IV/V",
    slug: "atomic-atf-3-4-5",
    sku: "XAD-ATF-345",
    fluidType: "روغن گیربکس اتوماتیک چندخودرویی",
    approvals: "Dexron III؛ Toyota T-IV؛ سطوح ATF III/IV/V درج‌شده روی بسته",
    image: "/products/xado/atf-iii-iv-v-1l.jpg",
    summary:
      "Atomic ATF III/IV/V سیال چندخودرویی برای گیربکس‌های اتوماتیک قدیمی و میانی است و فقط با کد منطبق استفاده می‌شود.",
    source: "https://www.ravanmotor.com/p/1341/",
    packs: [1],
  }),
  ...gearFamily(brands.xado, {
    model: "Atomic Oil ATF VI+",
    slug: "atomic-atf-vi-plus",
    sku: "XAD-ATF-VIP",
    fluidType: "روغن گیربکس اتوماتیک کم‌گرانروی",
    approvals: "GM Dexron VI؛ کدهای سازنده درج‌شده روی بسته",
    image: "/products/xado/atf-vi-plus-1l.jpg",
    summary:
      "Atomic ATF VI+ سیال سنتتیک کم‌گرانروی برای گیربکس‌های اتوماتیک جدید با الزام Dexron VI یا کد سازگار است.",
    source: "https://www.ravanmotor.com/p/1722/",
    packs: [1],
  }),
];

const zicGearOils = [
  ...gearFamily(brands.zic, {
    model: "ATF SP-IV",
    slug: "atf-sp4",
    sku: "ZIC-ATF-SP4",
    fluidType: "روغن گیربکس اتوماتیک هیوندای/کیا",
    approvals: "Hyundai/Kia SP-IV؛ استفاده در گیربکس‌های دارای همین کد",
    image: "/products/zic/atf-sp4-4l.png",
    packImages: { 1: "/products/zic/atf-sp4-1l.png" },
    summary:
      "ZIC ATF SP-IV سیال تمام‌سنتتیک برای گیربکس‌های اتوماتیک هیوندای و کیا با الزام SP-IV است و اصطکاک پایدار ایجاد می‌کند.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/detail.do?menu_idx=170&prductCode=PROCD0000125&sCtgryCode=CA0000000014",
    packs: [4, 1],
  }),
  ...gearFamily(brands.zic, {
    model: "ATF 3",
    slug: "atf-3",
    sku: "ZIC-ATF-3",
    fluidType: "روغن گیربکس اتوماتیک",
    approvals: "GM Dexron IIIH؛ Allison C-4؛ Ford Mercon؛ Hyundai/Kia SP-II/SP-III",
    image: "/products/zic/atf-3-1l.png",
    summary:
      "ZIC ATF 3 برای گیربکس‌های اتوماتیک و هیدرولیک قدیمی‌تر با الزام Dexron III یا استانداردهای هم‌رده ساخته شده است.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/list.do?menu_idx=170&sCtgryCode=CA0000000014",
    packs: [1],
  }),
  ...gearFamily(brands.zic, {
    model: "CVTF Multi",
    slug: "cvtf-multi",
    sku: "ZIC-CVTF-M",
    fluidType: "روغن گیربکس CVT",
    approvals: "CVT تسمه‌ای و زنجیری چندخودرویی؛ تطبیق کد OEM الزامی است",
    image: "/products/zic/cvtf-multi-4l.png",
    packImages: { 1: "/products/zic/cvtf-multi.jpg" },
    summary:
      "ZIC CVTF Multi سیال تمام‌سنتتیک CVT با اصطکاک پایدار، کنترل لرزش و محافظت زنجیر یا تسمه است.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/list.do?menu_idx=170&sCtgryCode=CA0000000014",
    packs: [4, 1],
  }),
  ...gearFamily(brands.zic, {
    model: "DCTF Multi",
    slug: "dctf-multi",
    sku: "ZIC-DCTF-M",
    fluidType: "روغن گیربکس دوکلاچه تر",
    approvals: "VW/Audi TL 052 182 و TL 052 529؛ Ford WSS-M2C936-A؛ BMW DCTF-1؛ Mitsubishi SSTF-1",
    image: "/products/zic/dctf-multi.jpg",
    summary:
      "ZIC DCTF Multi روغن تمام‌سنتتیک برای گیربکس‌های دوکلاچه تر است و دوام اصطکاک کلاچ و تعویض نرم را حفظ می‌کند.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/detail.do?menu_idx=170&prductCode=PROCD0000200&sCtgryCode=CA0000000014",
    packs: [1],
    specs: { "شاخص گرانروی": "188", "نقطه ریزش": "‎-48°C", "گرانروی در ۱۰۰°C": "7.02 cSt" },
    mappings: mgWetDctMaps,
  }),
  ...gearFamily(brands.zic, {
    model: "ATF Multi HT",
    slug: "atf-multi-ht",
    sku: "ZIC-ATF-MHT",
    fluidType: "روغن گیربکس اتوماتیک چندخودرویی با گرانروی بالاتر",
    approvals:
      "JWS 3309/T-IV؛ Toyota T-II/III/IV؛ Dexron III؛ Mercon V؛ BMW LT71141؛ PSA AL4؛ Renault DP0",
    image: "/products/zic/atf-multi-ht-4l.png",
    packImages: { 1: "/products/zic/atf-multi-ht-1l.png" },
    summary:
      "ZIC ATF Multi HT برای گیربکس‌های اتوماتیک چهار تا هشت‌سرعته با نیاز به سیال گرانروی بالاتر و کدهایی مانند JWS 3309 است.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/detail.do?menu_idx=170&prductCode=PROCD0000219&sCtgryCode=CA0000000014",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "161", "نقطه ریزش": "‎-48°C", "گرانروی در ۱۰۰°C": "7.01 cSt" },
    mappings: mgAisin3309Maps,
  }),
  ...gearFamily(brands.zic, {
    model: "ATF Multi LF",
    slug: "atf-multi-lf",
    sku: "ZIC-ATF-MLF",
    fluidType: "روغن گیربکس اتوماتیک کم‌گرانروی",
    approvals: "JWS 3324/WS؛ AW-1/AW-2؛ Dexron VI؛ SP-IV؛ MB هفت و نه سرعته؛ ZF 6/8/9 Speed",
    image: "/products/zic/atf-multi-lf-4l.png",
    packImages: { 1: "/products/zic/atf-multi-lf-1l.png" },
    summary:
      "ZIC ATF Multi LF سیال کم‌گرانروی تمام‌سنتتیک برای گیربکس‌های شش‌سرعته و بالاتر است و برای جعبه‌دنده‌های پنج‌سرعته و قدیمی‌تر توصیه نمی‌شود.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/detail.do?menu_idx=170&prductCode=PROCD0000129&sCtgryCode=CA0000000014",
    packs: [4, 1],
    specs: { "شاخص گرانروی": "155", "نقطه ریزش": "‎-51°C", "گرانروی در ۱۰۰°C": "5.72 cSt" },
  }),
  ...gearFamily(brands.zic, {
    model: "PSF-3",
    slug: "psf-3",
    sku: "ZIC-PSF3",
    fluidType: "روغن هیدرولیک فرمان",
    approvals: "Hyundai/Kia PSF-3؛ فقط سامانه فرمان دارای این کد",
    image: "/products/zic/psf-3.png",
    summary:
      "ZIC PSF-3 سیال هیدرولیک فرمان برای خودروهایی است که سازنده استاندارد PSF-3 را تعیین کرده و جایگزین عمومی ATF نیست.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/list.do?menu_idx=170&sCtgryCode=CA0000000014",
    packs: [1],
  }),
  ...gearFamily(brands.zic, {
    model: "G-5 80W-90",
    slug: "g5-80w90",
    sku: "ZIC-G5-8090",
    fluidType: "روغن دنده و دیفرانسیل",
    viscosity: "80W-90",
    approvals: "API GL-5",
    image: "/products/zic/g5-80w90-1l.png",
    summary:
      "ZIC G-5 80W-90 روغن دنده فشاربالا برای اکسل و دیفرانسیل‌هایی است که سطح API GL-5 را لازم دارند.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/list.do?menu_idx=170&sCtgryCode=CA0000000014",
    packs: [1],
  }),
  ...gearFamily(brands.zic, {
    model: "G-FF 75W-85",
    slug: "gff-75w85",
    sku: "ZIC-GFF-7585",
    fluidType: "روغن دنده دستی محور جلو",
    viscosity: "75W-85",
    approvals: "API GL-4؛ MIL-L-2105A",
    image: "/products/zic/gff-75w85-1l.jpg",
    summary:
      "ZIC G-FF 75W-85 گرید رسمی این خانواده برای خودروهای موتور جلو و محور جلو است؛ عدد 75W-80 فهرست اولیه با برچسب سازنده اصلاح شد.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/list.do?menu_idx=170&sCtgryCode=CA0000000014",
    packs: [1],
  }),
  ...gearFamily(brands.zic, {
    model: "GFT 75W-90",
    slug: "gft-75w90",
    sku: "ZIC-GFT-7590",
    fluidType: "روغن دنده دستی",
    viscosity: "75W-90",
    approvals: "API GL-4؛ سطح دقیق روی بسته با دفترچه تطبیق داده شود",
    image: "/products/zic/gft-75w90-1l.png",
    summary:
      "ZIC GFT 75W-90 روغن سنتتیک دنده دستی با پایداری دمایی و محافظت سایشی برای جعبه‌دنده‌های دارای سطح GL-4 است.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/list.do?menu_idx=170&sCtgryCode=CA0000000014",
    packs: [1],
    mappings: mg3ManualMaps,
  }),
];

const caspianGearOils = [
  ...gearFamily(brands.caspian, {
    model: "GL-4 75W-80",
    slug: "gear-gl4-75w80",
    sku: "CAS-G4-7580",
    fluidType: "روغن دنده دستی",
    viscosity: "75W-80",
    approvals: "API GL-4؛ استاندارد ملی ایران؛ بسته رسمی ۹۵۰ میلی‌لیتر",
    image: "/products/caspian/gear-75w80.jpg",
    summary:
      "روغن دنده GL-4 کاسپین برای گیربکس دستی ساخته شده و دارای افزودنی ضدسایش، ضدخوردگی، ضدکف و فشارپذیر است.",
    source: "https://caspian.com/product/روغن-دنده-gl4-75w-80/",
    packs: [1],
    specs: { "حجم واقعی بسته رسمی": "۹۵۰ میلی‌لیتر؛ در کاتالوگ فروش به‌صورت ۱ لیتر نمایش داده می‌شود" },
    mappings: mg3ManualMaps,
  }),
  ...gearFamily(brands.caspian, {
    model: "GL-4 85W-90",
    slug: "gear-gl4-85w90",
    sku: "CAS-G4-8590",
    fluidType: "روغن دنده دستی",
    viscosity: "85W-90",
    approvals: "API GL-4؛ استاندارد ملی ایران؛ بسته رسمی ۹۵۰ میلی‌لیتر",
    image: "/products/caspian/gear-85w90.jpg",
    summary:
      "روغن دنده 85W-90 کاسپین برای گیربکس‌های دستی دارای الزام GL-4 در آب‌وهوای گرم‌تر و بار معمول طراحی شده است.",
    source: "https://caspian.com/product/روغن-دنده-gl4-85w-90/",
    packs: [1],
    specs: { "حجم واقعی بسته رسمی": "۹۵۰ میلی‌لیتر؛ در کاتالوگ فروش به‌صورت ۱ لیتر نمایش داده می‌شود" },
  }),
  ...gearFamily(brands.caspian, {
    model: "GL-4 85W-140",
    slug: "gear-gl4-85w140",
    sku: "CAS-G4-85140",
    fluidType: "روغن دنده دستی",
    viscosity: "85W-140",
    approvals: "API GL-4؛ استاندارد ملی ایران؛ بسته رسمی ۹۵۰ میلی‌لیتر",
    image: "/products/caspian/gear-85w140.jpg",
    summary:
      "روغن دنده 85W-140 کاسپین گرید سنگین برای گیربکس‌های دستی دارای الزام صریح این گرانروی و سطح GL-4 است.",
    source: "https://caspian.com/product/روغن-دنده-gl4-85w-140/",
    packs: [1],
    specs: { "حجم واقعی بسته رسمی": "۹۵۰ میلی‌لیتر؛ در کاتالوگ فروش به‌صورت ۱ لیتر نمایش داده می‌شود" },
  }),
];

export const extendedGearOils: CatalogProductSeed[] = [
  ...barelizGearOils,
  ...fosserGearOils,
  ...aisinGearOils,
  ...aidlubeGearOils,
  ...xadoGearOils,
  ...zicGearOils,
  ...caspianGearOils,
];
