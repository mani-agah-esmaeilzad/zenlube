import { CarCard } from "@/components/catalog/car-card";
import { CarSearchSelector } from "@/components/layout/car-search-selector";
import { Pagination } from "@/components/ui/pagination";
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
    <div className="container-zen space-y-8 py-6 md:py-8">
      <header>
        <div className="max-w-4xl">
          <p className="text-sm font-bold text-primary-accent-strong">انتخاب روغن بر اساس خودرو</p>
          <h1 className="t-h1 mt-2">دفترچه راهنمای خودروها</h1>
          <p className="mt-3 text-sm leading-8 text-text-muted md:text-base">
            مشخصات فنی، روغن مناسب، حجم روغن و فیلترهای سازگار خودروی خود را پیدا کنید.
          </p>
        </div>
        <form className="mt-6 flex flex-col gap-3 md:flex-row" method="get">
          <input
            className="input-zen min-h-12 flex-1"
            defaultValue={search}
            name="search"
            placeholder="جستجو بر اساس نام خودرو، مدل یا سال ساخت..."
            type="search"
          />
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={pageInfo.pageSize} />
          <button className="btn-primary" type="submit">جستجو</button>
        </form>
      </header>

      <section className="grid gap-4 rounded-2xl border border-border bg-white p-4 sm:p-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-lg font-extrabold text-text-strong">خودروی خود را انتخاب کنید</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">با انتخاب برند و مدل، محصولات سازگار و دفترچه تخصصی نمایش داده می‌شود.</p>
        </div>
        <CarSearchSelector hierarchy={carHierarchy} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        {cars.map((car) => (
          <div id={car.slug} key={car.id}>
            <CarCard car={car} />
          </div>
        ))}
        {cars.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface-secondary p-10 text-center text-text-muted lg:col-span-2">
            خودرویی با این مشخصات یافت نشد.
          </div>
        )}
      </section>
      <Pagination pathname="/cars" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
