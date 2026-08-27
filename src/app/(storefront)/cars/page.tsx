import { CarCard } from "@/components/catalog/car-card";
import { CarSearchSelector } from "@/components/layout/car-search-selector";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import { getCarHierarchy, getPaginatedCarsWithProducts } from "@/lib/data";
import { getPaginationParams } from "@/lib/pagination";

type CarsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "دفترچه راهنمای خودروها | Oilbar",
  description: "مشخصات فنی، روغن مناسب، حجم روغن، فیلترها و نکات نگهداری خودروها در Oilbar.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const manufacturer = typeof params.manufacturer === "string" ? params.manufacturer : undefined;
  const model = typeof params.model === "string" ? params.model : undefined;
  const { page, pageSize } = getPaginationParams(params, { defaultPageSize: 12, maxPageSize: 48 });

  const [{ items: cars, pageInfo }, carHierarchy] = await Promise.all([
    getPaginatedCarsWithProducts({ search, manufacturer, model, page, pageSize }),
    getCarHierarchy(),
  ]);

  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <StorefrontPageIntro
        actions={(
          <form className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 lg:w-[420px]" method="get">
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
            <button className="btn-primary px-5" type="submit">جستجو</button>
          </form>
        )}
        description="مشخصات فنی، روغن مناسب، حجم روغن و فیلترهای سازگار را از دفترچهٔ خودروی خود بررسی کنید."
        meta={`${pageInfo.total.toLocaleString("fa-IR")} نسخهٔ خودرو در دفترچه‌ها`}
        title="دفترچه راهنمای خودروها"
        tone="dark"
      />

      <section className="grid gap-5 rounded-2xl border border-border bg-white p-4 sm:p-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:p-6">
        <div>
          <h2 className="text-lg font-extrabold text-text-strong">انتخاب مرحله‌ای خودرو</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">با انتخاب برند و مدل، محصولات سازگار و دفترچه تخصصی نمایش داده می‌شود.</p>
        </div>
        <CarSearchSelector hierarchy={carHierarchy} />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="t-h2">خودروهای ثبت‌شده</h2>
            <p className="mt-1 text-sm leading-7 text-text-muted">خلاصهٔ ضروری هر نسخه؛ جزئیات کامل داخل دفترچه باز می‌شود.</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-text-muted">{pageInfo.total.toLocaleString("fa-IR")} نتیجه</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {cars.map((car) => (
            <div id={car.slug} key={car.id}>
              <CarCard car={car} />
            </div>
          ))}
          {cars.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface-secondary p-6 text-center text-text-muted sm:p-10 md:col-span-2">
              خودرویی با این مشخصات یافت نشد.
            </div>
          )}
        </div>
      </section>
      <Pagination pathname="/cars" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
