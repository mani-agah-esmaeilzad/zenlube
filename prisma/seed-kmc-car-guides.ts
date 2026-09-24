import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

type NotebookSection = {
  categoryId: number;
  id: string;
  title: string;
  tag: string;
  sourceTitle: string;
  description: string;
  sourceUrl: string;
};

type KmcCarDefinition = {
  slug: string;
  model: string;
  generation: string;
  imageUrl: string;
  engineCode: string;
  engineType: string;
  yearFrom: number;
  yearTo: number;
  viscosity: string;
  oilCapacityLit: number;
  specification: string;
  overviewDetails: string;
  engineDetails: string;
  gearboxDetails: string;
  maintenanceInfo: string;
  manualTitle: string;
  manualUrl: string;
  engineOilDescription: string;
  gearboxOilDescription: string;
  brakeFluidDescription: string;
  coolantDescription: string;
  hydraulicDescription: string;
  compatibleViscosities: string[];
  minimumApi: "SL" | "SM" | "SN" | null;
};

const KMC_CARS: readonly KmcCarDefinition[] = [
  {
    slug: "hyundai-766-kmc-jac-j7-1-5t-6dct",
    model: "J7 توربو 1.5T 6DCT",
    generation: "نسخه بازار ایران",
    imageUrl: "/vehicles/kmc/kmc-j7.webp",
    engineCode: "1.5 TGDI",
    engineType: "چهار سیلندر ۱.۵ لیتری توربوشارژ تزریق مستقیم",
    yearFrom: 2022,
    yearTo: 2026,
    viscosity: "5W-30",
    oilCapacityLit: 4,
    specification: "API SN، تمام‌سنتتیک",
    overviewDetails: "KMC J7 بازار ایران یک سدان فست‌بک دیفرانسیل جلو با موتور ۱.۵ لیتری توربو GDI و گیربکس ۶ سرعته دوکلاچه است. قدرت اعلامی نسخه بازار ایران ۱۷۲ اسب‌بخار و گشتاور آن ۲۸۰ نیوتن‌متر است.",
    engineDetails: "نوع پیشرانه: چهار سیلندر ۱.۵ لیتری توربو GDI\nقدرت: ۱۷۲ اسب‌بخار\nگشتاور: ۲۸۰ نیوتن‌متر\nروغن موتور: 5W-30 تمام‌سنتتیک، API SN\nحجم روغن موتور: ۴±۰٫۳ لیتر",
    gearboxDetails: "نوع گیربکس: ۶ سرعته دوکلاچه DCT\nروغن توصیه‌شده: Shell DCT12\nظرفیت ثبت‌شده: ۶٫۸ تا ۷ لیتر\nATF عمومی جایگزین روغن اختصاصی DCT نیست.",
    maintenanceInfo: "روغن موتور و فیلتر روغن باید مطابق جدول سرویس‌های دوره‌ای با هم تعویض شوند. در رانندگی پرترافیک، گرمای زیاد یا کارکرد سنگین، کنترل سطح روغن را زودتر انجام دهید.",
    manualTitle: "دفترچه فارسی مالک KMC J7",
    manualUrl: "https://www.bamkhodro.com/wp-content/uploads/2023/01/KMC-J7-min-1.pdf",
    engineOilDescription: "روغن 5W-30 تمام‌سنتتیک با API SN و حجم ۴±۰٫۳ لیتر. پس از تعویض فیلتر، سطح نهایی طبق روش دفترچه کنترل شود.",
    gearboxOilDescription: "گیربکس ۶ سرعته دوکلاچه با روغن Shell DCT12 و ظرفیت ۶٫۸ تا ۷ لیتر؛ از ATF عمومی استفاده نشود.",
    brakeFluidDescription: "روغن ترمز DOT 4 مطابق جدول دفترچه؛ سطح مخزن باید دوره‌ای کنترل شود و فقط مایع تازه و هم‌نوع اضافه شود.",
    coolantDescription: "مایع خنک‌کننده اتیلن‌گلیکول ۵۰٪ با ظرفیت ۷٫۷±۰٫۵ لیتر؛ اختلاط مواد ناسازگار یا افزودن آب دارای املاح می‌تواند به مدار خنک‌کاری آسیب بزند.",
    hydraulicDescription: "فرمان J7 برقی است و مدار سرویس روغن هیدرولیک فرمان ندارد.",
    compatibleViscosities: ["5W-30"],
    minimumApi: "SN",
  },
  {
    slug: "hyundai-44-kmc-k7-1-5t-6dct",
    model: "K7 توربو 1.5T 6DCT",
    generation: "نسخه بازار ایران",
    imageUrl: "/vehicles/kmc/kmc-k7.webp",
    engineCode: "1.5T",
    engineType: "چهار سیلندر ۱.۵ لیتری توربوشارژ",
    yearFrom: 2021,
    yearTo: 2023,
    viscosity: "5W-30؛ 0W-30 فقط در دمای کمتر از ‎-30°C",
    oilCapacityLit: 5.1,
    specification: "سطح API در جدول فارسی دفترچه ذکر نشده؛ روغن مورد تأیید کرمان موتور",
    overviewDetails: "KMC K7 یک کراس‌اوور دیفرانسیل جلو با موتور ۱.۵ لیتری توربو و گیربکس دوکلاچه است. دفترچه 5W-30 را برای شرایط عادی و 0W-30 را فقط برای سرمای کمتر از منفی ۳۰ درجه ثبت کرده است.",
    engineDetails: "نوع پیشرانه: چهار سیلندر ۱.۵ لیتری توربو\nقدرت: ۱۲۰ کیلووات\nگشتاور: ۲۵۱ نیوتن‌متر\nروغن موتور: 5W-30؛ 0W-30 فقط زیر ‎-30°C\nحجم روغن موتور: ۵٫۱ لیتر\nسطح API در جدول فارسی دفترچه صریحاً درج نشده است.",
    gearboxDetails: "نوع گیربکس: ۶ سرعته دوکلاچه DCT\nروغن توصیه‌شده: Pentosin FFL-2 یا Shell DCT\nظرفیت ثبت‌شده: ۷٫۱ لیتر",
    maintenanceInfo: "روغن موتور و فیلتر در برنامه سرویس دوره‌ای با هم تعویض شوند. گرید 0W-30 توصیه عمومی نیست و دفترچه آن را به سرمای کمتر از منفی ۳۰ درجه محدود کرده است.",
    manualTitle: "دفترچه فارسی مالک و گارانتی KMC K7",
    manualUrl: "https://cargeek.live/docs/K7_Warranty_S7blLib.pdf",
    engineOilDescription: "برای شرایط معمول 5W-30 با حجم ۵٫۱ لیتر؛ 0W-30 فقط برای سرمای کمتر از منفی ۳۰ درجه. سطح API در جدول فارسی دفترچه درج نشده و نباید حدس زده شود.",
    gearboxOilDescription: "گیربکس دوکلاچه با روغن Pentosin FFL-2 یا Shell DCT و ظرفیت ۷٫۱ لیتر.",
    brakeFluidDescription: "روغن ترمز DOT 4 مطابق جدول دفترچه؛ سطح مخزن دوره‌ای کنترل و فقط مایع تازه و هم‌نوع استفاده شود.",
    coolantDescription: "مایع خنک‌کننده با ضدیخ ۵۰٪ و ظرفیت ۱۰ لیتر؛ از خنک‌کننده اصلی و هم‌نوع استفاده شود و ترکیب ناشناخته به مدار افزوده نشود.",
    hydraulicDescription: "فرمان K7 برقی است و روغن هیدرولیک فرمان در برنامه سرویس این نسخه وجود ندارد.",
    compatibleViscosities: ["5W-30", "0W-30"],
    minimumApi: null,
  },
  {
    slug: "hyundai-1033-kmc-x5-1-5t-6dct",
    model: "X5 توربو 1.5T 6DCT",
    generation: "نسخه بازار ایران",
    imageUrl: "/vehicles/kmc/kmc-x5.webp",
    engineCode: "HFC4GC1",
    engineType: "چهار سیلندر ۱.۵ لیتری توربوشارژ تزریق مستقیم",
    yearFrom: 2023,
    yearTo: 2026,
    viscosity: "5W-30",
    oilCapacityLit: 4.5,
    specification: "API SN، تمام‌سنتتیک",
    overviewDetails: "KMC X5 یک کراس‌اوور دیفرانسیل جلو با موتور HFC4GC1 و گیربکس دوکلاچه HFCDTF632 است. مقدار صحیح جدول دفترچه برای روغن موتور ۴٫۵±۰٫۳ لیتر است.",
    engineDetails: "نوع پیشرانه: چهار سیلندر ۱.۵ لیتری توربو GDI\nکد موتور: HFC4GC1\nقدرت: ۱۲۸ کیلووات\nگشتاور: ۲۸۰ نیوتن‌متر\nروغن موتور: 5W-30 تمام‌سنتتیک، API SN\nحجم روغن موتور: ۴٫۵±۰٫۳ لیتر",
    gearboxDetails: "نوع گیربکس: ۶ سرعته دوکلاچه HFCDTF632\nروغن توصیه‌شده: Shell DCT12\nظرفیت ثبت‌شده: ۶٫۸ تا ۷ لیتر",
    maintenanceInfo: "روغن موتور و فیلتر طبق جدول سرویس‌های دوره‌ای تعویض شوند. حجم ۴٫۵±۰٫۳ لیتر مبنای دفترچه است و سطح نهایی باید پس از سرویس کنترل شود.",
    manualTitle: "دفترچه فارسی KMC X5",
    manualUrl: "https://www.bamkhodro.com/wp-content/uploads/2023/12/KMCX514001208-min.pdf",
    engineOilDescription: "روغن 5W-30 تمام‌سنتتیک API SN با حجم ۴٫۵±۰٫۳ لیتر. این مقدار جایگزین عدد نادرست ۴٫۲ لیتر در داده قبلی اویل‌بار می‌شود.",
    gearboxOilDescription: "گیربکس ۶ سرعته دوکلاچه HFCDTF632 با روغن Shell DCT12 و ظرفیت ۶٫۸ تا ۷ لیتر.",
    brakeFluidDescription: "روغن ترمز DOT 4 با ظرفیت تقریبی ۸۲۰±۵۰ میلی‌لیتر در جدول دفترچه ثبت شده است.",
    coolantDescription: "مایع خنک‌کننده اتیلن‌گلیکول ۵۰٪ با ظرفیت ۸±۰٫۵ لیتر؛ از اختلاط خنک‌کننده‌های ناسازگار خودداری شود.",
    hydraulicDescription: "فرمان X5 برقی است و مدار روغن هیدرولیک فرمان ندارد.",
    compatibleViscosities: ["5W-30"],
    minimumApi: "SN",
  },
  {
    slug: "hyundai-29-jac-kmc-t8-2-0t-6mt",
    model: "T8 پیکاپ 2.0T 6MT",
    generation: "نسخه دو دیفرانسیل بازار ایران",
    imageUrl: "/vehicles/kmc/kmc-t8.webp",
    engineCode: "HFC4GA3-4D1",
    engineType: "چهار سیلندر ۲ لیتری توربوشارژ با اینترکولر",
    yearFrom: 2020,
    yearTo: 2026,
    viscosity: "10W-40 برای ‎-20 تا 40°C؛ 5W-30 برای سرمای کمتر از ‎-30°C",
    oilCapacityLit: 5.7,
    specification: "API SM یا بالاتر",
    overviewDetails: "KMC T8 پیکاپ دوکابین چهارچرخ محرک با موتور ۲ لیتری توربو HFC4GA3-4D1 و گیربکس ۶ سرعته دستی است. گرید روغن موتور در دفترچه بر اساس دمای محیط تفکیک شده است.",
    engineDetails: "نوع پیشرانه: چهار سیلندر ۲ لیتری توربو با اینترکولر\nکد موتور: HFC4GA3-4D1\nقدرت: ۱۳۰ کیلووات (حدود ۱۷۴ اسب‌بخار)\nگشتاور: ۲۹۰ نیوتن‌متر\nروغن موتور: 10W-40 برای ‎-20 تا 40°C؛ 5W-30 برای سرمای کمتر از ‎-30°C\nسطح کیفی: API SM یا بالاتر\nحجم روغن موتور: ۵٫۷±۰٫۳ لیتر",
    gearboxDetails: "نوع گیربکس: ۶ سرعته دستی\nروغن گیربکس: 75W-85 API GL-4\nظرفیت گیربکس: ۲٫۴ لیتر\nدیفرانسیل‌ها به روغن GL-5 مجزا و متناسب با دمای محیط نیاز دارند.",
    maintenanceInfo: "روغن موتور و فیلتر طبق برنامه سرویس دوره‌ای با هم تعویض شوند. در آفرود، گردوغبار، یدک‌کشی یا بار سنگین، بازدید روغن موتور، گیربکس و دیفرانسیل‌ها باید محافظه‌کارانه‌تر باشد.",
    manualTitle: "دفترچه فارسی مالک و گارانتی KMC T8",
    manualUrl: "https://padidehkhodro.com/wp-content/uploads/2022/04/t8_warranty.pdf",
    engineOilDescription: "10W-40 با API SM یا بالاتر برای دمای حدود منفی ۲۰ تا ۴۰ درجه؛ 5W-30 با API SM یا بالاتر برای سرمای کمتر از منفی ۳۰ درجه. حجم ۵٫۷±۰٫۳ لیتر.",
    gearboxOilDescription: "گیربکس ۶ سرعته دستی با 75W-85 API GL-4 و ظرفیت ۲٫۴ لیتر. روغن دیفرانسیل‌های جلو و عقب از نوع GL-5 و جدا از گیربکس است.",
    brakeFluidDescription: "روغن ترمز DOT 4؛ سطح مخزن و نشتی مدار باید دوره‌ای بررسی شود.",
    coolantDescription: "مایع خنک‌کننده از نوع گلیکول و مورد تأیید کرمان موتور استفاده شود؛ در کارکرد سنگین و آفرود سطح و نشتی مدار زودتر کنترل شود.",
    hydraulicDescription: "فرمان هیدرولیک T8 از ATF III به مقدار مورد نیاز استفاده می‌کند؛ سطح روغن و نشتی شیلنگ‌ها بررسی شود.",
    compatibleViscosities: ["10W-40", "5W-30"],
    minimumApi: "SM",
  },
  {
    slug: "hyundai-999-kmc-t9-2-0t-gdi-8-at",
    model: "T9 پیکاپ 2.0T-GDI 8AT",
    generation: "نسخه دو دیفرانسیل بازار ایران",
    imageUrl: "/vehicles/kmc/kmc-t9.webp",
    engineCode: "N20TG",
    engineType: "چهار سیلندر ۲ لیتری توربوشارژ تزریق مستقیم",
    yearFrom: 2023,
    yearTo: 2026,
    viscosity: "5W-30",
    oilCapacityLit: 4.7,
    specification: "API SL یا بالاتر",
    overviewDetails: "KMC T9 پیکاپ دوکابین چهارچرخ محرک با موتور ۲ لیتری توربو GDI کد N20TG و گیربکس ۸ سرعته اتوماتیک A8R50 است. دفترچه تمام ظرفیت‌های روانکار را در فصل مشخصات فنی ثبت کرده است.",
    engineDetails: "نوع پیشرانه: چهار سیلندر ۲ لیتری توربو GDI\nکد موتور: N20TG\nقدرت: ۱۶۵ کیلووات (حدود ۲۲۱ اسب‌بخار)\nگشتاور: ۳۹۰ نیوتن‌متر\nروغن موتور: 5W-30، API SL یا بالاتر\nحجم روغن موتور: ۴٫۷ لیتر",
    gearboxDetails: "نوع گیربکس: ۸ سرعته اتوماتیک A8R50\nروغن گیربکس: DAE ATF2 Long Pan\nظرفیت گیربکس: ۸٫۷ لیتر\nاکسل جلو: ۰٫۹ لیتر GL-5\nاکسل عقب: ۲٫۶ لیتر GL-5",
    maintenanceInfo: "روغن موتور و فیلتر طبق برنامه سرویس دوره‌ای تعویض شوند. در استفاده آفرودی، یدک‌کشی یا بار سنگین، سطح روغن موتور، گیربکس و اکسل‌ها در فواصل کوتاه‌تر بازدید شود.",
    manualTitle: "دفترچه فارسی KMC T9",
    manualUrl: "https://www.bamkhodro.com/wp-content/uploads/2024/08/%D8%AF%D9%81%D8%AA%D8%B1%DA%86%D9%87-%D9%81%D8%A7%D8%B1%D8%B3%DB%8C-%D8%AA%DB%8C9-min.pdf",
    engineOilDescription: "روغن 5W-30 با سطح API SL یا بالاتر و حجم ۴٫۷ لیتر. سطح بالاتر API فقط در صورت حفظ سازگاری کامل با این موتور انتخاب شود.",
    gearboxOilDescription: "گیربکس ۸ سرعته A8R50 با روغن DAE ATF2 Long Pan و ظرفیت ۸٫۷ لیتر؛ روغن DCT یا ATF نامشخص جایگزین آن نیست.",
    brakeFluidDescription: "روغن ترمز DOT 4 با حجم ۸۵۰±۱۰ میلی‌لیتر در جدول دفترچه ثبت شده است.",
    coolantDescription: "مایع خنک‌کننده ۵۰/۵۰ با ظرفیت ۱۰±۰٫۵ لیتر؛ از آب دارای املاح یا خنک‌کننده ناسازگار استفاده نشود.",
    hydraulicDescription: "فرمان T9 برقی است و روغن هیدرولیک فرمان در جدول روانکارهای این نسخه وجود ندارد.",
    compatibleViscosities: ["5W-30"],
    minimumApi: "SL",
  },
];

const API_RANK: Record<Exclude<KmcCarDefinition["minimumApi"], null>, number> & Record<"SP" | "SQ", number> = {
  SL: 1,
  SM: 2,
  SN: 3,
  SP: 4,
  SQ: 5,
};

function normalize(value: string | null | undefined) {
  return (value ?? "").toUpperCase().replace(/[\s_]+/g, "").replace(/–/g, "-");
}

function hasCompatibleApi(approvals: string | null, minimumApi: KmcCarDefinition["minimumApi"]) {
  if (!minimumApi) return false;
  const levels = normalize(approvals).match(/API(?:SL|SM|SN|SP|SQ)|\b(?:SL|SM|SN|SP|SQ)\b/g) ?? [];
  return levels.some((entry) => {
    const level = entry.replace("API", "") as keyof typeof API_RANK;
    return API_RANK[level] >= API_RANK[minimumApi];
  });
}

function withSource(text: string, car: KmcCarDefinition) {
  return `${text}\nمنبع: ${car.manualUrl}`;
}

function buildNotebookSections(car: KmcCarDefinition): NotebookSection[] {
  const source = { sourceTitle: car.manualTitle, sourceUrl: car.manualUrl };

  return [
    { categoryId: 2, id: "fuel-filter", title: "فیلتر بنزین", tag: "سوخت", ...source, description: "فیلتر و اتصالات مدار سوخت در سرویس‌های دوره‌ای از نظر نشتی و گرفتگی بررسی شوند و تعویض فقط با قطعه سازگار همان نسخه انجام شود." },
    { categoryId: 3, id: "gearbox-oil", title: "روغن گیربکس", tag: "گیربکس", ...source, description: car.gearboxOilDescription },
    { categoryId: 1, id: "engine-oil", title: "روغن موتور", tag: "روانکار", ...source, description: car.engineOilDescription },
    { categoryId: 4, id: "brake-fluid", title: "روغن ترمز", tag: "ترمز", ...source, description: car.brakeFluidDescription },
    { categoryId: 5, id: "oil-filter", title: "فیلتر روغن", tag: "فیلتر", ...source, description: "فیلتر روغن هم‌زمان با هر نوبت تعویض روغن موتور عوض شود و پس از روشن‌کردن موتور، نشتی و سطح روغن دوباره کنترل شود." },
    { categoryId: 6, id: "air-filter", title: "فیلتر هوا", tag: "فیلتر", ...source, description: "فیلتر هوای موتور در سرویس دوره‌ای بازدید شود؛ در گردوغبار و کارکرد سنگین بازه کنترل کوتاه‌تر باشد و فیلتر آسیب‌دیده یا گرفته تعویض شود." },
    { categoryId: 14, id: "cabin-filter", title: "فیلتر کابین", tag: "فیلتر", ...source, description: "فیلتر هوای کابین با افت جریان باد، بوی نامطبوع یا در سرویس دوره‌ای بررسی و با نمونه هم‌اندازه و سازگار تعویض شود." },
    { categoryId: 7, id: "antifreeze", title: "ضدیخ", tag: "خنک‌کاری", ...source, description: car.coolantDescription },
    { categoryId: 49, id: "octane", title: "اکتان", tag: "سوخت", ...source, description: "از بنزین بدون سرب و باکیفیت استفاده شود. مکمل اکتان جایگزین سوخت مناسب نیست و فقط محصول معتبر، با دوز صحیح و در صورت نیاز واقعی موتور توربو استفاده شود." },
    { categoryId: 33, id: "hydraulic-oil", title: "روغن هیدرولیک", tag: "هیدرولیک", ...source, description: car.hydraulicDescription },
  ];
}

async function main() {
  const engineOilProducts = await prisma.product.findMany({
    where: { category: { slug: "engine-oil" } },
    select: { id: true, slug: true, viscosity: true, approvals: true },
  });

  for (const car of KMC_CARS) {
    const recommendedProducts = engineOilProducts.filter((product) => {
      const viscosity = normalize(product.viscosity);
      const hasViscosity = car.compatibleViscosities.some((candidate) => viscosity.includes(normalize(candidate)));
      return hasViscosity && hasCompatibleApi(product.approvals, car.minimumApi);
    });
    const recommendedProductSlugs = recommendedProducts.map((product) => product.slug);

    const savedCar = await prisma.car.upsert({
      where: { slug: car.slug },
      update: {
        manufacturer: "کی ام سی",
        model: car.model,
        isActive: true,
        generation: car.generation,
        imageUrl: car.imageUrl,
        engineCode: car.engineCode,
        engineType: car.engineType,
        yearFrom: car.yearFrom,
        yearTo: car.yearTo,
        viscosity: car.viscosity,
        oilCapacityLit: car.oilCapacityLit,
        specification: car.specification,
        overviewDetails: withSource(car.overviewDetails, car),
        engineDetails: withSource(car.engineDetails, car),
        gearboxDetails: withSource(car.gearboxDetails, car),
        maintenanceInfo: withSource(car.maintenanceInfo, car),
        notebookSections: buildNotebookSections(car),
      },
      create: {
        slug: car.slug,
        manufacturer: "کی ام سی",
        model: car.model,
        isActive: true,
        generation: car.generation,
        imageUrl: car.imageUrl,
        engineCode: car.engineCode,
        engineType: car.engineType,
        yearFrom: car.yearFrom,
        yearTo: car.yearTo,
        viscosity: car.viscosity,
        oilCapacityLit: car.oilCapacityLit,
        specification: car.specification,
        overviewDetails: withSource(car.overviewDetails, car),
        engineDetails: withSource(car.engineDetails, car),
        gearboxDetails: withSource(car.gearboxDetails, car),
        maintenanceInfo: withSource(car.maintenanceInfo, car),
        notebookSections: buildNotebookSections(car),
      },
    });

    await prisma.carMaintenanceTask.upsert({
      where: { carId_title: { carId: savedCar.id, title: "تعویض روغن موتور و فیلتر روغن" } },
      update: {
        description: car.engineOilDescription,
        priority: 1,
        recommendedProductSlugs,
      },
      create: {
        carId: savedCar.id,
        title: "تعویض روغن موتور و فیلتر روغن",
        description: car.engineOilDescription,
        priority: 1,
        recommendedProductSlugs,
      },
    });

    await prisma.carMaintenanceTask.upsert({
      where: { carId_title: { carId: savedCar.id, title: "بازدید روغن گیربکس و انتقال قدرت" } },
      update: { description: car.gearboxOilDescription, priority: 2 },
      create: {
        carId: savedCar.id,
        title: "بازدید روغن گیربکس و انتقال قدرت",
        description: car.gearboxOilDescription,
        priority: 2,
      },
    });

    console.log(`Activated ${car.model}: ${recommendedProductSlugs.length} compatible engine-oil products linked.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
