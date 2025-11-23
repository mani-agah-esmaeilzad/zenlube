import { Prisma, PrismaClient, Role } from "../src/generated/prisma";
import type { QuestionStatus } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const customerPassword = await bcrypt.hash("Customer@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@oilbar.ir" },
    update: {
      phone: "+989121111111",
    },
    create: {
      email: "admin@oilbar.ir",
      name: "مدیر اویل‌بار",
      password: adminPassword,
      phone: "+989121111111",
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@oilbar.ir" },
    update: {
      phone: "+989122222222",
    },
    create: {
      email: "customer@oilbar.ir",
      name: "مشتری نمونه",
      password: customerPassword,
      phone: "+989122222222",
      role: Role.CUSTOMER,
    },
  });

  const categories = await prisma.$transaction(
    [
      {
        name: "روغن‌های تمام سنتتیک",
        slug: "full-synthetic",
        description: "کارایی بالا برای موتورهای مدرن و رانندگی پرشتاب.",
        imageUrl:
          "https://images.pexels.com/photos/1148385/pexels-photo-1148385.jpeg",
      },
      {
        name: "روغن‌های نیمه سنتتیک",
        slug: "semi-synthetic",
        description: "تعادل مناسب بین قیمت و حفاظت موتور.",
        imageUrl:
          "https://images.pexels.com/photos/3736391/pexels-photo-3736391.jpeg",
      },
      {
        name: "روغن‌های دیزلی",
        slug: "diesel",
        description: "طراحی شده برای گشتاور بالا و موتورهای دیزلی سنگین.",
        imageUrl:
          "https://images.pexels.com/photos/2752881/pexels-photo-2752881.jpeg",
      },
    ].map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      }),
    ),
  );

  const brands = await prisma.$transaction(
    [
      {
        name: "Mobil 1",
        slug: "mobil-1",
        description: "رهبری جهانی در فناوری روغن موتور.",
        website: "https://www.mobil.com/",
        imageUrl:
          "https://images.pexels.com/photos/3736435/pexels-photo-3736435.jpeg",
      },
      {
        name: "Castrol",
        slug: "castrol",
        description: "راهکارهای اختصاصی برای موتورهای پرتوان.",
        website: "https://www.castrol.com/",
        imageUrl:
          "https://images.pexels.com/photos/3736391/pexels-photo-3736391.jpeg",
      },
      {
        name: "Total Quartz",
        slug: "total-quartz",
        description: "حفاظت پایدار در شرایط سخت.",
        website: "https://www.totalenergies.com/",
        imageUrl:
          "https://images.pexels.com/photos/3736392/pexels-photo-3736392.jpeg",
      },
    ].map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand,
      }),
    ),
  );

  const carSeeds = [
    {
      slug: "bmw-3-series-f30-320i",
      manufacturer: "BMW",
      model: "3 Series F30",
      generation: "320i",
      engineType: "بنزینی توربو",
      engineCode: "N20B20",
      yearFrom: 2012,
      yearTo: 2018,
      oilCapacityLit: new Prisma.Decimal(5.0),
      viscosity: "5W-30",
      specification: "BMW Longlife-01",
      overviewDetails:
        "نسل ششم سری ۳ با کد F30 ترکیبی از رانندگی اسپرت و راحتی روزمره است. نسخه 320i برای موتورهای توربوشارژ چهار سیلندر بهینه شده و نیازمند دقت در انتخاب روغن و نگهداری است.",
      engineDetails:
        "موتور N20B20 به حجم 2.0 لیتر و توربوشارژ Twin-Scroll مجهز است. ظرفیت روغن همراه فیلتر 5 لیتر بوده و ویسکوزیته پیشنهادی BMW Longlife-01 با SAE 5W-30 است. دوره تعویض پیشنهادی حداکثر ۱۰ هزار کیلومتر یا ۱۲ ماه است.",
      gearboxDetails:
        "گیربکس ZF 8HP اتوماتیک هشت دنده از روغن مخصوص ZF Lifeguard 8 بهره می‌برد. برای سرویس دوره‌ای هر ۶۰ هزار کیلومتر روغن و فیلتر داخلی گیربکس بررسی شود.",
      maintenanceInfo:
        "بازدید سیستم خنک‌کننده هر ۳۰ هزار کیلومتر، بررسی واشر درپوش سوپاپ و شیلنگ‌های توربو به‌صورت دوره‌ای توصیه می‌شود. برای رانندگی شهری استفاده از سوخت باکیفیت و گرم کردن اولیه موتور اهمیت دارد.",
    },
    {
      slug: "toyota-corolla-e210",
      manufacturer: "Toyota",
      model: "Corolla",
      generation: "E210",
      engineType: "بنزینی تنفس طبیعی",
      engineCode: "2ZR-FE",
      yearFrom: 2019,
      yearTo: 2024,
      oilCapacityLit: new Prisma.Decimal(4.4),
      viscosity: "0W-20",
      specification: "API SP / ILSAC GF-6",
      overviewDetails:
        "کرولای نسل دوازدهم با اتکا به پلتفرم TNGA فضای اقتصادی و دوام بالایی ارائه می‌کند. دفترچه دیجیتال Oilbar اطلاعات حیاتی سرویس را برای استفاده در شهر و سفر فراهم کرده است.",
      engineDetails:
        "پیشرانه 2ZR-FE با سیستم Dual VVT-i ظرفیت روغن 4.4 لیتری دارد و استفاده از روغن 0W-20 با استاندارد API SP / ILSAC GF-6 توصیه شده است. فیلتر روغن در هر سرویس تعویض شود و فیلتر هوا هر ۲۰ هزار کیلومتر بررسی گردد.",
      gearboxDetails:
        "جعبه‌دنده CVT با کد K120 از سیال Toyota CVT FE استفاده می‌کند. بازدید سطح روغن هر ۴۰ هزار کیلومتر و تعویض کامل در بازه ۸۰-۱۰۰ هزار کیلومتر پیشنهادی است.",
      maintenanceInfo:
        "تنظیمات سیستم تعلیق و فرمان الکترونیکی هر ۳۰ هزار کیلومتر چک شود. شمع‌های ایریدیومی تا ۱۰۰ هزار کیلومتر عمر دارند اما در سوخت نامتقارن بهتر است زودتر بازدید شوند.",
    },
    {
      slug: "hyundai-santa-fe-tm",
      manufacturer: "Hyundai",
      model: "Santa Fe",
      generation: "TM",
      engineType: "بنزینی توربو",
      engineCode: "G4KH",
      yearFrom: 2021,
      yearTo: 2024,
      oilCapacityLit: new Prisma.Decimal(6.0),
      viscosity: "5W-30",
      specification: "Hyundai-Kia MS-5425",
      overviewDetails:
        "سانتافه TM نسل چهارم به عنوان شاسی‌بلند خانوادگی، نیازمند نگهداری منظم برای سیستم توربو و انتقال قدرت چهار چرخ است. این دفترچه اطلاعات حیاتی را به صورت صفحه‌بندی ارائه می‌کند.",
      engineDetails:
        "پیشرانه 2.5 لیتری توربو G4KH با تزریق مستقیم نیازمند روغن 5W-30 مطابق استاندارد Hyundai-Kia MS-5425 است. حجم روغن 6 لیتر و زمان‌بندی سرویس پیشنهادی هر ۷ تا ۸ هزار کیلومتر در شرایط سخت است.",
      gearboxDetails:
        "گیربکس 8 سرعته اتوماتیک با مبدل گشتاور از سیال ATF SP-IV RR استفاده می‌کند. بررسی سطح هر ۳۰ هزار کیلومتر و تعویض کامل در ۷۵ هزار کیلومتر توصیه می‌شود.",
      maintenanceInfo:
        "سیستم خنک‌کننده و اینترکولر هر ۲۰ هزار کیلومتر تمیز شوند. فیلتر بنزین در باک قرار دارد اما بهتر است در سرویس‌های ۶۰ هزار کیلومتر چک شود. پس از مسیرهای طولانی اجازه دهید توربو قبل از خاموشی خنک شود.",
    },
    {
      slug: "peugeot-208-puretech-130",
      manufacturer: "Peugeot",
      model: "208 GT Line",
      generation: "PureTech 130",
      engineType: "بنزینی توربو",
      engineCode: "EB2ADTS",
      yearFrom: 2020,
      yearTo: 2024,
      oilCapacityLit: new Prisma.Decimal(4.5),
      viscosity: "0W-30",
      specification: "PSA B71 2312",
      overviewDetails:
        "پژو 208 GT Line با موتور سه سیلندر توربو PureTech تمرکز بر وزن پایین و بهره‌وری بالا دارد. نگهداری دقیق روغن برای جلوگیری از رسوب توربو حیاتی است.",
      engineDetails:
        "حجم روغن موتور EB2ADTS برابر 4.5 لیتر است و روغن 0W-30 با تاییدیه PSA B71 2312 باید استفاده شود. شیرهای زمان‌بندی متغیر به روغن تمیز حساس هستند، بنابراین دوره سرویس ۷ هزار کیلومتر پیشنهاد می‌شود.",
      gearboxDetails:
        "گیربکس 8 سرعته اتوماتیک Aisin EAT8 از سیال AW-1 بهره می‌برد. سطح روغن هر ۳۰ هزار کیلومتر بررسی و تعویض کامل در ۹۰ هزار کیلومتر انجام شود.",
      maintenanceInfo:
        "مایع خنک‌کننده هر ۴ سال تعویض و سیستم ورودی هوا هر سرویس تمیز شود. برای حفظ شتاب مناسب، سیستم تزریق سوخت هر ۶۰ هزار کیلومتر با پاک‌کننده معتبر سرویس گردد.",
    },
  ];

  const cars = await prisma.$transaction(
    carSeeds.map((car) =>
      prisma.car.upsert({
        where: { slug: car.slug },
        update: {},
        create: car,
      }),
    ),
  );

  const productSeeds = [
    {
      name: "Mobil 1 ESP X3 0W-40",
      slug: "mobil-1-esp-x3-0w40",
      sku: "M1-ESPX3-0W40",
      description:
        "فرمولیشن نسل جدید برای موتورهای بنزینی و دیزلی پیشرفته با استانداردهای Euro 6d.",
      price: new Prisma.Decimal(2850000),
      stock: 30,
      viscosity: "0W-40",
      oilType: "تمام سنتتیک",
      imageUrl:
        "https://images.pexels.com/photos/6646854/pexels-photo-6646854.jpeg",
      categoryId: categories[0].id,
      brandId: brands[0].id,
      originCountry: "آمریکا",
      approvals: "ACEA C3, API SP, BMW LL-01",
      temperatureRange: "-40°C الی 240°C",
      packagingSizeLit: new Prisma.Decimal(4.0),
      warranty: "۲۰ هزار کیلومتر یا یک سال",
      isBestseller: true,
      tags: ["full-synthetic", "premium", "euro-6"],
      technicalSpecs: {
        baseOil: "Fully Synthetic",
        sulfatedAsh: "0.8%",
        hths: "3.6 mPa·s",
      },
      averageRating: new Prisma.Decimal(4.8),
      reviewCount: 124,
      videos: [
        "https://www.youtube.com/watch?v=NdW_i4_a7co",
      ],
    },
    {
      name: "Castrol Edge 5W-30 LL",
      slug: "castrol-edge-5w30-ll",
      sku: "CAST-EDGE-5W30LL",
      description:
        "روغن تمام سنتتیک با تکنولوژی Fluid TITANIUM برای حفاظت عالی در دورهای بالا.",
      price: new Prisma.Decimal(2350000),
      stock: 42,
      viscosity: "5W-30",
      oilType: "تمام سنتتیک",
      imageUrl:
        "https://images.pexels.com/photos/1148385/pexels-photo-1148385.jpeg",
      categoryId: categories[0].id,
      brandId: brands[1].id,
      originCountry: "انگلستان",
      approvals: "VW 504 00 / 507 00, MB 229.31",
      packagingSizeLit: new Prisma.Decimal(4.0),
      warranty: "۱۵ هزار کیلومتر",
      isBestseller: true,
      tags: ["turbo", "european", "longlife"],
      technicalSpecs: {
        baseOil: "Synthetic blend",
        viscosityIndex: 170,
        flashPoint: "230°C",
      },
      averageRating: new Prisma.Decimal(4.6),
      reviewCount: 98,
    },
    {
      name: "Total Quartz Ineo Efficiency 0W-30",
      slug: "total-quartz-ineo-efficiency-0w30",
      sku: "TOTAL-INEO-0W30",
      description:
        "طراحی شده برای استانداردهای سخت‌گیرانه PSA و سیستم‌های کاهش آلایندگی.",
      price: new Prisma.Decimal(2150000),
      stock: 25,
      viscosity: "0W-30",
      oilType: "تمام سنتتیک",
      imageUrl:
        "https://images.pexels.com/photos/3736391/pexels-photo-3736391.jpeg",
      categoryId: categories[0].id,
      brandId: brands[2].id,
      originCountry: "فرانسه",
      approvals: "PSA B71 2312, ACEA C2",
      packagingSizeLit: new Prisma.Decimal(5.0),
      tags: ["psa", "eco", "low-saps"],
      technicalSpecs: {
        lowSaps: true,
        fuelEconomyGain: "3.5%",
        noackVolatility: "10 %",
      },
      averageRating: new Prisma.Decimal(4.4),
      reviewCount: 54,
    },
    {
      name: "Mobil Delvac 1 5W-40",
      slug: "mobil-delvac-1-5w40",
      sku: "MOBIL-DELVAC1-5W40",
      description:
        "حفاظت استثنایی برای موتورهای دیزلی سنگین در شرایط کاری دشوار.",
      price: new Prisma.Decimal(2650000),
      stock: 18,
      viscosity: "5W-40",
      oilType: "دیزل سنتتیک",
      imageUrl:
        "https://images.pexels.com/photos/2752881/pexels-photo-2752881.jpeg",
      categoryId: categories[2].id,
      brandId: brands[0].id,
      originCountry: "آمریکا",
      approvals: "API CK-4, ACEA E9",
      packagingSizeLit: new Prisma.Decimal(5.0),
      tags: ["heavy-duty", "diesel", "fleet"],
      technicalSpecs: {
        tbn: "10.8 mg KOH/g",
        sootHandling: "Excellent",
        shearStability: "High",
      },
      averageRating: new Prisma.Decimal(4.7),
      reviewCount: 67,
    },
  ];

  const products = await prisma.$transaction(
    productSeeds.map((product) =>
      prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      }),
    ),
  );

  const carIdBySlug = Object.fromEntries(cars.map((car) => [car.slug, car.id]));
  const productIdBySlug = Object.fromEntries(products.map((product) => [product.slug, product.id]));

  const maintenanceTaskSeeds = [
    {
      carSlug: "bmw-3-series-f30-320i",
      title: "تعویض روغن موتور و فیلتر",
      description: "استفاده از روغن تایید شده BMW LL-01 و تعویض کامل فیلتر روغن به همراه چک سطح خنک‌کننده.",
      intervalKm: 10000,
      intervalMonths: 12,
      priority: 1,
      recommendedProductSlugs: ["mobil-1-esp-x3-0w40"],
    },
    {
      carSlug: "bmw-3-series-f30-320i",
      title: "سرویس گیربکس ZF",
      description: "بازدید از نشتی، تعویض فیلتر داخلی و شارژ مجدد روغن ZF Lifeguard8.",
      intervalKm: 60000,
      intervalMonths: 36,
      priority: 2,
      recommendedProductSlugs: [],
    },
    {
      carSlug: "toyota-corolla-e210",
      title: "سرویس دوره‌ای ۱۰ هزار کیلومتر",
      description: "تعویض روغن 0W-20، بررسی شمع‌ها و بازدید فیلتر کابین.",
      intervalKm: 10000,
      intervalMonths: 12,
      priority: 1,
      recommendedProductSlugs: ["mobil-1-esp-x3-0w40"],
    },
    {
      carSlug: "toyota-corolla-e210",
      title: "بازدید گیربکس CVT",
      description: "کنترل سطح سیال Toyota CVT FE و بررسی وضعیت تسمه و خنک‌کننده.",
      intervalKm: 40000,
      intervalMonths: 24,
      priority: 2,
      recommendedProductSlugs: [],
    },
    {
      carSlug: "hyundai-santa-fe-tm",
      title: "بازدید توربو و اینترکولر",
      description: "پاک‌سازی مسیر ورودی هوا و بررسی نشتی روغن توربین، همراه با تعویض فیلتر هوا.",
      intervalKm: 20000,
      intervalMonths: 12,
      priority: 2,
      recommendedProductSlugs: ["castrol-edge-5w30-ll"],
    },
    {
      carSlug: "peugeot-208-puretech-130",
      title: "سرویس PSA PureTech",
      description: "تعویض روغن 0W-30 تاییدیه PSA و بررسی سیستم تزریق سوخت.",
      intervalKm: 7000,
      intervalMonths: 9,
      priority: 1,
      recommendedProductSlugs: ["total-quartz-ineo-efficiency-0w30"],
    },
  ];

  await Promise.all(
    maintenanceTaskSeeds.map(async (task) => {
      const carId = carIdBySlug[task.carSlug];
      if (!carId) return;
      await prisma.carMaintenanceTask.upsert({
        where: {
          carId_title: {
            carId,
            title: task.title,
          },
        },
        update: {
          description: task.description,
          intervalKm: task.intervalKm ?? null,
          intervalMonths: task.intervalMonths ?? null,
          priority: task.priority,
          recommendedProductSlugs: task.recommendedProductSlugs,
        },
        create: {
          carId,
          title: task.title,
          description: task.description,
          intervalKm: task.intervalKm ?? null,
          intervalMonths: task.intervalMonths ?? null,
          priority: task.priority,
          recommendedProductSlugs: task.recommendedProductSlugs,
        },
      });
    }),
  );

  const productQuestionSeeds: Array<{
    productSlug: string;
    authorName: string;
    question: string;
    answer: string | null;
    status: QuestionStatus;
  }> = [
    {
      productSlug: "mobil-1-esp-x3-0w40",
      authorName: "علی رستگار",
      question: "آیا این روغن برای موتور N20 BMW مناسب است؟",
      answer: "بله، دارای تاییدیه BMW LL-01 است و مطابق جدول دفترچه 320i پیشنهاد می‌شود.",
      status: "ANSWERED",
    },
    {
      productSlug: "castrol-edge-5w30-ll",
      authorName: "مهدی تهرانی",
      question: "آیا می‌توان برای سانتافه توربو از این روغن استفاده کرد؟",
      answer: null,
      status: "PENDING",
    },
  ];

  await Promise.all(
    productQuestionSeeds.map(async (item) => {
      const productId = productIdBySlug[item.productSlug];
      if (!productId) return;
      await prisma.productQuestion.upsert({
        where: {
          productId_question: {
            productId,
            question: item.question,
          },
        },
        update: {
          answer: item.answer,
          status: item.status,
          answeredAt: item.answer ? new Date() : null,
        },
        create: {
          productId,
          authorName: item.authorName,
          question: item.question,
          answer: item.answer,
          status: item.status,
          answeredAt: item.answer ? new Date() : null,
        },
      });
    }),
  );

  const carQuestionSeeds: Array<{
    carSlug: string;
    authorName: string;
    question: string;
    answer: string | null;
    status: QuestionStatus;
  }> = [
    {
      carSlug: "bmw-3-series-f30-320i",
      authorName: "سپهر سامانی",
      question: "برای تعویض زودهنگام روغن در ترافیک تهران چه بازه‌ای پیشنهاد می‌کنید؟",
      answer: "در شرایط ترافیکی بهتر است هر ۷ تا ۸ هزار کیلومتر سرویس انجام شود.",
      status: "ANSWERED",
    },
    {
      carSlug: "toyota-corolla-e210",
      authorName: "زهرا موسوی",
      question: "آیا نیاز است گیربکس CVT را هر بار سرویس کامل کنیم؟",
      answer: null,
      status: "PENDING",
    },
  ];

  await Promise.all(
    carQuestionSeeds.map(async (item) => {
      const carId = carIdBySlug[item.carSlug];
      if (!carId) return;
      await prisma.carQuestion.upsert({
        where: {
          carId_question: {
            carId,
            question: item.question,
          },
        },
        update: {
          answer: item.answer,
          status: item.status,
          answeredAt: item.answer ? new Date() : null,
        },
        create: {
          carId,
          authorName: item.authorName,
          question: item.question,
          answer: item.answer,
          status: item.status,
          answeredAt: item.answer ? new Date() : null,
        },
      });
    }),
  );

  await prisma.engagementEvent.createMany({
    data: [
      {
        entityType: "car",
        entityId: carIdBySlug["bmw-3-series-f30-320i"] ?? "",
        eventType: "notebook_view",
        metadata: { source: "seed" },
      },
      {
        entityType: "car",
        entityId: carIdBySlug["toyota-corolla-e210"] ?? "",
        eventType: "notebook_view",
        metadata: { source: "seed" },
      },
      {
        entityType: "product",
        entityId: productIdBySlug["mobil-1-esp-x3-0w40"] ?? "",
        eventType: "comparison_add",
        metadata: { source: "seed" },
      },
    ].filter((event) => event.entityId),
  });

  const productCarRelations: Array<[string, string]> = [
    [products[0].id, cars[0].id],
    [products[0].id, cars[1].id],
    [products[1].id, cars[0].id],
    [products[1].id, cars[2].id],
    [products[2].id, cars[3].id],
    [products[3].id, cars[2].id],
  ];

  await prisma.$transaction(
    productCarRelations.map(([productId, carId]) =>
      prisma.productCar.upsert({
        where: {
          productId_carId: { productId, carId },
        },
        update: {},
        create: { productId, carId },
      }),
    ),
  );

  const reviewsData = [
    {
      productId: products[0].id,
      customerName: "آرش مرادی",
      rating: 5,
      comment:
        "پس از استفاده، صدای موتور کمتر شد و شتاب خودرو بهتر شد. کاملاً راضی هستم.",
    },
    {
      productId: products[1].id,
      customerName: "مهدی رضایی",
      rating: 4,
      comment:
        "برای BMW 320i استفاده کردم، کیفیت بسیار خوبی دارد فقط قیمت کمی بالاست.",
    },
    {
      productId: products[3].id,
      customerName: "شرکت حمل‌ونقل آریا",
      rating: 5,
      comment:
        "برای ناوگان کامیون‌ها استفاده کردیم و دوام عالی در سرویس‌های طولانی ارائه داد.",
    },
  ];

  await prisma.productReview.deleteMany();
  await prisma.productReview.createMany({
    data: reviewsData,
  });

  await prisma.marketingBanner.deleteMany({
    where: {
      position: {
        in: ["homepage-hero", "homepage-secondary"],
      },
    },
  });

  await prisma.marketingBanner.createMany({
    data: [
      {
        title: "روغن موتور مناسب هر مسیر",
        subtitle:
          "ارسال سریع به سراسر کشور، مشاوره تخصصی رایگان و ضمانت اصالت کالا.",
        ctaLabel: "مشاهده محصولات ویژه",
        ctaLink: "/products?featured=true",
        imageUrl:
          "https://images.pexels.com/photos/1409999/pexels-photo-1409999.jpeg",
        position: "homepage-hero",
        isActive: true,
      },
      {
        title: "بررسی روغن مناسب خودرو شما",
        subtitle: "با وارد کردن مدل خودرو محصولات پیشنهادی دقیق دریافت کنید.",
        ctaLabel: "ورود به لیست خودروها",
        ctaLink: "/cars",
        imageUrl:
          "https://images.pexels.com/photos/4489722/pexels-photo-4489722.jpeg",
        position: "homepage-secondary",
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const blogPosts = [
    {
      title: "۵ نکته طلایی برای انتخاب روغن موتور مناسب",
      slug: "choose-the-right-engine-oil",
      excerpt:
        "در این مقاله از پایه‌ای‌ترین موارد انتخاب روغن موتور صحبت می‌کنیم تا مطمئن شوید موتور خودرو همیشه در بهترین شرایط کار می‌کند.",
      content: `
### چرا انتخاب روغن موتور مهم است؟
روغن موتور نقشی کلیدی در کاهش اصطکاک و خنک‌کاری ایفا می‌کند. انتخاب اشتباه می‌تواند به فرسودگی زودهنگام قطعات منجر شود.

### ۱. استاندارد خودرو را بررسی کنید
همیشه دفترچه خودرو یا برچسب درب موتور را بررسی کنید. استانداردهایی مثل API، ACEA یا استانداردهای اختصاصی (BMW LL-01، VW 504/507 و ...) باید ملاک انتخاب باشند.

### ۲. شرایط آب و هوایی
اگر در مناطق بسیار گرم یا سرد زندگی می‌کنید، ویسکوزیته مناسب (مثلاً 0W-30 برای مناطق سرد) اهمیت دوچندان دارد.

### ۳. نوع رانندگی
رانندگی شهری با ترافیک بالا باعث می‌شود بهتر است از روغن‌های تمام سنتتیک با مقاومت حرارتی بالا استفاده کنید.

### ۴. فواصل سرویس
روغنی را انتخاب کنید که با برنامه سرویس شما هماهنگ باشد. محصولات LongLife برای فواصل طولانی مناسب هستند.

### ۵. کیفیت و اصالت
از فروشگاه‌های معتبر خرید کنید و به تاریخ ساخت و هولوگرام توجه کنید. روغن تقلبی دشمن موتور است.
`,
      coverImage:
        "https://images.pexels.com/photos/4489722/pexels-photo-4489722.jpeg",
      tags: ["راهنما", "نگهداری خودرو", "روغن موتور"],
      readMinutes: 6,
    },
    {
      title: "مقایسه روغن‌های 0W-20 و 5W-30؛ کدام برای شما مناسب‌تر است؟",
      slug: "0w20-vs-5w30",
      excerpt:
        "روغن‌های 0W-20 و 5W-30 در خودروهای مدرن بسیار رایج هستند. در این مقاله تفاوت‌های آن‌ها را بررسی می‌کنیم.",
      content: `
### معنا و مفهوم ویسکوزیته
اعداد 0W-20 یا 5W-30 میزان گرانروی روغن در دماهای مختلف را نشان می‌دهد. هرچه عدد اول کمتر باشد، روغن در دمای سرد روان‌تر است.

### مزیت‌های 0W-20
- استارت سریع در هوای سرد
- کاهش مصرف سوخت
- مناسب برای موتورهای هیبرید و الکترونیکی جدید

### مزیت‌های 5W-30
- پایداری بهتر در هوای گرم
- مناسب برای موتورهای قدیمی‌تر یا با کارکرد بالا
- محافظت بیشتر در دورهای بالا

انتخاب نهایی باید براساس توصیه سازنده خودرو باشد.
`,
      coverImage:
        "https://images.pexels.com/photos/1571783/pexels-photo-1571783.jpeg",
      tags: ["تکنولوژی", "ویسکوزیته", "سوخت"],
      readMinutes: 5,
    },
    {
      title: "راهنمای کامل نگهداری از موتور دیزلی در سفرهای طولانی",
      slug: "diesel-engine-maintenance",
      excerpt:
        "موتورهای دیزلی در سفرهای طولانی فشار زیادی را تحمل می‌کنند. با این راهکارها عمر موتور را افزایش دهید.",
      content: `
### قبل از سفر چه بررسی‌هایی انجام دهیم؟
- سطح روغن و وضعیت رنگ آن
- فیلتر روغن و فیلتر هوا
- وضعیت سیستم خنک‌کننده و مایع رادیاتور

### در طول سفر
دمای موتور را زیر نظر داشته باشید و در صورت افزایش دما، استراحت‌های کوتاه اضافه کنید.

### بعد از سفر
یک سرویس کامل انجام دهید، سطح روغن را بررسی کنید و در صورت تیره بودن یا کاهش، تعویض را در برنامه قرار دهید.
`,
      coverImage:
        "https://images.pexels.com/photos/4488630/pexels-photo-4488630.jpeg",
      tags: ["دیزل", "مسافرت", "نگهداری"],
      readMinutes: 7,
    },
  ];

  await Promise.all(
    blogPosts.map((post) =>
      prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          ...post,
        },
        create: post,
      }),
    ),
  );

  const galleryImages = [
    {
      title: "تعویض روغن در تعمیرگاه مدرن",
      description: "استفاده از تجهیزات استاندارد باعث حفظ سلامت موتور می‌شود.",
      imageUrl:
        "https://images.pexels.com/photos/4488630/pexels-photo-4488630.jpeg",
      link: "/support",
      orderIndex: 1,
    },
    {
      title: "ذخیره‌سازی اصولی روغن",
      description: "نگهداری در دمای کنترل‌شده و دور از نور مستقیم خورشید.",
      imageUrl:
        "https://images.pexels.com/photos/3736392/pexels-photo-3736392.jpeg",
      orderIndex: 2,
    },
    {
      title: "آماده‌سازی برای سفر جاده‌ای",
      description: "بررسی کامل روغن، فیلتر و مایعات قبل از سفرهای طولانی.",
      imageUrl:
        "https://images.pexels.com/photos/4489737/pexels-photo-4489737.jpeg",
      link: "/blog/diesel-engine-maintenance",
      orderIndex: 3,
    },
    {
      title: "بررسی تخصصی ویسکوزیته",
      description: "آزمایشگاه کنترل کیفیت روغن موتور پیش از عرضه به بازار.",
      imageUrl:
        "https://images.pexels.com/photos/3736435/pexels-photo-3736435.jpeg",
      orderIndex: 4,
    },
  ];

  await prisma.galleryImage.deleteMany();
  await prisma.galleryImage.createMany({ data: galleryImages });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
