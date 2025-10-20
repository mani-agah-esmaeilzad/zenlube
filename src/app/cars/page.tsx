import { CarCard } from "@/components/catalog/car-card";
import { getCarsWithProducts } from "@/lib/data";

type CarsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;

  const cars = await getCarsWithProducts();
  const filteredCars = search
    ? cars.filter((car) => {
        const haystack = `${car.manufacturer} ${car.model} ${car.generation ?? ""} ${car.engineCode ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
    : cars;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">لیست خودروها و مشخصات فنی</h1>
        <p className="text-sm leading-7 text-white/70">
          برای هر خودرو استاندارد روغن، ویسکوزیته پیشنهادی و محصولات مناسب را مشاهده کنید. در هنگام اضافه کردن محصول جدید، خودروهای سازگار انتخاب می‌شوند تا پیشنهاد هوشمند ارائه شود.
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
