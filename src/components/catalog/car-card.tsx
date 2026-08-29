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
  const carName = `${car.manufacturer} ${car.model}`;

  return (
    <article className="group min-w-0 border-b border-border py-4 sm:py-5">
      <div className={car.imageUrl ? "grid grid-cols-[112px_minmax(0,1fr)] gap-4 sm:grid-cols-[156px_minmax(0,1fr)]" : ""}>
        {car.imageUrl ? (
          <Link className="block" href={`/cars/${car.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={carName}
              className="h-24 w-full rounded-xl object-cover transition duration-300 group-hover:scale-[1.01] sm:h-28"
              loading="lazy"
              src={car.imageUrl}
            />
          </Link>
        ) : null}

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                className="line-clamp-2 text-base font-extrabold leading-7 text-text-strong transition hover:text-primary-accent-strong sm:text-lg"
                href={`/cars/${car.slug}`}
              >
                {carName}
              </Link>
              {car.generation ? <p className="mt-0.5 line-clamp-1 text-xs text-text-muted sm:text-sm">{car.generation}</p> : null}
            </div>
            <span className="shrink-0 text-[11px] font-bold text-primary-accent-strong">
              {car.productMappings.length.toLocaleString("fa-IR")} محصول
            </span>
          </div>

          {showOverview && overviewSnippet ? (
            <p className="mt-2 hidden line-clamp-2 text-xs leading-6 text-text-muted sm:block">{overviewSnippet}</p>
          ) : null}

          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <Spec label="سال ساخت" value={years} />
            <Spec label="روغن" value={car.viscosity ?? "نامشخص"} highlight />
            <Spec label="حجم" value={oilCapacity} />
          </dl>

          {showDetailLink ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-extrabold">
              <Link className="inline-flex min-h-11 items-center text-text-strong transition hover:text-primary-accent-strong md:min-h-8" href={`/cars/${car.slug}`}>
                باز کردن دفترچه
              </Link>
              <Link className="inline-flex min-h-11 items-center text-primary-accent-strong md:min-h-8" href={`/products?car=${car.slug}`}>
                محصولات سازگار
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Spec({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex min-w-0 items-baseline gap-1.5">
      <dt className="font-bold text-text-muted">{label}</dt>
      <dd className={`max-w-36 truncate font-extrabold ${highlight ? "text-primary-accent-strong" : "text-text"}`}>{value}</dd>
    </div>
  );
}
