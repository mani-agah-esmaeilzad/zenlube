import { catalogProduct, type CatalogCategorySlug, type CatalogProductSeed } from "./catalog-types";

type BrandInfo = { slug: string; name: string; website: string; origin: string };
type AccessoryDef = {
  title: string;
  latinName: string;
  slug: string;
  sku: string;
  productType: string;
  volumeLabel: string;
  packagingSizeLit?: number;
  approvals?: string;
  image: string;
  summary: string;
  source: string;
  category?: CatalogCategorySlug;
  specs?: Record<string, string>;
  tags?: string[];
};

const brands = {
  bareliz: {
    slug: "bareliz",
    name: "بارلیز",
    website: "https://petrosharlub.com",
    origin: "ایران",
  },
  woofer: {
    slug: "woofer",
    name: "ووفر",
    website: "https://wooferco.ir",
    origin: "ایران",
  },
  aidlube: {
    slug: "aidlube",
    name: "ایدلوب",
    website: "https://aidlube.de",
    origin: "ایران (با فناوری آلمان)",
  },
  persiaSign: {
    slug: "persia-sign",
    name: "پرشیا ساین",
    website: "https://persiamobility.com",
    origin: "آلمان (سفارش پرشیا خودرو)",
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

function accessory(brand: BrandInfo, item: AccessoryDef): CatalogProductSeed {
  return catalogProduct({
    brandSlug: brand.slug,
    brandName: brand.name,
    brandWebsite: brand.website,
    categorySlug: item.category ?? "accessories",
    title: item.title,
    latinName: item.latinName,
    volumeLabel: item.volumeLabel,
    slug: `${brand.slug}-${item.slug}`,
    sku: item.sku,
    summary: item.summary,
    productType: item.productType,
    imageUrl: item.image,
    approvals: item.approvals,
    packagingSizeLit: item.packagingSizeLit,
    originCountry: brand.origin,
    productSourceUrl: item.source,
    specifications: item.specs,
    tags: item.tags,
  });
}

const barelizAccessories = [
  accessory(brands.bareliz, {
    title: "تمیزکننده انژکتور بارلیز Thor",
    latinName: "Bareliz Thor Fuel Injector Cleaner",
    slug: "thor-injector-cleaner-300ml",
    sku: "BAR-ADD-THOR-300",
    productType: "مکمل تمیزکننده سیستم سوخت",
    volumeLabel: "حجم ۳۰۰ میلی‌لیتر",
    packagingSizeLit: 0.3,
    image: "/products/bareliz/injector-thor.png",
    summary:
      "مکمل Thor برای پاک‌کردن رسوبات انژکتور و مسیر سوخت، بهبود پاشش و کمک به کاهش ناک و بدکارکردن موتور بنزینی طراحی شده است.",
    source: "https://petrosharlub.com/product/48",
    specs: { "روش مصرف": "طبق دوز درج‌شده روی بسته در باک بنزین استفاده شود" },
  }),
  accessory(brands.bareliz, {
    title: "مایع شیشه‌شوی بارلیز",
    latinName: "Bareliz Rain Wiper Wash",
    slug: "rain-wiper-wash-1l",
    sku: "BAR-WASH-1L",
    productType: "مایع شیشه‌شوی",
    volumeLabel: "حجم ۱ لیتر",
    packagingSizeLit: 1,
    image: "/products/bareliz/windshield-wash.png",
    summary:
      "مایع شیشه‌شوی بارلیز برای زدودن چربی، گردوغبار و آلودگی جاده از شیشه جلو ساخته شده و با سامانه شیشه‌شوی خودرو مصرف می‌شود.",
    source: "https://petrosharlub.com/product/54",
  }),
  accessory(brands.bareliz, {
    title: "ضدیخ و ضدجوش بارلیز G12 قرمز",
    latinName: "Bareliz G12 Red Antifreeze Coolant",
    slug: "g12-red-antifreeze-1-5l",
    sku: "BAR-AF-G12-R-15",
    productType: "ضدیخ و ضدجوش",
    volumeLabel: "حجم ۱.۵ لیتر",
    packagingSizeLit: 1.5,
    approvals: "VW TL 774 D/F؛ ASTM D3306؛ BS 6580",
    image: "/products/bareliz/antifreeze-g12.png",
    summary:
      "ضدیخ قرمز G12 بر پایه اتیلن‌گلیکول و فناوری آلی برای حفاظت مدار خنک‌کاری در برابر یخ‌زدگی، جوش و خوردگی تولید شده است.",
    source: "https://petrosharlub.com/product/94",
    specs: { رنگ: "قرمز", فناوری: "OAT" },
  }),
  accessory(brands.bareliz, {
    title: "ضدیخ و ضدجوش بارلیز G11 سبز",
    latinName: "Bareliz G11 Green Antifreeze Coolant",
    slug: "g11-green-antifreeze-1-5l",
    sku: "BAR-AF-G11-G-15",
    productType: "ضدیخ و ضدجوش",
    volumeLabel: "حجم ۱.۵ لیتر",
    packagingSizeLit: 1.5,
    approvals: "VW TL 774 C؛ ASTM D3306/D4985؛ BS 6580",
    image: "/products/bareliz/antifreeze-g11.png",
    summary:
      "ضدیخ سبز G11 با فناوری معدنی برای خودروهایی که دفترچه آن‌ها همین کلاس را مشخص کرده، از رادیاتور و مسیر خنک‌کاری محافظت می‌کند.",
    source: "https://petrosharlub.com/product/93",
    specs: { رنگ: "سبز", فناوری: "IAT" },
  }),
  accessory(brands.bareliz, {
    title: "ضدیخ و ضدجوش بارلیز G12 آبی",
    latinName: "Bareliz G12 Plus Blue Antifreeze Coolant",
    slug: "g12-blue-antifreeze-1-5l",
    sku: "BAR-AF-G12-B-15",
    productType: "ضدیخ و ضدجوش",
    volumeLabel: "حجم ۱.۵ لیتر",
    packagingSizeLit: 1.5,
    approvals: "VW TL 774 F/G؛ ASTM D3306؛ رنگ محصول به‌تنهایی معیار سازگاری نیست",
    image: "/products/bareliz/antifreeze-g12-plus.png",
    summary:
      "نسخه آبی خانواده G12+ برای محافظت طولانی‌مدت مدار خنک‌کاری در برابر خوردگی و رسوب ساخته شده و نباید صرفاً بر اساس رنگ با سیال قبلی مخلوط شود.",
    source: "https://petrosharlub.com/product/95",
    specs: { رنگ: "آبی", فناوری: "OAT/Long Life" },
  }),
  accessory(brands.bareliz, {
    title: "ضدیخ سبز بارلیز",
    latinName: "Bareliz Green Antifreeze",
    slug: "green-antifreeze-1l",
    sku: "BAR-AF-GREEN-1L",
    productType: "ضدیخ و ضدجوش",
    volumeLabel: "حجم ۱ لیتر",
    packagingSizeLit: 1,
    approvals: "ASTM D3306؛ BS 6580؛ کلاس نهایی از روی برچسب بسته کنترل شود",
    image: "/products/bareliz/antifreeze-g11.png",
    summary:
      "ضدیخ سبز بارلیز برای تنظیم غلظت مدار خنک‌کاری و حفاظت فصلی در برابر یخ‌زدگی، جوش و خوردگی فلزات استفاده می‌شود.",
    source: "https://petrosharlub.com/product-category/anti-freeze/",
  }),
  accessory(brands.bareliz, {
    title: "کولانت آماده مصرف سبز بارلیز",
    latinName: "Bareliz Green Ready Mix Coolant",
    slug: "green-coolant-4l",
    sku: "BAR-COOL-GREEN-4L",
    productType: "مایع خنک‌کننده آماده مصرف",
    volumeLabel: "حجم ۴ لیتر",
    packagingSizeLit: 4,
    approvals: "Ready Mix؛ بدون نیاز به افزودن آب؛ استاندارد نهایی روی بسته کنترل شود",
    image: "/products/bareliz/antifreeze-g11.png",
    summary:
      "کولانت سبز آماده مصرف بارلیز با نسبت اختلاط کارخانه‌ای مستقیماً در مدار خنک‌کاری سازگار استفاده می‌شود و نباید با آب رقیق شود.",
    source: "https://petrosharlub.com/product-category/anti-freeze/",
  }),
];

const wooferAccessories = [
  accessory(brands.woofer, {
    title: "بنزین مسابقه‌ای ووفر C16",
    latinName: "Woofer C16 Racing Fuel",
    slug: "c16-racing-fuel-5l",
    sku: "WOO-C16-5L",
    productType: "سوخت/افزودنی اکتان مسابقه‌ای",
    volumeLabel: "حجم ۵ لیتر",
    packagingSizeLit: 5,
    image: "/products/woofer/c16.webp",
    summary:
      "Woofer C16 برای موتورهای توربو و مسابقه‌ای پرفشار عرضه می‌شود و نسبت ترکیب آن باید بر اساس تیون، سوخت پایه و جدول رسمی خودرو تعیین شود.",
    source: "https://wooferco.ir/product/بنزین-مسابقه-ای-ووفر-c16/",
    specs: { "کاربری اصلی": "خودروهای توربو/مسابقه‌ای", "نسبت اختلاط راهنما": "حدود ۴ تا ۱۰ درصد؛ وابسته به خودرو" },
  }),
  accessory(brands.woofer, {
    title: "بنزین مسابقه‌ای ووفر C45",
    latinName: "Woofer C45 Racing Fuel",
    slug: "c45-racing-fuel-5l",
    sku: "WOO-C45-5L",
    productType: "سوخت/افزودنی اکتان مسابقه‌ای",
    volumeLabel: "حجم ۵ لیتر",
    packagingSizeLit: 5,
    image: "/products/woofer/c45.webp",
    summary:
      "Woofer C45 برای موتورهای تنفس طبیعی و کاربرد پرفورمنس عرضه می‌شود و دوز مصرف باید با جدول رسمی و تنظیمات موتور تطبیق داده شود.",
    source: "https://wooferco.ir/product/بنزین-مسابقه-ای-ووفر-c45/",
    specs: { "کاربری اصلی": "خودروهای تنفس طبیعی/پرفورمنس", "نسبت اختلاط راهنما": "حدود ۴ تا ۱۰ درصد؛ وابسته به خودرو" },
  }),
];

const aidlubeAccessories = [
  accessory(brands.aidlube, {
    title: "ضدیخ و ضدجوش ایدلوب Cold Master قرمز",
    latinName: "AIDLUBE Cold Master Red Antifreeze",
    slug: "cold-master-red-antifreeze-1l",
    sku: "AID-CM-AF-R-1L",
    productType: "ضدیخ و ضدجوش",
    volumeLabel: "حجم ۱ لیتر",
    packagingSizeLit: 1,
    image: "/products/aidlube/cold-master-red-1l.jpg",
    summary:
      "Cold Master ایدلوب برای حفاظت چهارفصل مدار خنک‌کاری در برابر یخ‌زدگی، جوش، زنگ‌زدگی و خوردگی قطعات فلزی تولید شده است.",
    source: "https://www.ravanmotor.com/p/1377/",
    specs: { رنگ: "قرمز", "روش مصرف": "نسبت اختلاط و کلاس سیال روی بسته با دفترچه خودرو تطبیق داده شود" },
  }),
];

const persiaSignAccessories = [
  accessory(brands.persiaSign, {
    title: "اکتان بوستر پرشیا ساین Up to 5",
    latinName: "Persia Sign Up to 5 Octane Booster",
    slug: "up-to-5-octane-booster-450ml",
    sku: "PRS-OCT-5P-450",
    productType: "افزاینده اکتان و تمیزکننده سیستم سوخت",
    volumeLabel: "حجم ۴۵۰ میلی‌لیتر",
    packagingSizeLit: 0.45,
    image: "/products/persia-sign/up-to-5-450ml.webp",
    summary:
      "نسخه Up to 5 پرشیا ساین برای افزایش عدد اکتان تا پنج واحد و کمک به پاکیزگی انژکتور در موتورهای تنفس طبیعی، توربو و GDI معرفی شده است.",
    source:
      "https://www.tasnimnews.ir/fa/news/1405/04/22/3646586/پرشیا-خودرو-از-نسل-جدید-مکمل-سوخت-persia-sign-رونمایی-کرد",
    specs: {
      "حجم سوخت قابل تیمار": "تا حدود ۵۰ لیتر",
      ترکیبات: "فاقد سرب، فروسن و MMT طبق اعلام عرضه‌کننده",
      "سازگاری اعلام‌شده": "موتورهای تنفس طبیعی، توربو و تزریق مستقیم",
    },
  }),
];

const xadoAccessories: CatalogProductSeed[] = [
  accessory(brands.xado, {
    title: "احیاگر و نرم‌کننده فلز موتور زادو AMC Maximum",
    latinName: "XADO Atomic Metal Conditioner Maximum",
    slug: "amc-maximum-engine-225ml",
    sku: "XAD-AMC-MAX-225",
    productType: "مکمل احیاگر روغن موتور",
    volumeLabel: "حجم ۲۲۵ میلی‌لیتر",
    packagingSizeLit: 0.225,
    image: "/products/xado/amc-maximum-225ml.jpg",
    summary:
      "AMC Maximum مکمل روغن موتور برای کاهش اصطکاک، محافظت سطوح فلزی و کمک به بازسازی نواحی ساییده‌شده در موتورهای با کارکرد عادی تا بالا است.",
    source: "https://www.ravanmotor.com/p/1114/",
  }),
  accessory(brands.xado, {
    title: "احیاگر و نرم‌کننده فلز موتور زادو New Car",
    latinName: "XADO Atomic Metal Conditioner New Car",
    slug: "amc-new-car-225ml",
    sku: "XAD-AMC-NEW-225",
    productType: "مکمل محافظ روغن موتور",
    volumeLabel: "حجم ۲۲۵ میلی‌لیتر",
    packagingSizeLit: 0.225,
    image: "/products/xado/amc-new-car-225ml.jpg",
    summary:
      "AMC New Car برای پیشگیری از سایش در موتورهای نو یا کم‌کارکرد طراحی شده و با کاهش اصطکاک به حفظ سطح فلزی کمک می‌کند.",
    source: "https://www.ravanmotor.com/p/1084/",
  }),
  accessory(brands.xado, {
    title: "احیاگر و نرم‌کننده فلز موتور زادو SUV",
    latinName: "XADO Atomic Metal Conditioner SUV",
    slug: "amc-suv-360ml",
    sku: "XAD-AMC-SUV-360",
    productType: "مکمل احیاگر روغن موتور",
    volumeLabel: "حجم ۳۶۰ میلی‌لیتر",
    packagingSizeLit: 0.36,
    image: "/products/xado/amc-suv-360ml.jpg",
    summary:
      "AMC SUV برای حجم روغن و بار کاری بیشتر خودروهای شاسی‌بلند فرموله شده و حفاظت اصطکاکی و احیای سطوح فلزی را هدف می‌گیرد.",
    source: "https://www.ravanmotor.com/p/1089/",
  }),
  accessory(brands.xado, {
    title: "احیاگر گیربکس اتوماتیک زادو AMC",
    latinName: "XADO Atomic Metal Conditioner Automatic Transmission",
    slug: "amc-automatic-transmission-30ml",
    sku: "XAD-AMC-AT-30",
    productType: "مکمل احیاگر گیربکس اتوماتیک",
    volumeLabel: "حجم ۳۰ میلی‌لیتر",
    packagingSizeLit: 0.03,
    image: "/products/xado/amc-at-30ml.jpg",
    summary:
      "AMC گیربکس اتوماتیک مکمل روغن برای کاهش اصطکاک و کمک به محافظت مجموعه هیدرولیک و چرخ‌دنده است و جایگزین روغن استاندارد گیربکس نیست.",
    source: "https://www.ravanmotor.com/p/1088/",
  }),
  accessory(brands.xado, {
    title: "احیاگر گیربکس اتوماتیک زادو EX120",
    latinName: "XADO EX120 Automatic Transmission Revitalizant",
    slug: "ex120-automatic-transmission-8ml",
    sku: "XAD-EX120-AT-8",
    productType: "احیاگر گیربکس اتوماتیک",
    volumeLabel: "حجم ۸ میلی‌لیتر",
    packagingSizeLit: 0.008,
    image: "/products/xado/ex120-at-8ml.jpg",
    summary:
      "EX120 اتوماتیک در تیوب کوچک برای افزودن به روغن گیربکس اتوماتیک طراحی شده و هدف آن کاهش سایش و صدای ناشی از اصطکاک است.",
    source: "https://www.ravanmotor.com/p/1789/",
  }),
  accessory(brands.xado, {
    title: "احیاگر سیستم هیدرولیک فرمان زادو EX120",
    latinName: "XADO EX120 Power Steering Revitalizant",
    slug: "ex120-power-steering-8ml",
    sku: "XAD-EX120-PS-8",
    productType: "احیاگر هیدرولیک فرمان",
    volumeLabel: "حجم ۸ میلی‌لیتر",
    packagingSizeLit: 0.008,
    image: "/products/xado/ex120-power-steering-8ml.jpg",
    summary:
      "EX120 هیدرولیک فرمان برای کمک به کاهش سایش، صدا و نشتی‌های جزئی ناشی از آب‌بندی در پمپ و مجموعه فرمان هیدرولیک عرضه می‌شود.",
    source: "https://www.ravanmotor.com/p/1085/",
  }),
  accessory(brands.xado, {
    title: "تمیزکننده انژکتور سرنگی زادو",
    latinName: "XADO Fuel Injector Cleaner Syringe",
    slug: "injector-cleaner-syringe-8ml",
    sku: "XAD-INJ-SYR-8",
    productType: "مکمل تمیزکننده انژکتور",
    volumeLabel: "حجم ۸ میلی‌لیتر",
    packagingSizeLit: 0.008,
    image: "/products/xado/injector-syringe-8ml.jpg",
    summary:
      "تمیزکننده سرنگی زادو برای افزودن به باک و پاک‌سازی رسوبات نازل انژکتور و مسیر سوخت در حجم تعیین‌شده روی بسته طراحی شده است.",
    source: "https://www.ravanmotor.com/p/1639/",
  }),
  accessory(brands.xado, {
    title: "تقویت‌کننده گیربکس اتوماتیک زادو Verylube",
    latinName: "XADO Verylube Automatic Transmission Treatment",
    slug: "verylube-auto-transmission-spray-150ml",
    sku: "XAD-VL-AT-150",
    productType: "مکمل روغن گیربکس اتوماتیک",
    volumeLabel: "حجم ۱۵۰ میلی‌لیتر",
    packagingSizeLit: 0.15,
    image: "/products/xado/verylube-mt-150ml.jpg",
    summary:
      "مکمل Verylube اتوماتیک برای کاهش اصطکاک و بهبود نرمی تعویض دنده طراحی شده و تنها همراه روغن صحیح همان گیربکس استفاده می‌شود.",
    source: "https://xado.com/",
  }),
  accessory(brands.xado, {
    title: "تقویت‌کننده گیربکس دستی زادو Verylube",
    latinName: "XADO Verylube Manual Transmission Treatment",
    slug: "verylube-manual-transmission-spray-150ml",
    sku: "XAD-VL-MT-150",
    productType: "مکمل روغن گیربکس دستی",
    volumeLabel: "حجم ۱۵۰ میلی‌لیتر",
    packagingSizeLit: 0.15,
    image: "/products/xado/verylube-mt-150ml.jpg",
    summary:
      "مکمل Verylube دستی به روغن گیربکس افزوده می‌شود تا اصطکاک، صدای کارکرد و سایش چرخ‌دنده‌ها را کاهش دهد.",
    source: "https://www.ravanmotor.com/p/1113/",
  }),
  accessory(brands.xado, {
    title: "احیاگر گیربکس دستی زادو AMC",
    latinName: "XADO Atomic Metal Conditioner Manual Transmission",
    slug: "amc-manual-transmission-30ml",
    sku: "XAD-AMC-MT-30",
    productType: "احیاگر گیربکس دستی",
    volumeLabel: "حجم ۳۰ میلی‌لیتر",
    packagingSizeLit: 0.03,
    image: "/products/xado/amc-mt-30ml.jpg",
    summary:
      "AMC گیربکس دستی برای محافظت سطح چرخ‌دنده، کاهش اصطکاک و کمک به نرمی کارکرد جعبه‌دنده استفاده می‌شود و مکمل روغن استاندارد است.",
    source: "https://www.ravanmotor.com/p/1086/",
  }),
  accessory(brands.xado, {
    title: "مکمل روغن موتور توربو زادو",
    latinName: "XADO Turbo Engine Oil Treatment",
    slug: "turbo-treatment-125ml",
    sku: "XAD-TURBO-125",
    productType: "مکمل محافظ موتور توربو",
    volumeLabel: "حجم ۱۲۵ میلی‌لیتر",
    packagingSizeLit: 0.125,
    image: "/products/xado/turbo-125ml.jpg",
    summary:
      "مکمل Turbo زادو برای موتورهای توربوشارژ طراحی شده و هدف آن کاهش سایش یاتاقان توربو و پایداری روانکاری در حرارت بالا است.",
    source: "https://www.ravanmotor.com/p/1093/",
  }),
  accessory(brands.xado, {
    title: "روغن ترمز زادو DOT 4",
    latinName: "XADO DOT 4 Brake Fluid",
    slug: "dot4-brake-fluid-500ml",
    sku: "XAD-BF-DOT4-500",
    productType: "روغن ترمز",
    volumeLabel: "حجم ۵۰۰ میلی‌لیتر",
    packagingSizeLit: 0.5,
    approvals: "DOT 4؛ سطح دقیق ISO/SAE روی بسته کنترل شود",
    image: "/products/xado/dot4-500ml.jpg",
    summary:
      "روغن ترمز DOT 4 زادو برای سامانه ترمز هیدرولیک دارای الزام DOT 4 عرضه می‌شود و باید از جذب رطوبت و آلودگی دور نگه داشته شود.",
    source: "https://www.ravanmotor.com/p/1584/",
    category: "brake-oil",
  }),
  accessory(brands.xado, {
    title: "موتورشوی زادو Total Flush",
    latinName: "XADO Total Flush Motor Cleaner",
    slug: "total-flush-motor-cleaner-250ml",
    sku: "XAD-TF-250",
    productType: "شوینده داخل موتور پیش از تعویض روغن",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/total-flush-250ml.jpg",
    summary:
      "Total Flush پیش از تخلیه روغن کهنه برای حل‌کردن لجن و رسوبات داخلی موتور استفاده می‌شود و نباید پس از سرویس در موتور باقی بماند.",
    source: "https://www.ravanmotor.com/p/1068/",
  }),
  accessory(brands.xado, {
    title: "روغن هیدرولیک سبز زادو LHM",
    latinName: "XADO Atomic Oil LHM",
    slug: "atomic-oil-lhm-1l",
    sku: "XAD-LHM-1L",
    productType: "مایع هیدرولیک معدنی",
    volumeLabel: "حجم ۱ لیتر",
    packagingSizeLit: 1,
    approvals: "ISO 7308؛ PSA B71 2710",
    image: "/products/xado/lhm-1l.jpg",
    summary:
      "Atomic Oil LHM مایع هیدرولیک سبز برای خودروهای دارای الزام LHM و سامانه‌های مشخص تعلیق، ترمز یا فرمان است و با DOT مخلوط نمی‌شود.",
    source: "https://xado.com/",
    specs: { "کد محصول": "XA 20216", رنگ: "سبز" },
  }),
  accessory(brands.xado, {
    title: "موتورشوی ملایم زادو Vita Flush",
    latinName: "XADO VitaFlush",
    slug: "vita-flush-250ml",
    sku: "XAD-VF-250",
    productType: "شوینده داخل موتور",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/vita-flush-250ml.jpg",
    summary:
      "VitaFlush شوینده ملایم سیستم روغن‌کاری است که پیش از تعویض روغن برای پاک‌سازی تدریجی رسوبات و آماده‌سازی موتور استفاده می‌شود.",
    source: "https://www.ravanmotor.com/p/1107/",
  }),
  accessory(brands.xado, {
    title: "موتورشوی زادو Verylube Absolut",
    latinName: "XADO Verylube Absolut Engine Flush",
    slug: "verylube-absolut-engine-flush-250ml",
    sku: "XAD-ABS-250",
    productType: "شوینده داخل موتور پیش از تعویض روغن",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/absolut-flush-250ml.jpg",
    summary:
      "Verylube Absolut برای شست‌وشوی رسوبات سیستم روغن‌کاری پیش از سرویس طراحی شده و باید طبق زمان کارکرد روی بسته سپس کاملاً تخلیه شود.",
    source: "https://xado.com/",
  }),
  accessory(brands.xado, {
    title: "گریس کالیپر ترمز زادو",
    latinName: "XADO Brake Caliper Grease",
    slug: "brake-caliper-grease-10ml",
    sku: "XAD-CAL-GR-10",
    productType: "گریس تخصصی کالیپر",
    volumeLabel: "حجم ۱۰ میلی‌لیتر",
    packagingSizeLit: 0.01,
    image: "/products/xado/caliper-grease-10ml.jpg",
    summary:
      "گریس تخصصی کالیپر زادو برای پین‌ها و نقاط مجاز مکانیزم ترمز است؛ نباید روی سطح اصطکاکی دیسک یا لنت استفاده شود.",
    source: "https://xado.us/products/brake-caliper-grease",
    specs: { "کد محصول": "XA 40119" },
  }),
  accessory(brands.xado, {
    title: "اسپری انژکتورشوی زادو Verylube",
    latinName: "XADO Verylube Injector and Carburetor Cleaner Spray",
    slug: "injector-cleaner-spray-320ml",
    sku: "XAD-INJ-SP-320",
    productType: "اسپری تمیزکننده انژکتور و دریچه گاز",
    volumeLabel: "حجم ۳۲۰ میلی‌لیتر",
    packagingSizeLit: 0.32,
    image: "/products/xado/injector-spray-320ml.jpg",
    summary:
      "اسپری Verylube برای پاک‌کردن آلودگی انژکتور، کاربراتور و مسیر هوای مجاز طراحی شده و روش اعمال مستقیم آن باید دقیقاً طبق برچسب باشد.",
    source: "https://xado.com/",
    specs: { "کد محصول": "XB 40009" },
  }),
  accessory(brands.xado, {
    title: "اکتان بوستر زادو F8",
    latinName: "XADO Octane Booster F8",
    slug: "octane-booster-f8-250ml",
    sku: "XAD-OCT-F8-250",
    productType: "افزاینده اکتان",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/octane-f8-250ml.jpg",
    summary:
      "Octane Booster F8 برای افزایش مقاومت بنزین در برابر ناک و بهبود احتراق عرضه می‌شود و دوز آن باید با حجم باک و کیفیت سوخت تنظیم شود.",
    source: "https://www.ravanmotor.com/p/1065/",
  }),
  accessory(brands.xado, {
    title: "اکتان بوستر زادو Verylube",
    latinName: "XADO Verylube Octane Booster",
    slug: "verylube-octane-booster-250ml",
    sku: "XAD-OCT-VL-250",
    productType: "افزاینده اکتان",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/octane-booster-250ml.jpg",
    summary:
      "Verylube Octane Booster برای کاهش ناک ناشی از بنزین کم‌اکتان و کمک به احتراق پایدار استفاده می‌شود و جایگزین سوخت استاندارد نیست.",
    source: "https://www.ravanmotor.com/p/1272/",
  }),
  accessory(brands.xado, {
    title: "مکمل سوخت زادو Energy Drive",
    latinName: "XADO AtomEX Energy Drive",
    slug: "atomex-energy-drive-250ml",
    sku: "XAD-ED-250",
    productType: "مکمل بهبود احتراق سوخت",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/energy-drive-250ml.jpg",
    summary:
      "AtomEX Energy Drive برای پاکیزگی مسیر سوخت، بهبود احتراق و پاسخ موتور طراحی شده و طبق دوز سازنده در باک بنزین افزوده می‌شود.",
    source: "https://www.ravanmotor.com/p/1066/",
  }),
  accessory(brands.xado, {
    title: "انژکتورشوی زادو AtomEX Multi Cleaner",
    latinName: "XADO AtomEX Multi Cleaner",
    slug: "atomex-multi-cleaner-250ml",
    sku: "XAD-MC-250",
    productType: "تمیزکننده چندمنظوره سیستم سوخت",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/multi-cleaner-250ml.jpg",
    summary:
      "AtomEX Multi Cleaner برای پاک‌سازی انژکتور، سوپاپ و محفظه احتراق از رسوبات سوختی طراحی شده و به باک بنزین افزوده می‌شود.",
    source: "https://www.ravanmotor.com/p/1067/",
  }),
  accessory(brands.xado, {
    title: "انژکتورشوی زادو Maxi Flush",
    latinName: "XADO MaxiFlush Fuel System Cleaner",
    slug: "maxi-flush-fuel-cleaner-250ml",
    sku: "XAD-MF-250",
    productType: "شوینده سیستم سوخت",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/maxi-flush-250ml.jpg",
    summary:
      "MaxiFlush شوینده قوی مسیر سوخت و انژکتور است و برای رفع رسوبات پایدار طبق چرخه مصرف اعلام‌شده توسط سازنده استفاده می‌شود.",
    source: "https://www.ravanmotor.com/p/1111/",
  }),
  accessory(brands.xado, {
    title: "مکمل بهینه‌ساز سوخت زادو 5 in 1",
    latinName: "XADO Verylube 5 in 1 Fuel Treatment",
    slug: "verylube-5-in-1-fuel-treatment-250ml",
    sku: "XAD-5IN1-250",
    productType: "مکمل چندمنظوره سوخت",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/5-in-1-250ml.jpg",
    summary:
      "Verylube 5 in 1 مکمل چندمنظوره برای پاکیزگی سیستم سوخت، کاهش رسوب، بهبود احتراق و کمک به کنترل رطوبت باک است.",
    source: "https://www.ravanmotor.com/p/1273/",
  }),
  accessory(brands.xado, {
    title: "تمیزکننده قرمز سیستم سوخت زادو",
    latinName: "XADO Red Fuel System Cleaner",
    slug: "red-fuel-system-cleaner-250ml",
    sku: "XAD-RED-250",
    productType: "شوینده سیستم سوخت",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/red-cleaner-250ml.jpg",
    summary:
      "Red Cleaner برای پاک‌سازی رسوبات انژکتور و مسیر سوخت بنزینی عرضه می‌شود و باید مطابق حجم باک و دوز روی بطری مصرف شود.",
    source: "https://www.ravanmotor.com/p/1868/",
  }),
  accessory(brands.xado, {
    title: "شوینده کاتالیست زادو Verylube",
    latinName: "XADO Verylube Catalytic Converter Cleaner",
    slug: "catalyst-cleaner-250ml",
    sku: "XAD-CAT-250",
    productType: "شوینده کاتالیست و سیستم سوخت",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    image: "/products/xado/catalyst-cleaner-250ml.jpg",
    summary:
      "شوینده کاتالیست Verylube برای کمک به کاهش رسوبات حاصل از احتراق در مسیر سوخت و مبدل کاتالیستی طراحی شده و تعمیر مکانیکی نیست.",
    source: "https://www.ravanmotor.com/p/1274/",
  }),
];

const zicAccessories = [
  accessory(brands.zic, {
    title: "گریس چندمنظوره زیک Royal Grease EP 2",
    latinName: "ZIC Royal Grease EP 2",
    slug: "royal-grease-ep2-1kg",
    sku: "ZIC-GR-EP2-1KG",
    productType: "گریس لیتیومی چندمنظوره",
    volumeLabel: "وزن ۱ کیلوگرم",
    approvals: "NLGI 2؛ Extreme Pressure؛ بسته‌بندی بازار ایران پیش از تحویل کنترل شود",
    image: "/products/zic/royal-grease.jpg",
    summary:
      "Royal Grease EP 2 گریس چندمنظوره فشارپذیر برای یاتاقان و نقاط روانکاری صنعتی یا خودرویی مجاز است و نباید برای قطعات حساس بدون تطبیق استفاده شود.",
    source:
      "https://www.skzic.com/eng/productmanage/info/product/list.do?menu_idx=170&sCtgryCode=CA0000000016",
  }),
];

const caspianAccessories = [
  accessory(brands.caspian, {
    title: "آب باتری دیونیزه کاسپین",
    latinName: "Caspian Deionized Battery Water",
    slug: "deionized-battery-water-1l",
    sku: "CAS-WATER-BAT-1L",
    productType: "آب دیونیزه",
    volumeLabel: "حجم ۱ لیتر",
    packagingSizeLit: 1,
    image: "/products/caspian/deionized-water.jpg",
    summary:
      "آب دیونیزه کاسپین فاقد املاح مزاحم برای باتری‌های اسیدی قابل سرویس است و نباید به باتری‌های سیلد یا بدون نیاز به نگهداری افزوده شود.",
    source: "https://caspian.com/product/آب-رادیاتور-دیونیزه/",
  }),
  accessory(brands.caspian, {
    title: "آب رادیاتور دیونیزه کاسپین",
    latinName: "Caspian Deionized Radiator Water",
    slug: "deionized-radiator-water-1l",
    sku: "CAS-WATER-RAD-1L",
    productType: "آب دیونیزه مدار خنک‌کاری",
    volumeLabel: "حجم ۱ لیتر",
    packagingSizeLit: 1,
    image: "/products/caspian/deionized-water.jpg",
    summary:
      "آب رادیاتور دیونیزه کاسپین برای اختلاط با ضدیخ غلیظ یا کاربردهای مجاز سرویس خودرو است و به‌تنهایی جایگزین کولانت کامل نیست.",
    source: "https://caspian.com/product/آب-رادیاتور-دیونیزه/",
  }),
  accessory(brands.caspian, {
    title: "روغن ترمز آبی کاسپین Sepand DOT 4",
    latinName: "Caspian Sepand DOT 4 Brake Fluid",
    slug: "sepand-dot4-blue-250ml",
    sku: "CAS-BF-DOT4-250",
    productType: "روغن ترمز",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    approvals: "DOT 4؛ INSO 363؛ ISO 4925؛ SAE J1703؛ FMVSS 116",
    image: "/products/caspian/brake-dot4.png",
    summary:
      "روغن ترمز Sepand DOT 4 برای سامانه‌های هیدرولیک دارای الزام DOT 4 است و نقطه جوش خشک و مرطوب کنترل‌شده دارد.",
    source: "https://caspian.com/product/مایع-ترمز-سپند-dot4/",
    category: "brake-oil",
    specs: { رنگ: "آبی", "نقطه جوش خشک": "حداقل 250°C", "نقطه جوش مرطوب": "حداقل 160°C" },
  }),
  accessory(brands.caspian, {
    title: "روغن ترمز زرد کاسپین Sepehr DOT 3",
    latinName: "Caspian Sepehr DOT 3 Brake Fluid",
    slug: "sepehr-dot3-yellow-250ml",
    sku: "CAS-BF-DOT3-250",
    productType: "روغن ترمز",
    volumeLabel: "حجم ۲۵۰ میلی‌لیتر",
    packagingSizeLit: 0.25,
    approvals: "DOT 3؛ INSO 363؛ ISO 4925؛ SAE J1703؛ FMVSS 116",
    image: "/products/caspian/brake-dot3.png",
    summary:
      "روغن ترمز Sepehr DOT 3 برای خودروهایی است که دفترچه آن‌ها DOT 3 را مشخص کرده و نباید با روغن‌های معدنی یا آلودگی مخلوط شود.",
    source: "https://caspian.com/product/مایع-ترمز-سپهر/",
    category: "brake-oil",
    specs: { رنگ: "زرد", "نقطه جوش خشک": "حداقل 240°C", "نقطه جوش مرطوب": "حداقل 150°C" },
  }),
  accessory(brands.caspian, {
    title: "مایع شیشه‌شوی کاسپین",
    latinName: "Caspian Windshield Washer Fluid",
    slug: "windshield-wash-1l",
    sku: "CAS-WASH-1L",
    productType: "مایع شیشه‌شوی",
    volumeLabel: "حجم ۱ لیتر",
    packagingSizeLit: 1,
    image: "/products/caspian/windshield-wash.jpg",
    summary:
      "مایع شیشه‌شوی کاسپین برای تمیزکردن چربی، دوده و آلودگی جاده از شیشه خودرو و استفاده در مخزن شیشه‌شوی تولید شده است.",
    source: "https://caspian.com/product/مایع-شیشه-شور/",
  }),
  accessory(brands.caspian, {
    title: "مایع شیشه‌شوی کاسپین",
    latinName: "Caspian Windshield Washer Fluid",
    slug: "windshield-wash-4l",
    sku: "CAS-WASH-4L",
    productType: "مایع شیشه‌شوی",
    volumeLabel: "حجم ۴ لیتر",
    packagingSizeLit: 4,
    image: "/products/caspian/windshield-wash.jpg",
    summary:
      "مایع شیشه‌شوی کاسپین برای تمیزکردن چربی، دوده و آلودگی جاده از شیشه خودرو و استفاده در مخزن شیشه‌شوی تولید شده است.",
    source: "https://caspian.com/product/مایع-شیشه-شور/",
  }),
  accessory(brands.caspian, {
    title: "کولانت آماده مصرف کاسپین",
    latinName: "Caspian Ready to Use Coolant",
    slug: "ready-coolant-4l",
    sku: "CAS-COOL-4L",
    productType: "مایع خنک‌کننده آماده مصرف",
    volumeLabel: "حجم اسمی ۴ لیتر",
    packagingSizeLit: 4,
    approvals: "OAT؛ INSO 338؛ آماده مصرف",
    image: "/products/caspian/coolant.jpg",
    summary:
      "کولانت کاسپین با فناوری OAT به‌صورت آماده مصرف برای حفاظت چهارفصل مدار خنک‌کاری از یخ‌زدگی، جوش و خوردگی عرضه می‌شود.",
    source: "https://caspian.com/en/product/coolant/",
    specs: { "حجم رسمی نزدیک": "۳.۷۲ لیتر", "بازه عملکرد اعلام‌شده": "حدود ‎-37°C تا +112°C" },
  }),
  accessory(brands.caspian, {
    title: "ضدیخ سوپر چهارفصل کاسپین",
    latinName: "Caspian Super Four Season Antifreeze",
    slug: "super-antifreeze-1l",
    sku: "CAS-AF-SUP-1L",
    productType: "ضدیخ و ضدجوش غلیظ",
    volumeLabel: "حجم اسمی ۱ لیتر",
    packagingSizeLit: 1,
    approvals: "OAT؛ INSO 338؛ کنسانتره",
    image: "/products/caspian/super-antifreeze.jpg",
    summary:
      "ضدیخ سوپر کاسپین کنسانتره OAT برای اختلاط با آب دیونیزه و حفاظت طولانی مدار خنک‌کاری از خوردگی، یخ‌زدگی و جوش است.",
    source: "https://caspian.com/product/ضدیخ-سوپر-چهارفصل/",
    specs: { "حجم رسمی نزدیک": "۰.۹ لیتر", "بازه عملکرد مخلوط استاندارد": "حدود ‎-37°C تا +112°C" },
  }),
  accessory(brands.caspian, {
    title: "ضدیخ سوپر چهارفصل کاسپین",
    latinName: "Caspian Super Four Season Antifreeze",
    slug: "super-antifreeze-2l",
    sku: "CAS-AF-SUP-2L",
    productType: "ضدیخ و ضدجوش غلیظ",
    volumeLabel: "حجم اسمی ۲ لیتر",
    packagingSizeLit: 2,
    approvals: "OAT؛ INSO 338؛ کنسانتره",
    image: "/products/caspian/super-antifreeze.jpg",
    summary:
      "ضدیخ سوپر کاسپین کنسانتره OAT برای اختلاط با آب دیونیزه و حفاظت طولانی مدار خنک‌کاری از خوردگی، یخ‌زدگی و جوش است.",
    source: "https://caspian.com/product/ضدیخ-سوپر-چهارفصل/",
    specs: { "حجم رسمی نزدیک": "۱.۸ لیتر", "بازه عملکرد مخلوط استاندارد": "حدود ‎-37°C تا +112°C" },
  }),
];

export const extendedAccessories: CatalogProductSeed[] = [
  ...barelizAccessories,
  ...wooferAccessories,
  ...aidlubeAccessories,
  ...persiaSignAccessories,
  ...xadoAccessories,
  ...zicAccessories,
  ...caspianAccessories,
];
