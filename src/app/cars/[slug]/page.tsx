import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCard } from "@/components/catalog/car-card";
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white space-y-12">
      <section className="grid gap-8 rounded-[40px] border border-white/10 bg-white/5 p-8 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
            پروفایل خودرو
          </span>
          <h1 className="text-3xl font-semibold">
            {car.manufacturer} {car.model} {car.generation ?? ""}
          </h1>
          <p className="text-sm leading-7 text-white/70">
            مشخصات فنی ثبت شده برای این خودرو شامل نوع موتور، استانداردهای روغن مورد نیاز و پیشنهادهای تیم فنی ZenLube است. از بخش زیر می‌توانید محصولات سازگار با این خودرو را مشاهده و فیلتر کنید.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            {car.engineType && <span className="rounded-full border border-white/10 px-3 py-1">نوع موتور: {car.engineType}</span>}
            {car.engineCode && <span className="rounded-full border border-white/10 px-3 py-1">کد موتور: {car.engineCode}</span>}
            {car.viscosity && <span className="rounded-full border border-purple-400/50 bg-purple-500/20 px-3 py-1">ویسکوزیته پیشنهادی: {car.viscosity}</span>}
          </div>
          <div className="grid gap-2 rounded-3xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
            <div className="flex justify-between">
              <span>سال‌های تولید:</span>
              <span>{car.yearFrom ?? "نامشخص"} - {car.yearTo ?? "نامشخص"}</span>
            </div>
            {car.oilCapacityLit && (
              <div className="flex justify-between">
                <span>حجم روغن موتور:</span>
                <span>{car.oilCapacityLit.toString()} لیتر</span>
              </div>
            )}
            {car.specification && (
              <div className="flex justify-between">
                <span>استاندارد سازنده:</span>
                <span>{car.specification}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            <Link
              href={`/products?car=${car.slug}`}
              className="rounded-full border border-white/20 px-4 py-2 font-semibold hover:border-purple-300 hover:text-purple-100"
            >
              مشاهده محصولات فروشگاه برای این خودرو
            </Link>
            <Link
              href="/support"
              className="rounded-full border border-white/20 px-4 py-2 font-semibold text-white/80 hover:border-purple-300 hover:text-white"
            >
              درخواست مشاوره فنی
            </Link>
          </div>
        </div>
        <CarCard car={{ ...car, productMappings: car.productMappings }} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">روغن موتورهای سازگار با {car.manufacturer} {car.model}</h2>
            <p className="mt-2 text-sm text-white/60">
              این لیست شامل محصولات تأیید شده توسط تیم فنی ZenLube است. می‌توانید از صفحه فروشگاه با فیلتر خودرو نیز همین نتایج را مشاهده کنید.
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
