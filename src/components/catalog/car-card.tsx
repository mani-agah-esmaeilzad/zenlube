import Link from "next/link";
import { resolveCarOilCapacityLabel } from "@/lib/car-manual-overrides";
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
    <article className="group h-full overflow-hidden rounded-2xl border border-border bg-white transition hover:border-[rgba(217,119,6,0.28)]">
      <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-4 sm:p-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-secondary sm:aspect-[4/3]">
          {car.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={car.imageUrl} alt={`${car.manufacturer} ${car.model}`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-extrabold text-text-strong">{car.manufacturer.slice(0, 1)}</div>
          )}
        </div>
        <div className="min-w-0 py-0.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-extrabold leading-7 text-text-strong sm:text-lg">{car.manufacturer} {car.model}</h3>
              {car.generation ? <p className="mt-0.5 line-clamp-1 text-xs text-text-muted sm:text-sm">{car.generation}</p> : null}
            </div>
            <span className="shrink-0 text-[11px] font-bold text-primary-accent-strong">
              {car.productMappings.length.toLocaleString("fa-IR")} محصول
            </span>
          </div>
          {showOverview && overviewSnippet ? <p className="mt-2 hidden line-clamp-2 text-xs leading-6 text-text-muted sm:block">{overviewSnippet}</p> : null}
        </div>
      </div>

      <dl className="grid grid-cols-3 border-y border-border bg-surface-secondary text-center">
        <Spec label="سال ساخت" value={years} />
        <Spec label="روغن" value={car.viscosity ?? "نامشخص"} highlight />
        <Spec label="حجم" value={oilCapacity} />
      </dl>

      <div className="p-3 sm:p-4">
        {showDetailLink && (
          <div className="flex items-center justify-between gap-3">
            <Link href={`/cars/${car.slug}`} className="btn-secondary !min-h-11 flex-1 text-xs">باز کردن دفترچه</Link>
            <Link href={`/products?car=${car.slug}`} className="shrink-0 px-1 text-xs font-extrabold text-primary-accent-strong">محصولات سازگار</Link>
          </div>
        )}
      </div>
    </article>
  );
}

function Spec({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`min-w-0 border-l border-border px-2 py-3 last:border-l-0 ${highlight ? "bg-surface-tint text-primary-accent-strong" : "text-text"}`}>
      <dt className="text-[10px] font-bold text-text-muted">{label}</dt>
      <dd className="mt-1 truncate text-[11px] font-extrabold sm:text-xs">{value}</dd>
    </div>
  );
}
