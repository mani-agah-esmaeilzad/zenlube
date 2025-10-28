import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCard } from "@/components/catalog/car-card";
import { CarNotebook } from "@/components/catalog/car-notebook";
import { ProductCard } from "@/components/product/product-card";
import {
  getCarBySlug,
  getSiblingCars,
} from "@/lib/data";

type CarPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CarPageProps) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);

  if (!car) {
    return {
      title: "خودرو یافت نشد",
    };
  }

  return {
    title: `${car.manufacturer} ${car.model} | روغن مناسب خودرو در ZenLube`,
    description:
      `مشخصات کامل ${car.manufacturer} ${car.model}${car.generation ? ` ${car.generation}` : ""} به همراه روغن موتورهای پیشنهادی و استانداردهای مورد نیاز.`,
  };
}

export default async function CarDetailPage({ params }: CarPageProps) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);

  if (!car) {
    notFound();
  }

  const recommendedProducts = car.productMappings.map((mapping) => mapping.product);
  const siblings = await getSiblingCars(car.manufacturer, car.slug, 4);
  const baseTitle = `${car.manufacturer} ${car.model}${car.generation ? ` ${car.generation}` : ""}`;
  const yearsRange =
    car.yearFrom || car.yearTo
      ? `${car.yearFrom ?? "نامشخص"} تا ${car.yearTo ?? "نامشخص"}`
      : "نامشخص";
  const oilCapacityText = car.oilCapacityLit ? `${car.oilCapacityLit.toString()} لیتر` : "نامشخص";
  const engineTypeText = car.engineType ?? "نامشخص";
  const viscosityText = car.viscosity ?? "ثبت‌نشده";
  const specificationText = car.specification ?? "ثبت‌نشده";
  const numberFormatter = new Intl.NumberFormat("fa-IR");
  const productCountText = recommendedProducts.length
    ? `${numberFormatter.format(recommendedProducts.length)} محصول`
    : "ثبت‌نشده";

  const overviewText =
    car.overviewDetails?.trim() ||
    [
      `این دفترچه تخصصی برای ${baseTitle} تهیه شده است.`,
      `سال‌های تولید: ${yearsRange}.`,
      "از صفحات بعد می‌توانید جزئیات پیشرانه، گیربکس و نگهداری را مرور کنید.",
    ].join("\n");

  const engineText =
    car.engineDetails?.trim() ||
    [
      engineTypeText !== "نامشخص"
        ? `نوع موتور: ${engineTypeText}.`
        : "نوع موتور در سامانه ثبت نشده است.",
      car.engineCode ? `کد موتور کارخانه: ${car.engineCode}.` : "کد موتور توسط سازنده ثبت نشده است.",
      car.viscosity
        ? `ویسکوزیته پیشنهادی: ${viscosityText}.`
        : "ویسکوزیته پیشنهادی بعداً افزوده خواهد شد.",
      car.oilCapacityLit ? `حجم روغن همراه با فیلتر: ${oilCapacityText}.` : "",
      car.specification ? `استانداردهای مورد نیاز: ${specificationText}.` : "",
      "برای سفارش روغن مناسب می‌توانید از محصولات پیشنهادی همین صفحه استفاده کنید.",
    ]
      .filter(Boolean)
      .join("\n");

  const gearboxText =
    car.gearboxDetails?.trim() ||
    [
      "اطلاعات مربوط به روغن و سرویس گیربکس هنوز تکمیل نشده است.",
      "از طریق پنل ادمین بخش گیربکس را با ظرفیت روغن، نوع سیال و دوره‌های سرویس به‌روزرسانی کنید.",
      "تیم فنی ZenLube در صورت نیاز راهنمایی کامل ارائه خواهد داد.",
    ].join("\n");

  const maintenanceText =
    car.maintenanceInfo?.trim() ||
    [
      "برنامه نگهداری پیشنهادی شامل تعویض روغن موتور هر ۸ تا ۱۰ هزار کیلومتر یا نهایتاً هر ۱۲ ماه است.",
      "فیلتر روغن و فیلتر هوا را در هر بار سرویس بررسی و در صورت نیاز تعویض کنید.",
      "برای تنظیم برنامه سرویس متناسب با شرایط رانندگی، با پشتیبانی ZenLube تماس بگیرید.",
    ].join("\n");

  const notebookCover = {
    title: baseTitle,
    subtitle: `دفترچه فنی و نگهداری ${baseTitle}`,
    meta: [
      { label: "سال‌های تولید", value: yearsRange },
      { label: "ویسکوزیته", value: viscosityText },
      { label: "ظرفیت روغن", value: oilCapacityText },
    ],
  };

  const notebookPages = [
    {
      id: "overview",
      title: "معرفی کلی",
      description: overviewText,
      highlights: [
        { label: "سازنده", value: car.manufacturer },
        { label: "مدل", value: car.model },
        { label: "تعداد محصولات", value: productCountText },
      ],
      tag: "مقدمه",
    },
    {
      id: "engine",
      title: "موتور و روانکارها",
      description: engineText,
      highlights: [
        { label: "نوع موتور", value: engineTypeText },
        { label: "کد موتور", value: car.engineCode ?? "ثبت‌نشده" },
        { label: "ظرفیت روغن", value: oilCapacityText },
        { label: "استانداردها", value: specificationText },
      ],
      tag: "موتور",
    },
    {
      id: "gearbox",
      title: "جعبه‌دنده و انتقال قدرت",
      description: gearboxText,
      highlights: [
        {
          label: "وضعیت اطلاعات",
          value: car.gearboxDetails ? "تکمیل‌شده" : "نیاز به تکمیل",
        },
        { label: "محصولات گیربکس", value: "به‌زودی" },
      ],
      tag: "گیربکس",
    },
    {
      id: "maintenance",
      title: "نگهداری و سرویس دوره‌ای",
      description: maintenanceText,
      highlights: [
        { label: "محصولات تأییدشده", value: productCountText },
        { label: "پشتیبانی", value: "پشتیبانی ZenLube" },
      ],
      tag: "نگهداری",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-12 text-white">
      <section className="grid gap-8 xl:grid-cols-[1.45fr,0.85fr]">
        <CarNotebook cover={notebookCover} pages={notebookPages} />
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/60">
              دفترچه دیجیتال خودرو
            </span>
            <h1 className="mt-4 text-3xl font-semibold">
              {car.manufacturer} {car.model} {car.generation ?? ""}
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/70">
              صفحات دفترچه را ورق بزنید تا اطلاعات فنی موتور، توصیه‌های گیربکس و برنامه نگهداری
              اختصاصی {baseTitle} را مشاهده کنید.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/70">
              {car.engineType && (
                <span className="rounded-full border border-white/10 px-3 py-1">
                  نوع موتور: {car.engineType}
                </span>
              )}
              {car.engineCode && (
                <span className="rounded-full border border-white/10 px-3 py-1">
                  کد موتور: {car.engineCode}
                </span>
              )}
              {car.viscosity && (
                <span className="rounded-full border border-purple-400/50 bg-purple-500/20 px-3 py-1">
                  ویسکوزیته پیشنهادی: {car.viscosity}
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href={`/products?car=${car.slug}`}
                className="rounded-full border border-white/20 px-4 py-2 font-semibold text-white transition hover:border-purple-300 hover:text-purple-100"
              >
                مشاهده محصولات سازگار
              </Link>
              <Link
                href="/support"
                className="rounded-full border border-white/20 px-4 py-2 font-semibold text-white/80 transition hover:border-purple-300 hover:text-white"
              >
                درخواست مشاوره فنی
              </Link>
            </div>
          </div>
          <CarCard
            car={{ ...car, productMappings: car.productMappings }}
            showDetailLink={false}
            showOverview={false}
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              روغن‌های تأیید شده برای {car.manufacturer} {car.model}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              این فهرست براساس دفترچه فنی ZenLube تکمیل شده است و محصولات کاملاً سازگار با این
              خودرو را نمایش می‌دهد. برای مقایسه بیشتر، می‌توانید از فیلتر خودرو در فروشگاه نیز
              استفاده کنید.
            </p>
          </div>
          <Link
            href={`/products?car=${car.slug}`}
            className="text-sm text-purple-200 hover:text-purple-100"
          >
            فیلتر محصولات در فروشگاه
          </Link>
        </div>
        {recommendedProducts.length ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-black/30 p-10 text-center text-white/60">
            هنوز محصولی برای این خودرو ثبت نشده است. می‌توانید با پشتیبانی برای پیشنهاد اختصاصی تماس بگیرید.
          </div>
        )}
      </section>

      {!!siblings.length && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">مدل‌های دیگر {car.manufacturer}</h2>
            <Link href="/cars" className="text-sm text-purple-200 hover:text-purple-100">
              مشاهده تمام خودروها
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {siblings.map((sibling) => (
              <Link
                key={sibling.id}
                href={`/cars/${sibling.slug}`}
                className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70 transition hover:border-purple-400/60 hover:text-white"
              >
                <span className="text-lg font-semibold text-white">
                  {sibling.manufacturer} {sibling.model}
                </span>
                {sibling.generation && <span className="text-white/50">{sibling.generation}</span>}
                <div className="flex flex-wrap gap-2 text-xs text-white/60">
                  {sibling.engineType && <span className="rounded-full border border-white/10 px-3 py-1">{sibling.engineType}</span>}
                  {sibling.viscosity && <span className="rounded-full border border-white/10 px-3 py-1">ویسکوزیته {sibling.viscosity}</span>}
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    {sibling.yearFrom ?? "?"} - {sibling.yearTo ?? "?"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
