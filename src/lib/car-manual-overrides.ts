import {
  REQUESTED_CAR_NOTEBOOK_SECTION_BY_ID,
  type StoredCarNotebookSection,
} from "./car-notebook-sections";

type ManualAwareCar = {
  slug: string;
  manufacturer?: string | null;
  model?: string | null;
  engineType?: string | null;
  engineCode?: string | null;
  viscosity?: string | null;
  specification?: string | null;
  oilCapacityLit?: unknown;
  overviewDetails?: string | null;
  engineDetails?: string | null;
  gearboxDetails?: string | null;
  maintenanceInfo?: string | null;
  notebookSections?: unknown;
};

type ManualSectionOverride = {
  categoryId: number;
  title?: string;
  tag?: string;
  description: string;
  sourceTitle?: string;
  sourceUrl?: string;
};

type ManualOverride = {
  sourceTitle: string;
  sourceUrl: string;
  engineType?: string | null;
  engineCode?: string | null;
  viscosity?: string | null;
  specification?: string | null;
  oilCapacityLit?: number | null;
  overviewDetails?: string;
  engineDetails?: string;
  gearboxDetails?: string;
  maintenanceInfo?: string;
  sectionOverrides?: ManualSectionOverride[];
  replaceAllSectionSources?: boolean;
};

const OFFICIAL_MG_HUB: Pick<ManualOverride, "sourceTitle" | "sourceUrl"> = {
  sourceTitle: "مرکز دفترچه‌های رسمی ام‌جی",
  sourceUrl: "https://mg-israel.co.il/guide-books/",
};

const MG_MANUAL_OVERRIDES: Record<string, ManualOverride> = {
  "hyundai-60-mg-3-1-5l": {
    sourceTitle: "دفترچه راهنمای مالک MG 3",
    sourceUrl: "https://mgmotors-prod-s3.s3.us-east-2.amazonaws.com/CL/pdp/MG-3/PDf/--manual-mg3-2015.pdf.pdf",
    engineCode: "CSA7153 VTI-Tech 1.5",
    gearboxDetails: [
      "نوع گیربکس: AMT نیمه‌اتوماتیک",
      "سطح کیفیت روغن بخش دنده: 75W-80 / 75W-90 GL-4 یا GL-5",
      "روغن مدار عملگر گیربکس: Tutela CS Speed / FLYS0040A",
      "حجم روغن بخش دنده: 1.8 لیتر",
      "حجم روغن مدار عملگر: 1 لیتر",
      "- این گیربکس از نوع Automated Manual Transmission است و دفترچه آن را در رده گیربکس‌های نیمه‌اتوماتیک قرار می‌دهد.",
      "- بازه تعویض پیشنهادی: هر 50,000 کیلومتر یا 3 سال.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "روغن موتور پیشنهادی برای MG 3 با موتور 1.5 لیتری از خانواده VTI-Tech در این نسخه 5W-30 یا 5W-40 است.",
          "- روغن تمام‌سنتتیک با سطح کیفی API SN یا API SP استفاده شود.",
          "- حجم سرویس روغن موتور با فیلتر 4.5 لیتر است.",
          "- برای سرویس کامل بهتر است 5 لیتر روغن تهیه شود.",
        ].join("\n"),
      },
      {
        categoryId: 3,
        description: [
          "گیربکس MG 3 از نوع AMT نیمه‌اتوماتیک است و دو بخش روغن مجزا دارد.",
          "- روغن بخش دنده: 75W-80 / 75W-90 GL-4 یا GL-5 با حجم 1.8 لیتر.",
          "- روغن مدار عملگر: Tutela CS Speed / FLYS0040A با حجم حدود 1 لیتر.",
          "- بازه تعویض پیشنهادی: هر 50,000 کیلومتر یا 3 سال.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-61-mg-350": {
    ...OFFICIAL_MG_HUB,
    engineCode: "15S4U 1.5L DOHC VCT",
    viscosity: "5W-30 / 10W-40 / 0W-40",
    engineDetails: [
      "نوع موتور: 4 سیلندر بنزینی 1.5 لیتر",
      "کد یا خانواده موتور: 15S4U 1.5L DOHC VCT",
      "ویسکوزیته پیشنهادی روغن موتور: 5W-30 / 10W-40 / 0W-40",
      "استاندارد روغن موتور: API SN / ACEA A1/B1",
      "حجم سرویس روغن موتور: 4.5 لیتر",
      "- گرید پایه پیشنهادی برای اغلب شرایط 5W-30 است.",
      "- برای مناطق بسیار گرم می‌توان 10W-40 را فقط در شرایط دمایی خیلی بالا در نظر گرفت.",
      "- برای مناطق بسیار سرد 0W-40 قابل استفاده است.",
    ].join("\n"),
    gearboxDetails: [
      "نوع گیربکس: 4 دنده اتومات آیسین AW 81-40LE",
      "سطح کیفیت روغن گیربکس: JWS-3309 / Toyota ATF T-IV / Toyota WS",
      "حجم روغن گیربکس: 5.6 لیتر (تخلیه از پیچ حدود 3 لیتر)",
      "- این گیربکس از خانواده 4AT آیسین است.",
      "- برای سرویس کامل معمولاً 8 لیتر روغن تهیه می‌شود.",
      "- بازه تعویض پیشنهادی: هر 50,000 کیلومتر.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "برای MG 350 با موتور 1.5 لیتری 15S4U، گرید پایه 5W-30 پیشنهاد می‌شود.",
          "- استاندارد روغن موتور: API SN / ACEA A1/B1.",
          "- حجم سرویس روغن موتور با فیلتر: 4.5 لیتر.",
          "- در مناطق بسیار گرم 10W-40 و در مناطق بسیار سرد 0W-40 قابل بررسی است.",
        ].join("\n"),
      },
      {
        categoryId: 3,
        description: [
          "گیربکس این مدل 4 دنده اتومات آیسین AW 81-40LE است.",
          "- روغن گیربکس با سطح کیفی JWS-3309 / Toyota ATF T-IV / Toyota WS استفاده شود.",
          "- ظرفیت کل گیربکس 5.6 لیتر است و تخلیه ساده معمولاً حدود 3 لیتر خارج می‌کند.",
          "- بازه تعویض پیشنهادی: هر 50,000 کیلومتر.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-27-mg-550-1-8l-turbo": {
    ...OFFICIAL_MG_HUB,
    engineCode: "18K4G 1.8T",
    gearboxDetails: [
      "نوع گیربکس: 5 دنده اتومات تیپ‌ترونیک آیسین AW55-50SN",
      "سطح کیفیت روغن گیربکس: JWS-3309 / Toyota ATF T-IV / Toyota WS",
      "حجم روغن گیربکس: 7.8 لیتر",
      "- این گیربکس در خانواده AW55-50SN / AF33 شناخته می‌شود.",
      "- برای سرویس کامل بهتر است 8 لیتر روغن تهیه شود.",
      "- بازه تعویض پیشنهادی: هر 50,000 کیلومتر یا 4 سال.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 3,
        description: [
          "گیربکس MG 550 از نوع 5 دنده اتومات تیپ‌ترونیک آیسین AW55-50SN است.",
          "- روغن گیربکس با سطح کیفی JWS-3309 / Toyota ATF T-IV / Toyota WS استفاده شود.",
          "- ظرفیت کل گیربکس حدود 7.8 لیتر است.",
          "- بازه تعویض پیشنهادی: هر 50,000 کیلومتر یا 4 سال.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-66-mg6-1-8t": {
    ...OFFICIAL_MG_HUB,
    engineType: "4 سیلندر بنزینی توربو 1.8 لیتر",
    engineCode: "18K4G 1.8T",
    engineDetails: [
      "نوع موتور: 4 سیلندر بنزینی توربو 1.8 لیتر",
      "کد یا خانواده موتور: 18K4G 1.8T",
      "ویسکوزیته پیشنهادی روغن موتور: 5W-40 / 5W-30 / 0W-30",
      "استاندارد روغن موتور: API SN / API SM / API SP",
      "حجم سرویس روغن موتور: 5.1 لیتر",
      "- روغن تمام‌سنتتیک مخصوص موتور توربو استفاده شود.",
      "- بازه تعویض پیشنهادی: حدود 7,000 تا 10,000 کیلومتر.",
    ].join("\n"),
    gearboxDetails: [
      "نوع گیربکس: 5 دنده اتومات آیسین",
      "سطح کیفیت روغن گیربکس: JWS-3309 / ATF 3309 / Toyota ATF T-IV / Toyota WS",
      "حجم روغن گیربکس: 7.1 لیتر",
      "- این گیربکس با خانواده آیسین مورد استفاده در MG 550 هم‌خانواده است.",
      "- بازه تعویض پیشنهادی: هر 60,000 کیلومتر یا 4 سال.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "برای MG 6 قدیم با موتور 1.8T از روغن تمام‌سنتتیک مخصوص توربو استفاده شود.",
          "- گریدهای قابل استفاده: 5W-40 / 5W-30 / 0W-30.",
          "- سطح کیفی: API SN / API SM / API SP.",
          "- حجم سرویس روغن موتور: 5.1 لیتر.",
        ].join("\n"),
      },
      {
        categoryId: 3,
        description: [
          "گیربکس این مدل 5 دنده اتومات آیسین است.",
          "- روغن گیربکس با سطح کیفی JWS-3309 / ATF 3309 / Toyota ATF T-IV / Toyota WS استفاده شود.",
          "- ظرفیت کل گیربکس حدود 7.1 لیتر است.",
          "- بازه تعویض پیشنهادی: هر 60,000 کیلومتر یا 4 سال.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-67-mg6-new": {
    ...OFFICIAL_MG_HUB,
    engineType: "4 سیلندر بنزینی توربو 1.8 لیتر",
    engineCode: "18K4G 1.8T",
    gearboxDetails: [
      "نوع گیربکس: 6 دنده دوکلاچه 6DCT360",
      "سطح کیفیت روغن گیربکس: VW TL 052 182 / Pentosin FFL-2 / FFL-3 / FFL-4",
      "حجم روغن گیربکس: 7.7 لیتر (تعویض دستی حدود 4 لیتر)",
      "- این گیربکس از نوع Wet DCT است و نباید با ATF معمولی پر شود.",
      "- بازه تعویض پیشنهادی: هر 60,000 کیلومتر یا 4 سال.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "برای MG 6 نیوفیس با موتور 1.8T از روغن تمام‌سنتتیک مخصوص توربو استفاده شود.",
          "- گریدهای قابل استفاده: 5W-30 / 5W-40 / 0W-30.",
          "- سطح کیفی: API SN / API SP.",
          "- حجم سرویس روغن موتور: 4.9 لیتر.",
        ].join("\n"),
      },
      {
        categoryId: 3,
        description: [
          "گیربکس این مدل 6 دنده دوکلاچه 6DCT360 از نوع Wet DCT است.",
          "- روغن گیربکس با تاییدیه VW TL 052 182 یا Pentosin FFL-2 / FFL-3 / FFL-4 استفاده شود.",
          "- ظرفیت کل گیربکس حدود 7.7 لیتر است و در تعویض دستی حدود 4 لیتر مصرف می‌شود.",
          "- بازه تعویض پیشنهادی: هر 60,000 کیلومتر یا 4 سال.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-62-mg-gs": {
    ...OFFICIAL_MG_HUB,
    engineCode: "20L4E / MGE 2.0T",
    viscosity: "5W-30 / 0W-30",
    specification: "ACEA C3 / API SN یا بالاتر",
    oilCapacityLit: 6,
    engineDetails: [
      "نوع موتور: 4 سیلندر بنزینی توربو 2 لیتر با تزریق مستقیم",
      "کد یا خانواده موتور: 20L4E / MGE 2.0T",
      "ویسکوزیته پیشنهادی روغن موتور: 5W-30 / 0W-30",
      "استاندارد روغن موتور: ACEA C3 / API SN یا بالاتر",
      "حجم سرویس روغن موتور: 6 لیتر",
      "- بولتن فنی SAIC برای MG GS با موتور MGE 2.0T به‌صورت صریح C3 5W-30 یا C3 0W-30 را ثبت می‌کند.",
    ].join("\n"),
    gearboxDetails: [
      "نوع گیربکس: 6 دنده دوکلاچه تر 6DCT360",
      "سطح کیفیت روغن گیربکس: VW TL 052 182 / Pentosin FFL-2",
      "حجم روغن گیربکس: 6.5 لیتر",
      "- این گیربکس از نوع Wet DCT و سیستم انتقال قدرت آن AWD است.",
      "- بازه تعویض پیشنهادی: هر 60,000 کیلومتر یا 4 سال.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "برای MG GS با موتور MGE 2.0T از روغن مناسب موتور توربو تزریق مستقیم با گرید 5W-30 یا 0W-30 استفاده شود.",
          "- سطح کیفی ثبت‌شده در بولتن فنی SAIC: ACEA C3 و حداقل API SN.",
          "- حجم سرویس روغن موتور: 6 لیتر.",
          "- روغن 10W-40 و 5W-40 برای این موتور مرجع اصلی توصیه نشده‌اند.",
        ].join("\n"),
        sourceTitle: "بولتن فنی روغن موتور MG - SAIC SI-ALL-EN-20170811",
        sourceUrl: "https://mg-wiki.com/media/oils/SI-ALL-EN-20170811-The.pdf",
      },
      {
        categoryId: 3,
        description: [
          "گیربکس MG GS از نوع 6 دنده دوکلاچه تر 6DCT360 است.",
          "- روغن گیربکس با تاییدیه VW TL 052 182 یا Pentosin FFL-2 استفاده شود.",
          "- ظرفیت کل گیربکس حدود 6.5 لیتر است.",
          "- بازه تعویض پیشنهادی: هر 60,000 کیلومتر یا 4 سال.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-68-mg-rx5": {
    sourceTitle: "دفترچه راهنمای مالک MG RX5",
    sourceUrl: "https://mgmotors-prod-s3.s3.us-east-2.amazonaws.com/CL/pdp/MG-RX5/PDf/--manual-de-usuario-rx5.pdf.pdf",
    engineType: "4 سیلندر بنزینی توربو 2 لیتر",
    engineCode: "20L4E / 2.0T GDi",
    viscosity: "5W-30 / 0W-30",
    specification: "ACEA C3 / API SN یا بالاتر",
    oilCapacityLit: 6,
    engineDetails: [
      "نوع موتور: 4 سیلندر بنزینی توربو 2 لیتر با تزریق مستقیم",
      "کد یا خانواده موتور: 20L4E / MGE 2.0T GDi",
      "ویسکوزیته پیشنهادی روغن موتور: 5W-30 / 0W-30",
      "استاندارد روغن موتور: ACEA C3 / API SN یا بالاتر",
      "حجم سرویس روغن موتور: 6 لیتر",
      "- بولتن فنی SAIC برای MG RX5 با موتور MGE 2.0T به‌صورت صریح C3 5W-30 یا C3 0W-30 را ثبت می‌کند.",
    ].join("\n"),
    gearboxDetails: [
      "نوع گیربکس: 6 دنده دوکلاچه تر DCT",
      "سطح کیفیت روغن گیربکس: VW TL 052 182 / Pentosin FFL-2",
      "حجم روغن گیربکس: 6.5 لیتر",
      "- این گیربکس با خانواده Wet DCT مورد استفاده در MG GS هم‌خانواده است.",
      "- بازه تعویض پیشنهادی: هر 60,000 کیلومتر.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "برای MG RX5 با موتور MGE 2.0T از روغن مناسب موتور توربو تزریق مستقیم با گرید 5W-30 یا 0W-30 استفاده شود.",
          "- سطح کیفی ثبت‌شده در بولتن فنی SAIC: ACEA C3 و حداقل API SN.",
          "- حجم سرویس روغن موتور: 6 لیتر.",
          "- بازه تعویض پیشنهادی: حدود 8,000 تا 10,000 کیلومتر.",
        ].join("\n"),
        sourceTitle: "بولتن فنی روغن موتور MG - SAIC SI-ALL-EN-20170811",
        sourceUrl: "https://mg-wiki.com/media/oils/SI-ALL-EN-20170811-The.pdf",
      },
      {
        categoryId: 3,
        description: [
          "گیربکس MG RX5 از نوع 6 دنده دوکلاچه تر DCT است.",
          "- روغن گیربکس با تاییدیه VW TL 052 182 یا Pentosin FFL-2 استفاده شود.",
          "- ظرفیت کل گیربکس حدود 6.5 لیتر است.",
          "- بازه تعویض پیشنهادی: هر 60,000 کیلومتر.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-1049-mg-hs-phev-1-5t-10at": {
    sourceTitle: "دفترچه راهنمای مالک MG HS PHEV",
    sourceUrl: "https://media-hub-prod.mgmotor.me/manuals/MG_HS_Hybrid_English.pdf",
    engineType: "4 سیلندر پلاگین‌هیبرید توربو 1.5 لیتر",
    engineCode: "1.5T PHEV",
    viscosity: "0W-20",
    specification: "ACEA C5 / API SP",
    oilCapacityLit: 4,
    overviewDetails: [
      "ام جی HS پلاگین‌هیبرید",
      "سال ساخت مرجع رسمی: 2024 تا 2025",
      "کشور سازنده: چین",
      "- این نسخه از قوای محرکه 1.5T PHEV استفاده می‌کند و دفترچه رسمی برای آن جدول مستقل Recommended Fluids and Capacities دارد.",
      "- روغن موتور رسمی این نسخه C5&SP 0W-20 با حجم 4 لیتر است.",
      "- روغن سامانه انتقال قدرت هیبریدی نیز در دفترچه با گرید SL 2808 و حجم 1.8 لیتر ثبت شده است.",
    ].join("\n"),
    engineDetails: [
      "نوع موتور: 4 سیلندر پلاگین‌هیبرید توربو 1.5 لیتر",
      "کد یا خانواده موتور: 1.5T PHEV",
      "ویسکوزیته پیشنهادی روغن موتور: 0W-20",
      "استاندارد روغن موتور: ACEA C5 / API SP",
      "حجم سرویس روغن موتور: 4 لیتر",
      "- این مقادیر از جدول Recommended Fluids and Capacities دفترچه رسمی MG HS PHEV برداشت شده‌اند.",
    ].join("\n"),
    gearboxDetails: [
      "نوع گیربکس: سامانه انتقال قدرت هیبریدی PHEV",
      "روغن سامانه انتقال قدرت: SL 2808",
      "حجم روغن سامانه انتقال قدرت: 1.8 لیتر",
      "- در دفترچه رسمی این نسخه Hybrid transmission oil با گرید SL 2808 ثبت شده است.",
      "- روغن ATF معمولی مرجع اصلی این نسخه نیست.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "در دفترچه رسمی MG HS PHEV برای نسخه 1.5T PHEV روغن موتور C5&SP 0W-20 ثبت شده است.",
          "- حجم سرویس روغن موتور: 4 لیتر.",
          "- این اطلاعات از جدول Recommended Fluids and Capacities صفحه فنی دفترچه رسمی برداشت شده‌اند.",
        ].join("\n"),
      },
      {
        categoryId: 3,
        description: [
          "نسخه PHEV این خودرو در دفترچه رسمی با Hybrid transmission oil ثبت شده است.",
          "- گرید روغن: SL 2808.",
          "- حجم روغن سامانه انتقال قدرت: 1.8 لیتر.",
          "- این نسخه به‌جای ATF معمولی از روانکار اختصاصی سامانه هیبریدی استفاده می‌کند.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-1109-mg-5-1-5l-cvt": {
    sourceTitle: "دفترچه راهنمای مالک MG 5",
    sourceUrl: "https://media-hub-prod.mgmotor.me/manuals/MG_5_English.pdf",
    engineCode: "15FCD",
    specification: "ACEA C5",
    oilCapacityLit: 4,
    engineDetails: [
      "نوع موتور: 4 سیلندر بنزینی 1.5 لیتر",
      "کد یا خانواده موتور: 15FCD",
      "ویسکوزیته پیشنهادی روغن موتور: 0W-20",
      "استاندارد روغن موتور: ACEA C5",
      "حجم سرویس روغن موتور: 4 لیتر",
      "- این مقادیر برای نسخه 1.5L-CVT از جدول Recommended Fluids and Capacities دفترچه رسمی برداشت شده‌اند.",
    ].join("\n"),
    gearboxDetails: [
      "نوع گیربکس: CVT",
      "روغن گیربکس: Shell SL-2100",
      "حجم روغن گیربکس: 6.86 لیتر",
      "- این اطلاعات برای نسخه 1.5L-CVT در جدول رسمی دفترچه MG 5 ثبت شده است.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "دفترچه رسمی MG 5 برای نسخه 1.5L-CVT روغن موتور C5 0W-20 را ثبت می‌کند.",
          "- حجم سرویس روغن موتور: 4 لیتر.",
          "- برای جایگزینی روغن، از محصولی با سطح کیفی معادل و تاییدشده استفاده شود.",
        ].join("\n"),
      },
      {
        categoryId: 3,
        description: [
          "گیربکس این مدل از نوع CVT است.",
          "- روغن گیربکس رسمی: Shell SL-2100.",
          "- ظرفیت روغن گیربکس: 6.86 لیتر.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-1105-mg7": {
    sourceTitle: "دفترچه راهنمای مالک MG 7",
    sourceUrl: "https://media-hub-prod.mgmotor.me/manuals/MG_7_English.pdf",
    engineType: "بنزینی توربو 1.5 یا 2.0 لیتر",
    engineCode: "1.5T / 2.0T",
    viscosity: "0W-20",
    specification: "ACEA C5 / API SP",
    overviewDetails: [
      "ام جی 7 مدل 2025",
      "سال ساخت مرجع رسمی: 2025",
      "کشور سازنده: چین",
      "- دفترچه رسمی MG 7 دو تیپ فنی را پوشش می‌دهد: 1.5T با گیربکس 7DCT280 و 2.0T با گیربکس 9AT.",
      "- برای هر دو تیپ، روغن موتور C5&SP 0W-20 در جدول رسمی دفترچه ثبت شده است.",
    ].join("\n"),
    engineDetails: [
      "نوع موتور: بنزینی توربو 1.5 یا 2.0 لیتر",
      "کد یا خانواده موتور: 1.5T / 2.0T",
      "ویسکوزیته پیشنهادی روغن موتور: 0W-20",
      "استاندارد روغن موتور: ACEA C5 / API SP",
      "حجم سرویس روغن موتور: 4 لیتر برای 1.5T و 4.8 لیتر برای 2.0T",
      "- این مقادیر از جدول Recommended Fluids and Capacities دفترچه رسمی MG 7 برداشت شده‌اند.",
    ].join("\n"),
    gearboxDetails: [
      "نوع گیربکس: 7DCT280 یا 9AT بسته به تیپ",
      "روغن گیربکس 1.5T DCT280: Dexron DCT Fluid (2.45 لیتر) + Pentosin CHF 202 (1.8 لیتر) + Castrol BOT 280b (2.15 لیتر)",
      "روغن گیربکس 2.0T 9AT: Shell ATF L12108 (7.2 لیتر)",
      "- دفترچه رسمی برای MG 7 دو سامانه انتقال قدرت متفاوت را ثبت کرده است.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "دفترچه رسمی MG 7 برای هر دو تیپ 1.5T و 2.0T روغن موتور C5&SP 0W-20 را ثبت می‌کند.",
          "- نسخه 1.5T حدود 4 لیتر روغن موتور نیاز دارد.",
          "- نسخه 2.0T حدود 4.8 لیتر روغن موتور نیاز دارد.",
        ].join("\n"),
      },
      {
        categoryId: 3,
        description: [
          "نسخه 1.5T این خودرو از گیربکس 7DCT280 و نسخه 2.0T از گیربکس 9AT استفاده می‌کند.",
          "- 1.5T DCT280: Dexron DCT Fluid به حجم 2.45 لیتر، Pentosin CHF 202 به حجم 1.8 لیتر و Castrol BOT 280b به حجم 2.15 لیتر.",
          "- 2.0T 9AT: Shell ATF L12108 به حجم 7.2 لیتر.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-1106-mg4-ev": {
    sourceTitle: "دفترچه راهنمای مالک MG 4 EV",
    sourceUrl: "https://media-hub-prod.mgmotor.me/manuals/MG_4_English.pdf",
    engineType: "برقی",
    engineCode: "MG4 EV",
    viscosity: "فاقد روغن موتور",
    specification: "روغن موتور ندارد",
    oilCapacityLit: 0,
    overviewDetails: [
      "ام جی 4 EV",
      "سال ساخت مرجع رسمی: 2024",
      "کشور سازنده: چین",
      "- این خودرو تمام‌برقی است و موتور احتراقی ندارد.",
      "- دفترچه رسمی برای این خودرو روغن موتور سرویس دوره‌ای تعریف نکرده است.",
      "- جدول رسمی دفترچه فقط روغن مجموعه انتقال قدرت برقی، ضدیخ مدارها و روغن ترمز را ثبت می‌کند.",
    ].join("\n"),
    engineDetails: [
      "نوع موتور: برقی",
      "کد یا خانواده موتور: MG4 EV",
      "ویسکوزیته پیشنهادی روغن موتور: فاقد روغن موتور",
      "استاندارد روغن موتور: این خودرو موتور احتراقی ندارد.",
      "حجم سرویس روغن موتور: فاقد روغن موتور",
      "- دفترچه رسمی MG4 برای این خودرو روغن موتور سرویس دوره‌ای تعریف نکرده است.",
    ].join("\n"),
    gearboxDetails: [
      "نوع گیربکس: انتقال قدرت برقی تک‌سرعته",
      "روغن مجموعه انتقال قدرت: Shell E-Fluids E6 iX (SL2808)",
      "حجم روغن مجموعه انتقال قدرت: جلو 1.1 لیتر در برخی نسخه‌ها و محور عقب 0.85 تا 0.9 لیتر بسته به نسخه",
      "- این مقادیر از جدول Recommended Fluids and Capacities دفترچه رسمی MG4 برداشت شده‌اند.",
    ].join("\n"),
    sectionOverrides: [
      {
        categoryId: 1,
        description: [
          "این خودرو تمام‌برقی است و روغن موتور سرویس دوره‌ای ندارد.",
          "- دفترچه رسمی برای MG4 هیچ گرید یا حجم روغن موتور احتراقی تعریف نکرده است.",
        ].join("\n"),
      },
      {
        categoryId: 3,
        description: [
          "مجموعه انتقال قدرت MG4 از نوع برقی تک‌سرعته است.",
          "- روانکار مرجع: Shell E-Fluids E6 iX (SL2808).",
          "- مقدار روغن مجموعه انتقال قدرت بسته به نسخه بین 0.85 تا 1.1 لیتر ثبت شده است.",
        ].join("\n"),
      },
    ],
    replaceAllSectionSources: true,
  },
  "hyundai-69-mg-gt-1-5l-turbo": {
    sourceTitle: "دفترچه راهنمای مالک MG GT",
    sourceUrl: "https://media-hub-prod.mgmotor.me/manuals/MG_GT_English.pdf",
    replaceAllSectionSources: true,
  },
  "hyundai-63-mg-360-turbo-1-5t-at": {
    ...OFFICIAL_MG_HUB,
    replaceAllSectionSources: true,
  },
  "hyundai-64-mg-360-at": {
    ...OFFICIAL_MG_HUB,
    replaceAllSectionSources: true,
  },
  "hyundai-65-mg-360-mt": {
    ...OFFICIAL_MG_HUB,
    replaceAllSectionSources: true,
  },
};

export function applyCarManualOverrides<T extends ManualAwareCar>(car: T): T {
  const override = MG_MANUAL_OVERRIDES[car.slug];

  if (!override) {
    return car;
  }

  const nextCar = {
    ...car,
    engineType: override.engineType ?? car.engineType,
    engineCode: override.engineCode ?? car.engineCode,
    viscosity: override.viscosity ?? car.viscosity,
    specification: override.specification ?? car.specification,
    overviewDetails: appendOfficialSource(override.overviewDetails ?? car.overviewDetails, override.sourceUrl),
    engineDetails: appendOfficialSource(override.engineDetails ?? car.engineDetails, override.sourceUrl),
    gearboxDetails: appendOfficialSource(override.gearboxDetails ?? car.gearboxDetails, override.sourceUrl),
    maintenanceInfo: appendOfficialSource(override.maintenanceInfo ?? car.maintenanceInfo, override.sourceUrl),
    notebookSections: mergeNotebookSections(car.notebookSections, override),
  } as T;

  if (Object.prototype.hasOwnProperty.call(override, "oilCapacityLit")) {
    nextCar.oilCapacityLit = override.oilCapacityLit as T["oilCapacityLit"];
  }

  return nextCar;
}

export function resolveCarOilCapacityLabel(car: Pick<ManualAwareCar, "oilCapacityLit" | "engineType" | "engineDetails" | "viscosity" | "specification">) {
  if (car.oilCapacityLit != null) {
    const serialized = typeof car.oilCapacityLit === "object" && car.oilCapacityLit && "toString" in car.oilCapacityLit
      ? car.oilCapacityLit.toString()
      : String(car.oilCapacityLit);

    if (serialized !== "0" && serialized.trim().length > 0) {
      return `${serialized} لیتر`;
    }
  }

  const manualCapacity = extractNamedLineValue(car.engineDetails, "حجم سرویس روغن موتور");
  if (manualCapacity) {
    return manualCapacity;
  }

  if (hasNoEngineOil(car)) {
    return "فاقد روغن موتور";
  }

  return "نامشخص";
}

function hasNoEngineOil(car: Pick<ManualAwareCar, "engineType" | "engineDetails" | "viscosity" | "specification">) {
  const haystack = [car.engineType, car.engineDetails, car.viscosity, car.specification]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n");

  return /فاقد روغن موتور|روغن موتور ندارد|موتور احتراقی ندارد|تمام‌برقی|تمام برقی/u.test(haystack);
}

function extractNamedLineValue(text: string | null | undefined, label: string) {
  if (!text) {
    return null;
  }

  const target = `${label}:`;
  const line = text
    .split(/\r?\n/u)
    .map((item) => item.trim())
    .find((item) => item.startsWith(target));

  if (!line) {
    return null;
  }

  return line.slice(target.length).trim() || null;
}

function appendOfficialSource(text: string | null | undefined, sourceUrl: string) {
  if (!text) {
    return text;
  }

  const lines = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("منبع"));

  return [...lines, `منبع رسمی دفترچه: ${sourceUrl}`].join("\n");
}

function mergeNotebookSections(value: unknown, override: ManualOverride) {
  const sections = parseStoredNotebookSections(value);
  const byCategoryId = new Map<number, StoredCarNotebookSection>();

  sections.forEach((section) => {
    byCategoryId.set(section.categoryId, {
      ...section,
      sourceTitle: override.replaceAllSectionSources ? override.sourceTitle : section.sourceTitle,
      sourceUrl: override.replaceAllSectionSources ? override.sourceUrl : section.sourceUrl,
    });
  });

  for (const sectionOverride of override.sectionOverrides ?? []) {
    const existing = byCategoryId.get(sectionOverride.categoryId);
    const requestedSection = REQUESTED_CAR_NOTEBOOK_SECTION_BY_ID.get(sectionOverride.categoryId);

    byCategoryId.set(sectionOverride.categoryId, {
      categoryId: sectionOverride.categoryId,
      id: existing?.id ?? requestedSection?.id ?? `section-${sectionOverride.categoryId}`,
      title: sectionOverride.title ?? existing?.title ?? requestedSection?.title ?? "دفترچه",
      tag: sectionOverride.tag ?? existing?.tag ?? requestedSection?.tag ?? "دفترچه",
      sourceTitle: sectionOverride.sourceTitle ?? override.sourceTitle,
      description: sectionOverride.description,
      sourceUrl: sectionOverride.sourceUrl ?? override.sourceUrl,
    });
  }

  const existingOrder = sections.map((section) => section.categoryId);
  const missingOrder = Array.from(byCategoryId.keys()).filter((categoryId) => !existingOrder.includes(categoryId));
  const orderedIds = [...existingOrder, ...missingOrder];

  return orderedIds
    .map((categoryId) => byCategoryId.get(categoryId))
    .filter((section): section is StoredCarNotebookSection => Boolean(section));
}

function parseStoredNotebookSections(value: unknown): StoredCarNotebookSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sections: StoredCarNotebookSection[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const section = item as Record<string, unknown>;

    if (
      typeof section.categoryId !== "number" ||
      typeof section.id !== "string" ||
      typeof section.title !== "string" ||
      typeof section.tag !== "string" ||
      typeof section.description !== "string"
    ) {
      continue;
    }

    sections.push({
      categoryId: section.categoryId,
      id: section.id,
      title: section.title,
      tag: section.tag,
      sourceTitle: typeof section.sourceTitle === "string" && section.sourceTitle.trim().length > 0 ? section.sourceTitle : section.title,
      description: section.description,
      sourceUrl: typeof section.sourceUrl === "string" && section.sourceUrl.trim().length > 0 ? section.sourceUrl : undefined,
    });
  }

  return sections;
}
