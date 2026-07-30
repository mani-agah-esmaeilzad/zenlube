import Link from "next/link";
import { resolveCarOilCapacityLabel } from "@/lib/car-manual-overrides";
import { formatPrice } from "@/lib/utils";
import type { CarWithProducts } from "@/types/catalog";

type CarCardProps = {
  car: CarWithProducts;
  showDetailLink?: boolean;
  showOverview?: boolean;
};

export function CarCard({ car, showDetailLink = true, showOverview = true }: CarCardProps) {
  const overviewText = car.overviewDetails?.trim();
  const overviewSnippet = overviewText && overviewText.length > 160 ? `${overviewText.slice(0, 160)}...` : overviewText ?? "";
  const years = car.yearFrom || car.yearTo ? `${car.yearFrom ?? "؟"} تا ${car.yearTo ?? "؟"}` : "نامشخص";
  const oilCapacity = resolveCarOilCapacityLabel(car);

  return (
    <article className="panel-zen interactive-lift group overflow-hidden rounded-3xl">
      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[160px_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#F7F8FA_0%,#F2F5F8_100%)]">
          {car.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={car.imageUrl} alt={`${car.manufacturer} ${car.model}`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-extrabold text-text-strong">{car.manufacturer.slice(0, 1)}</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-text-strong">{car.manufacturer} {car.model}</h3>
              {car.generation && <p className="mt-1 text-sm text-text-muted">{car.generation}</p>}
            </div>
            <span className="chip-zen shrink-0 px-3 py-1 text-xs">دفترچه خودرو</span>
          </div>
          {showOverview && overviewSnippet && <p className="mt-3 line-clamp-2 text-sm leading-7 text-text-muted">{overviewSnippet}</p>}
          <div className="mt-4 grid gap-2 text-xs text-text-muted min-[360px]:grid-cols-2">
            <Spec label="سال‌ها" value={years} />
            <Spec label="نوع موتور" value={car.engineType ?? "نامشخص"} />
            <Spec label="روغن پیشنهادی" value={car.viscosity ?? "ثبت نشده"} highlight />
            <Spec label="حجم روغن" value={oilCapacity} />
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-[linear-gradient(180deg,#FCFCFD_0%,#F7F8FA_100%)] p-4 sm:p-5">
        {car.productMappings.length > 0 ? (
          <div>
            <p className="mb-3 text-sm font-bold text-text-strong">محصولات سازگار</p>
            <ul className="space-y-2">
              {car.productMappings.slice(0, 2).map(({ product }) => (
                <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link href={`/products/${product.slug}`} className="line-clamp-2 min-w-0 font-semibold leading-6 text-[#374151] hover:text-primary-accent-strong">
                    {product.brand.name} - {product.name}
                  </Link>
                  <span className="shrink-0 text-xs font-bold text-text-strong">{formatPrice(product.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-text-muted">هنوز محصول سازگار برای این خودرو ثبت نشده است.</p>
        )}
        {showDetailLink && (
          <div className="mt-4 flex flex-col gap-2 min-[390px]:flex-row">
            <Link href={`/cars/${car.slug}`} className="btn-primary !min-h-11 w-full text-xs min-[390px]:w-auto">مشاهده دفترچه</Link>
            <Link href={`/products?car=${car.slug}`} className="btn-outline !min-h-11 w-full text-xs min-[390px]:w-auto">خرید روغن مناسب</Link>
          </div>
        )}
      </div>
    </article>
  );
}

function Spec({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 ${highlight ? "border-[rgba(245,158,11,0.2)] bg-surface-tint text-primary-accent-strong" : "border-border bg-white"}`}>
      <span className="block text-[11px] font-medium opacity-75">{label}</span>
      <span className="mt-1 block font-bold">{value}</span>
    </div>
  );
}
