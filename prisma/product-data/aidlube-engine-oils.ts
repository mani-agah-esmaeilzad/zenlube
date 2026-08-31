export const AIDLUBE_CATALOG_URL =
  "https://aidlube.de/wp-content/uploads/2025/04/aidlube-catalog-2025.pdf";

export const MG_ENGINE_OIL_BULLETIN_URL =
  "https://mg-wiki.com/media/oils/SI-ALL-EN-20170811-The.pdf";

export type AidlubeCarMappingSeed = {
  carSlug: string;
  note: string;
  sourceTitle: string;
  sourceUrl: string;
};

export type AidlubeEngineOilSeed = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  viscosity: string;
  oilType: "تمام‌سنتتیک" | "نیمه‌سنتتیک";
  imageUrl: string;
  approvals: string;
  packagingSizeLit: number;
  originCountry: string | null;
  technicalSpecs: Record<string, string>;
  tags: string[];
  sourcePage: number;
  productSourceUrl?: string;
  carMappings: AidlubeCarMappingSeed[];
};

const officialCatalogSource = {
  sourceTitle: "کاتالوگ رسمی AIDLUBE 2025",
  sourceUrl: AIDLUBE_CATALOG_URL,
};

const mgEngineOilBulletinSource = {
  sourceTitle: "بولتن فنی روغن موتور همه مدل‌های MG - SAIC SI-ALL-EN-20170811",
  sourceUrl: MG_ENGINE_OIL_BULLETIN_URL,
};

export const aidlubeEngineOils: AidlubeEngineOilSeed[] = [
  {
    name: "روغن موتور ایدلوب MASTER TECH 10W-40 SN A3/B4 حجم ۴ لیتر",
    slug: "aidlube-master-tech-10w40-sn-a3-b4-4l",
    sku: "AID-MT-1040-SN-4L",
    description:
      "روغن موتور نیمه‌سنتتیک و کم‌مصرف AIDLUBE MASTER TECH برای خودروهای سواری و ون‌های بنزینی است. ترکیب روغن پایه باکیفیت و بسته افزودنی مدرن به پاکیزگی موتور و محافظت در برابر خوردگی و سایش کمک می‌کند. این محصول با گرانروی SAE 10W-40، سطح کیفی API SN و ACEA A3/B4 در کاتالوگ رسمی معرفی شده است. سازگاری نهایی باید با گرانروی، سطح کیفی و نوع روغن درج‌شده در دفترچه همان خودرو کنترل شود.",
    viscosity: "10W-40",
    oilType: "نیمه‌سنتتیک",
    imageUrl: "/products/aidlube/master-tech-10w40-sn-4l.jpg",
    approvals:
      "API SN؛ ACEA A3/B4؛ مطابق الزامات MB 226.5 / 229.3، Renault RN 0700 / 0710، VW 502 00 / 505 00 و PSA B71 2300",
    packagingSizeLit: 4,
    originCountry: "ایران (با فناوری آلمان)",
    technicalSpecs: {
      "نام لاتین محصول": "AIDLUBE MASTER TECH 10W-40 SN A3/B4",
      "نوع پایه": "نیمه‌سنتتیک",
      "کاربری اعلام‌شده": "خودروهای سواری و ون‌های بنزینی",
      "سطح کیفی API": "SN",
      "سطح کیفی ACEA": "A3/B4",
      "سطوح عملکرد اعلام‌شده (Fulfils)":
        "MB 226.5 / 229.3؛ Renault RN 0700 / 0710؛ VW 502 00 / 505 00؛ PSA B71 2300",
      "ویژگی‌های اعلام‌شده": "صرفه‌جویی سوخت، پاکیزگی موتور، محافظت در برابر سایش و خوردگی",
      "نوع بسته‌بندی": "گالن پلاستیکی ۴ لیتری",
      "منبع مشخصات": "کاتالوگ رسمی AIDLUBE 2025، صفحه ۱۰",
      "تاریخ بازبینی منبع": "۳۱ اوت ۲۰۲۶",
    },
    tags: ["ایدلوب", "AIDLUBE", "MASTER TECH", "10W-40", "API SN", "ACEA A3/B4", "نیمه‌سنتتیک"],
    sourcePage: 10,
    productSourceUrl:
      "https://www.ravanmotor.com/p/1122/روغن-موتور-AIDLUBE-10W40-ایدلوب-حجم-4-لیتر-ارسال-به-شهرستان-فقط-با-هماهنگی-قبلی",
    carMappings: [],
  },
  {
    name: "روغن موتور ایدلوب HIGH MAX 10W-40 SL حجم ۴ لیتر",
    slug: "aidlube-high-max-10w40-sl-4l",
    sku: "AID-HM-1040-SL-4L",
    description:
      "روغن موتور نیمه‌سنتتیک AIDLUBE HIGH MAX برای موتورهای بنزینی است. فرمول این محصول برای حفظ پاکیزگی موتور، محافظت در برابر سایش و خوردگی و مقاومت مناسب در برابر اکسیداسیون حرارتی طراحی شده است. کاتالوگ رسمی برای این مدل گرانروی SAE 10W-40 و سطح کیفی API SL را ثبت می‌کند و سطح ACEA یا استاندارد سازنده دیگری برای آن اعلام نشده است؛ بنابراین فقط برای خودرویی پیشنهاد می‌شود که دفترچه آن API SL را مجاز بداند.",
    viscosity: "10W-40",
    oilType: "نیمه‌سنتتیک",
    imageUrl: "/products/aidlube/high-max-10w40-sl-4l.png",
    approvals: "API SL؛ استاندارد ACEA یا سطح عملکرد سازنده دیگری در کاتالوگ رسمی اعلام نشده است",
    packagingSizeLit: 4,
    originCountry: null,
    technicalSpecs: {
      "نام لاتین محصول": "AIDLUBE HIGH MAX 10W-40 SL",
      "نوع پایه": "نیمه‌سنتتیک",
      "کاربری اعلام‌شده": "موتورهای بنزینی",
      "سطح کیفی API": "SL",
      "سطح کیفی ACEA": "در کاتالوگ رسمی اعلام نشده",
      "سطوح عملکرد سازندگان": "در کاتالوگ رسمی اعلام نشده",
      "ویژگی‌های اعلام‌شده":
        "پاکیزگی موتور، محافظت در برابر سایش و خوردگی و مقاومت در برابر اکسیداسیون حرارتی",
      "نوع بسته‌بندی": "گالن پلاستیکی ۴ لیتری",
      "منبع مشخصات": "کاتالوگ رسمی AIDLUBE 2025، صفحه ۱۱",
      "تاریخ بازبینی منبع": "۳۱ اوت ۲۰۲۶",
    },
    tags: ["ایدلوب", "AIDLUBE", "HIGH MAX", "10W-40", "API SL", "نیمه‌سنتتیک"],
    sourcePage: 11,
    carMappings: [],
  },
  {
    name: "روغن موتور ایدلوب MASTER TECH 5W-30 SN C3 حجم ۴ لیتر",
    slug: "aidlube-master-tech-5w30-sn-c3-4l",
    sku: "AID-MT-0530-SN-C3-4L",
    description:
      "روغن موتور تمام‌سنتتیک و کم‌مصرف AIDLUBE MASTER TECH برای خودروهای سواری مدرن است. این فرمول برای پاکیزگی موتور، محافظت در برابر سایش و خوردگی و پایداری اکسیداسیون طراحی شده و با گرانروی SAE 5W-30، سطح کیفی API SN و ACEA C3 عرضه می‌شود. این رکورد مخصوص بسته ۴ لیتری بازار ایران است؛ مشخصات فنی آن با نسخه ۵ لیتری همین محصول یکسان است.",
    viscosity: "5W-30",
    oilType: "تمام‌سنتتیک",
    imageUrl: "/products/aidlube/master-tech-5w30-sn-c3-4l-source.jpg",
    approvals:
      "API SN؛ ACEA C3؛ مطابق الزامات GM dexos2 و MB 229.31 / 229.51 / 229.52",
    packagingSizeLit: 4,
    originCountry: "ایران (با فناوری آلمان)",
    technicalSpecs: {
      "نام لاتین محصول": "AIDLUBE MASTER TECH 5W-30 SN C3",
      "نوع پایه": "تمام‌سنتتیک",
      "کاربری اعلام‌شده": "خودروهای سواری مدرن",
      "سطح کیفی API": "SN",
      "سطح کیفی ACEA": "C3",
      "سطوح عملکرد اعلام‌شده (Fulfils)": "GM dexos2؛ MB 229.31 / 229.51 / 229.52",
      "ویژگی‌های اعلام‌شده":
        "صرفه‌جویی سوخت، پاکیزگی موتور، محافظت در برابر سایش و خوردگی و پایداری اکسیداسیون",
      "نوع بسته‌بندی": "گالن پلاستیکی ۴ لیتری",
      "کد مرجع بازار ایران": "6110012",
      "منبع مشخصات": "کاتالوگ رسمی AIDLUBE 2025، صفحه ۱۰؛ بسته ۴ لیتری تأییدشده در بازار ایران",
      "تاریخ بازبینی منبع": "۳۱ اوت ۲۰۲۶",
    },
    tags: ["ایدلوب", "AIDLUBE", "MASTER TECH", "5W-30", "API SN", "ACEA C3", "تمام‌سنتتیک"],
    sourcePage: 10,
    productSourceUrl:
      "https://www.ravanmotor.com/p/1542/روغن-موتور-AIDLUBE-5W30-ایدلوب-حجم-4-لیتر",
    carMappings: [
      {
        carSlug: "hyundai-62-mg-gs",
        note:
          "موتور MGE 2.0T در بولتن فنی SAIC با روغن C3 5W-30 یا C3 0W-30 ثبت شده است. حجم سرویس حدود ۶ لیتر است؛ ظرف ۴ لیتری به‌تنهایی برای سرویس کامل کافی نیست.",
        ...mgEngineOilBulletinSource,
      },
      {
        carSlug: "hyundai-68-mg-rx5",
        note:
          "موتور MGE 2.0T در بولتن فنی SAIC با روغن C3 5W-30 یا C3 0W-30 ثبت شده است. حجم سرویس حدود ۶ لیتر است؛ ظرف ۴ لیتری به‌تنهایی برای سرویس کامل کافی نیست.",
        ...mgEngineOilBulletinSource,
      },
    ],
  },
  {
    name: "روغن موتور ایدلوب MASTER SELECT 5W-40 SN A3/B4 حجم ۴ لیتر",
    slug: "aidlube-master-select-5w40-sn-a3-b4-4l",
    sku: "AID-MS-0540-SN-4L",
    description:
      "روغن موتور تمام‌سنتتیک و کم‌مصرف AIDLUBE MASTER SELECT برای خودروهای سواری و ون‌های بنزینی است. این محصول پاکیزگی موتور، محافظت در برابر سایش و خوردگی و عملکرد مناسب در استارت سرد را هدف می‌گیرد. بطری موجود در بازار ایران به‌صورت روشن MASTER SELECT با سطح API SN و ACEA A3/B4 را نشان می‌دهد؛ بنابراین این رکورد با نسخه جداگانه MASTER TECH C3 یکی نیست.",
    viscosity: "5W-40",
    oilType: "تمام‌سنتتیک",
    imageUrl: "/products/aidlube/master-select-5w40-sn-4l.jpg",
    approvals:
      "API SN؛ ACEA A3/B4؛ مطابق الزامات MB 226.5 / 229.3 / 229.5، BMW LL-01، VW 502 00 / 505 00، Renault RN 0700 / 0710، PSA B71 2296 و Porsche A40",
    packagingSizeLit: 4,
    originCountry: "ایران (با فناوری آلمان)",
    technicalSpecs: {
      "نام لاتین محصول": "AIDLUBE MASTER SELECT 5W-40 SN A3/B4",
      "نوع پایه": "تمام‌سنتتیک",
      "کاربری اعلام‌شده": "خودروهای سواری و ون‌های بنزینی",
      "سطح کیفی API": "SN",
      "سطح کیفی ACEA": "A3/B4",
      "سطوح عملکرد اعلام‌شده (Fulfils)":
        "MB 226.5 / 229.3 / 229.5؛ BMW LL-01؛ VW 502 00 / 505 00؛ Renault RN 0700 / 0710؛ PSA B71 2296؛ Porsche A40",
      "ویژگی‌های اعلام‌شده":
        "صرفه‌جویی سوخت، پاکیزگی موتور، محافظت در برابر سایش و خوردگی و عملکرد مناسب در استارت سرد",
      "نوع بسته‌بندی": "گالن پلاستیکی ۴ لیتری",
      "کد مرجع بازار ایران": "6110009",
      "تمایز محصول": "MASTER SELECT A3/B4؛ نه MASTER TECH C3",
      "منبع مشخصات": "کاتالوگ رسمی AIDLUBE 2025، صفحه ۱۰",
      "تاریخ بازبینی منبع": "۳۱ اوت ۲۰۲۶",
    },
    tags: ["ایدلوب", "AIDLUBE", "MASTER SELECT", "5W-40", "API SN", "ACEA A3/B4", "تمام‌سنتتیک"],
    sourcePage: 10,
    productSourceUrl:
      "https://www.ravanmotor.com/p/1123/روغن-موتور-AIDLUBE-5W40-ایدلوب-حجم-4-لیتر-ارسال-به-شهرستان-فقط-با-هماهنگی-قبلی",
    carMappings: [
      {
        carSlug: "hyundai-27-mg-550-1-8l-turbo",
        note:
          "بولتن فنی SAIC برای خانواده موتور 18K4 نمونه روغن 5W-40 با API SN/CF و ACEA A3/B4 را ثبت می‌کند. حجم سرویس MG 550 حدود ۴.۹ لیتر است؛ ظرف ۴ لیتری به‌تنهایی کافی نیست.",
        ...mgEngineOilBulletinSource,
      },
      {
        carSlug: "hyundai-66-mg6-1-8t",
        note:
          "بولتن فنی SAIC برای خانواده موتور 18K4 نمونه روغن 5W-40 با API SN/CF و ACEA A3/B4 را ثبت می‌کند. حجم سرویس این نسل حدود ۵.۱ لیتر است؛ ظرف ۴ لیتری به‌تنهایی کافی نیست.",
        ...mgEngineOilBulletinSource,
      },
      {
        carSlug: "hyundai-67-mg6-new",
        note:
          "بولتن فنی SAIC برای خانواده موتور 18K4 نمونه روغن 5W-40 با API SN/CF و ACEA A3/B4 را ثبت می‌کند. حجم سرویس این نسل حدود ۴.۹ لیتر است؛ ظرف ۴ لیتری به‌تنهایی کافی نیست.",
        ...mgEngineOilBulletinSource,
      },
    ],
  },
  {
    name: "روغن موتور ایدلوب ECO ADVANCE 0W-20 SN GF-5 حجم ۴ لیتر",
    slug: "aidlube-eco-advance-0w20-sn-gf5-4l",
    sku: "AID-EA-0020-SN-GF5-4L",
    description:
      "روغن موتور تمام‌سنتتیک، پرفورمنس بالا و کم‌مصرف AIDLUBE ECO ADVANCE برای خودروهای سواری و وسایل نقلیه مدرن است. فرمول آن برای روانکاری سریع در استارت سرد، پاکیزگی موتور و محافظت در برابر سایش و خوردگی طراحی شده است. سطح کیفی این محصول API SN و ILSAC GF-5 است؛ چون ACEA C5 و API SP برای آن اعلام نشده، به مدل‌های جدید MG که این دو سطح را الزام می‌کنند متصل نشده است.",
    viscosity: "0W-20",
    oilType: "تمام‌سنتتیک",
    imageUrl: "/products/aidlube/eco-advance-0w20-sn-4l.png",
    approvals:
      "API SN؛ ILSAC GF-5؛ مطابق الزامات GM dexos1، Ford WSS-M2C-945A / 946A / 947A، Chrysler MS 6395 و GM 6094M",
    packagingSizeLit: 4,
    originCountry: null,
    technicalSpecs: {
      "نام لاتین محصول": "AIDLUBE ECO ADVANCE 0W-20 SN GF-5",
      "نوع پایه": "تمام‌سنتتیک",
      "کاربری اعلام‌شده": "خودروهای سواری و وسایل نقلیه مدرن",
      "سطح کیفی API": "SN",
      "سطح کیفی ILSAC": "GF-5",
      "سطح کیفی ACEA": "در کاتالوگ رسمی اعلام نشده؛ ACEA C5 نیست",
      "سطوح عملکرد اعلام‌شده (Fulfils)":
        "GM dexos1؛ Ford WSS-M2C-945A / 946A / 947A؛ Chrysler MS 6395؛ GM 6094M",
      "ویژگی‌های اعلام‌شده":
        "صرفه‌جویی سوخت، استارت سرد مناسب، پاکیزگی موتور و محافظت در برابر سایش و خوردگی",
      "نوع بسته‌بندی": "گالن پلاستیکی ۴ لیتری",
      "منبع مشخصات": "کاتالوگ رسمی AIDLUBE 2025، صفحه ۱۰",
      "تاریخ بازبینی منبع": "۳۱ اوت ۲۰۲۶",
    },
    tags: ["ایدلوب", "AIDLUBE", "ECO ADVANCE", "0W-20", "API SN", "ILSAC GF-5", "تمام‌سنتتیک"],
    sourcePage: 10,
    carMappings: [],
  },
  {
    name: "روغن موتور ایدلوب MASTER TECH 5W-30 SN C3 حجم ۵ لیتر",
    slug: "aidlube-master-tech-5w30-sn-c3-5l",
    sku: "AID-MT-0530-SN-C3-5L",
    description:
      "روغن موتور تمام‌سنتتیک و کم‌مصرف AIDLUBE MASTER TECH برای خودروهای سواری مدرن است. این فرمول برای پاکیزگی موتور، محافظت در برابر سایش و خوردگی و پایداری اکسیداسیون طراحی شده و با گرانروی SAE 5W-30، سطح کیفی API SN و ACEA C3 عرضه می‌شود. بسته ۵ لیتری برای خودروهایی که حجم سرویس آن‌ها نزدیک پنج لیتر است انتخاب کامل‌تری محسوب می‌شود؛ مقدار دقیق مصرف باید از دفترچه همان خودرو کنترل شود.",
    viscosity: "5W-30",
    oilType: "تمام‌سنتتیک",
    imageUrl: "/products/aidlube/master-tech-5w30-sn-c3-5l.jpg",
    approvals:
      "API SN؛ ACEA C3؛ مطابق الزامات GM dexos2 و MB 229.31 / 229.51 / 229.52",
    packagingSizeLit: 5,
    originCountry: "ایران (با فناوری آلمان)",
    technicalSpecs: {
      "نام لاتین محصول": "AIDLUBE MASTER TECH 5W-30 SN C3",
      "نوع پایه": "تمام‌سنتتیک",
      "کاربری اعلام‌شده": "خودروهای سواری مدرن",
      "سطح کیفی API": "SN",
      "سطح کیفی ACEA": "C3",
      "سطوح عملکرد اعلام‌شده (Fulfils)": "GM dexos2؛ MB 229.31 / 229.51 / 229.52",
      "ویژگی‌های اعلام‌شده":
        "صرفه‌جویی سوخت، پاکیزگی موتور، محافظت در برابر سایش و خوردگی و پایداری اکسیداسیون",
      "نوع بسته‌بندی": "گالن پلاستیکی ۵ لیتری",
      "کد مرجع بازار ایران": "6110010",
      "منبع مشخصات": "کاتالوگ رسمی AIDLUBE 2025، صفحه ۱۰",
      "تاریخ بازبینی منبع": "۳۱ اوت ۲۰۲۶",
    },
    tags: ["ایدلوب", "AIDLUBE", "MASTER TECH", "5W-30", "API SN", "ACEA C3", "تمام‌سنتتیک"],
    sourcePage: 10,
    productSourceUrl:
      "https://www.ravanmotor.com/p/1120/روغن-موتور-AIDLUBE-5W30-ایدلوب-حجم-5-لیتر-ارسال-به-شهرستان-فقط-با-هماهنگی-قبلی",
    carMappings: [
      {
        carSlug: "hyundai-62-mg-gs",
        note:
          "موتور MGE 2.0T در بولتن فنی SAIC با روغن C3 5W-30 یا C3 0W-30 ثبت شده است. حجم سرویس حدود ۶ لیتر است؛ همراه ظرف ۵ لیتری حدود ۱ لیتر روغن هم‌مشخصات دیگر لازم است.",
        ...mgEngineOilBulletinSource,
      },
      {
        carSlug: "hyundai-68-mg-rx5",
        note:
          "موتور MGE 2.0T در بولتن فنی SAIC با روغن C3 5W-30 یا C3 0W-30 ثبت شده است. حجم سرویس حدود ۶ لیتر است؛ همراه ظرف ۵ لیتری حدود ۱ لیتر روغن هم‌مشخصات دیگر لازم است.",
        ...mgEngineOilBulletinSource,
      },
    ],
  },
];

export const aidlubeProductSlugs = aidlubeEngineOils.map((product) => product.slug);

export const aidlubeManagedMgCarSlugs = [
  "hyundai-27-mg-550-1-8l-turbo",
  "hyundai-60-mg-3-1-5l",
  "hyundai-61-mg-350",
  "hyundai-62-mg-gs",
  "hyundai-63-mg-360-turbo-1-5t-at",
  "hyundai-64-mg-360-at",
  "hyundai-65-mg-360-mt",
  "hyundai-66-mg6-1-8t",
  "hyundai-67-mg6-new",
  "hyundai-68-mg-rx5",
  "hyundai-69-mg-gt-1-5l-turbo",
  "hyundai-1049-mg-hs-phev-1-5t-10at",
  "hyundai-1105-mg7",
  "hyundai-1106-mg4-ev",
  "hyundai-1109-mg-5-1-5l-cvt",
] as const;

export const aidlubeCatalogSource = officialCatalogSource;
