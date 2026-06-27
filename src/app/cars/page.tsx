import { CarCard } from "@/components/catalog/car-card";
import { CarSearchSelector } from "@/components/layout/car-search-selector";
import { getCarHierarchy, getCarsWithProducts } from "@/lib/data";

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

  const [cars, carHierarchy] = await Promise.all([getCarsWithProducts(), getCarHierarchy()]);
  const filteredCars = search
    ? cars.filter((car) => {
        const haystack = `${car.manufacturer} ${car.model} ${car.generation ?? ""} ${car.engineCode ?? ""} ${car.engineType ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
    : cars;

  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <header className="rounded-3xl bg-[#111827] p-6 text-white md:p-8">
        <div className="max-w-4xl">
          <p className="text-sm font-bold text-white/70">مرکز دانش خودرو Oilbar</p>
          <h1 className="mt-3 text-2xl font-extrabold leading-[1.7] md:text-4xl">دفترچه راهنمای خودروها</h1>
          <p className="mt-3 text-sm leading-8 text-white/75 md:text-base">
            مشخصات فنی، روغن مناسب، حجم روغن، فیلترها و نکات نگهداری خودروی خود را پیدا کنید.
          </p>
        </div>
        <form className="mt-6 flex flex-col gap-3 md:flex-row" method="get">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="جستجو بر اساس نام خودرو، مدل یا سال ساخت..."
            className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-white px-4 text-sm text-[#1F2937] outline-none focus:ring-4 focus:ring-red-500/20"
          />
          <button type="submit" className="btn-primary">جستجو</button>
        </form>
      </header>

      <section className="grid gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-lg font-extrabold text-[#111827]">خودروی خود را انتخاب کنید</h2>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">با انتخاب برند و مدل، محصولات سازگار و دفترچه تخصصی نمایش داده می‌شود.</p>
        </div>
        <CarSearchSelector hierarchy={carHierarchy} />
      </section>

      <section className="grid gap-3 rounded-3xl border border-[#E5E7EB] bg-white p-5 md:grid-cols-5">
        {["برند خودرو", "مدل خودرو", "سال ساخت", "نوع موتور", "نوع گیربکس"].map((label) => (
          <select key={label} className="input-zen" aria-label={label}>
            <option>{label}</option>
          </select>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {filteredCars.map((car) => (
          <div id={car.slug} key={car.id}>
            <CarCard car={car} />
          </div>
        ))}
        {filteredCars.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#E5E7EB] bg-white p-10 text-center text-[#6B7280] lg:col-span-2">
            خودرویی با این مشخصات یافت نشد.
          </div>
        )}
      </section>
    </div>
  );
}
