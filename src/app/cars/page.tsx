import { CarCard } from "@/components/catalog/car-card";
import { CarSearchSelector } from "@/components/layout/car-search-selector";
import { getCarHierarchy, getCarsWithProducts } from "@/lib/data";

type CarsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;

  const [cars, carHierarchy] = await Promise.all([getCarsWithProducts(), getCarHierarchy()]);
  const filteredCars = search
    ? cars.filter((car) => {
        const haystack = `${car.manufacturer} ${car.model} ${car.generation ?? ""} ${car.engineCode ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
    : cars;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">دفترچه‌های دیجیتال خودرو</h1>
        <p className="text-sm leading-7 text-white/70">
          برای هر خودرو دفترچه‌ای تعاملی شامل صفحه موتور، صفحه گیربکس و نکات نگهداری تهیه شده است.
          می‌توانید استاندارد روغن، ویسکوزیته پیشنهادی و محصولات سازگار را در چند صفحه مطالعه کنید.
        </p>
        <form className="flex flex-wrap gap-3" method="get">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="جستجو بر اساس نام خودرو، موتور یا کد موتور"
            className="flex-1 min-w-[220px] rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-purple-400"
          />
          <button
            type="submit"
            className="rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-400"
          >
            جستجو
          </button>
        </form>
        <CarSearchSelector hierarchy={carHierarchy} />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {filteredCars.map((car) => (
          <div id={car.slug} key={car.id}>
            <CarCard car={car} />
          </div>
        ))}
        {filteredCars.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-black/30 p-10 text-center text-white/60">
            خودرویی با این مشخصات یافت نشد.
          </div>
        )}
      </div>
    </div>
  );
}
