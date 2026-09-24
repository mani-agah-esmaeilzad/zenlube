import Link from "next/link";
import { CarCard } from "@/components/catalog/car-card";
import { CarSearchSelector } from "@/components/layout/car-search-selector";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import { getCarHierarchy, getPaginatedCarsWithProducts } from "@/lib/data";
import { getPaginationParams } from "@/lib/pagination";
import { buildCollectionMetadata } from "@/lib/seo";

type CarsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const popularCarGuides = [
  {
    href: "/cars/mg-360",
    title: "مشخصات کامل ام جی 360",
    description: "مقایسه نسخه‌های دنده‌ای، اتومات و توربو همراه اطلاعات فنی و دفترچه سرویس",
  },
  {
    href: "/cars/mg-5",
    title: "مشخصات کامل ام جی 5",
    description: "مشخصات موتور 1.5 لیتری، گیربکس CVT و روغن مناسب نسخه واردشده به ایران",
  },
  {
    href: "/cars/mg-6",
    title: "مشخصات کامل ام جی 6",
    description: "مقایسه مدل قدیم و نیوفیس، تفاوت گیربکس‌ها و اطلاعات کامل سرویس",
  },
  {
    href: "/cars/mg-gs",
    title: "مشخصات کامل ام جی GS",
    description: "راهنمای موتور 2.0 توربو، گیربکس دوکلاچه و روغن‌های مناسب",
  },
  {
    href: "/cars/mg-rx5",
    title: "مشخصات کامل ام جی RX5",
    description: "مشخصات فنی نسخه 2.0 توربو و راهنمای روغن موتور و گیربکس",
  },
  {
    href: "/cars/mg-7",
    title: "مشخصات کامل ام جی 7",
    description: "مقایسه موتورهای 1.5 و 2.0 توربو، گیربکس‌ها و روغن مناسب مدل 2025",
  },
  {
    href: "/cars/kmc-j7",
    title: "مشخصات کامل KMC J7",
    description: "راهنمای روغن 5W-30، حجم سرویس و گیربکس دوکلاچه بر اساس دفترچه فارسی",
  },
  {
    href: "/cars/kmc-k7",
    title: "مشخصات کامل KMC K7",
    description: "گرید وابسته به دما، حجم دقیق روغن و اطلاعات گیربکس DCT",
  },
  {
    href: "/cars/kmc-x5",
    title: "مشخصات کامل KMC X5",
    description: "اصلاح حجم روغن موتور، استاندارد API SN و روغن گیربکس دوکلاچه",
  },
  {
    href: "/cars/kmc-t8",
    title: "مشخصات کامل KMC T8",
    description: "روغن موتور مناسب آب‌وهوا، گیربکس دستی و روانکارهای سیستم چهارچرخ محرک",
  },
  {
    href: "/cars/kmc-t9",
    title: "مشخصات کامل KMC T9",
    description: "راهنمای موتور N20TG، روغن 5W-30 و گیربکس 8 سرعته اتوماتیک",
  },
] as const;

export async function generateMetadata({ searchParams }: CarsPageProps) {
  return buildCollectionMetadata({ pathname: "/cars", title: "انتخاب روغن مناسب خودرو و دفترچه‌های فنی | اویل‌بار", description: "روغن موتور مناسب، گرانروی و استاندارد روغن، حجم سرویس، روغن گیربکس و محصولات سازگار را براساس مدل و نسخه خودرو در دفترچه‌های اویل‌بار بررسی کنید.", searchParams: await searchParams });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const manufacturer = typeof params.manufacturer === "string" ? params.manufacturer : undefined;
  const model = typeof params.model === "string" ? params.model : undefined;
  const { page, pageSize } = getPaginationParams(params, { defaultPageSize: 12, maxPageSize: 48 });
  const showPopularGuides = !search && !manufacturer && !model && page === 1;

  const [{ items: cars, pageInfo }, carHierarchy] = await Promise.all([
    getPaginatedCarsWithProducts({ search, manufacturer, model, page, pageSize }),
    getCarHierarchy(),
  ]);

  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:py-8">
      <StorefrontPageIntro
        compact
        actions={(
          <form className="grid w-full max-w-lg grid-cols-[minmax(0,1fr)_auto] gap-2" method="get">
            <label className="sr-only" htmlFor="car-search">جستجوی خودرو</label>
            <input
              className="input-zen !border-white/15 !bg-white/10 !text-white placeholder:!text-white/45"
              defaultValue={search}
              id="car-search"
              name="search"
              placeholder="نام، مدل یا سال ساخت"
              type="search"
            />
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="pageSize" value={pageInfo.pageSize} />
            <button className="btn-primary !min-h-11 !rounded-lg px-4 text-sm" type="submit">جستجو</button>
          </form>
        )}
        description="مشخصات فنی، روغن مناسب، حجم روغن و فیلترهای سازگار را از دفترچهٔ خودروی خود بررسی کنید."
        meta={`${pageInfo.total.toLocaleString("fa-IR")} نسخهٔ خودرو در دفترچه‌ها`}
        title="دفترچه راهنمای خودروها"
        tone="dark"
      />

      <section className="grid gap-5 border-y border-border py-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:py-6">
        <div>
          <h2 className="text-lg font-extrabold text-text-strong">انتخاب مرحله‌ای خودرو</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">با انتخاب برند و مدل، محصولات سازگار و دفترچه تخصصی نمایش داده می‌شود.</p>
        </div>
        <CarSearchSelector hierarchy={carHierarchy} />
      </section>

      {showPopularGuides ? (
        <section aria-labelledby="popular-car-guides-title">
          <div className="mb-2 flex items-end justify-between gap-3">
            <h2 className="t-h2" id="popular-car-guides-title">راهنمای مدل‌های پرجستجو</h2>
          </div>
          <div className="grid border-t border-border md:grid-cols-2 md:gap-x-6">
            {popularCarGuides.map((guide) => (
              <Link className="group flex min-w-0 items-center justify-between gap-4 border-b border-border py-4" href={guide.href} key={guide.href}>
                <span className="min-w-0">
                  <span className="block font-extrabold text-text-strong transition group-hover:text-primary-accent-strong">{guide.title}</span>
                  <span className="mt-1 block text-xs leading-6 text-text-muted">{guide.description}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-primary-accent-strong">←</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <h2 className="t-h2">خودروهای ثبت‌شده</h2>
          </div>
          <span className="shrink-0 text-xs font-bold text-text-muted">{pageInfo.total.toLocaleString("fa-IR")} نتیجه</span>
        </div>
        <div className="grid border-t border-border md:grid-cols-2 md:gap-x-6">
          {cars.map((car) => (
            <div id={car.slug} key={car.id}>
              <CarCard car={car} />
            </div>
          ))}
          {cars.length === 0 && (
            <EmptyState className="md:col-span-2" compact title="خودرویی با این مشخصات یافت نشد" />
          )}
        </div>
      </section>
      <Pagination pathname="/cars" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
