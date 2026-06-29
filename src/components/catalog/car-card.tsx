import Link from "next/link";
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

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white transition hover:-translate-y-1 hover:border-[#F5C56B] hover:shadow-[0_18px_44px_rgba(17,24,39,0.1)]">
      <div className="grid gap-4 p-4 md:grid-cols-[160px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#F7F7F8]">
          {car.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={car.imageUrl} alt={`${car.manufacturer} ${car.model}`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-extrabold text-[#111827]">{car.manufacturer.slice(0, 1)}</div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-[#111827]">{car.manufacturer} {car.model}</h3>
              {car.generation && <p className="mt-1 text-sm text-[#6B7280]">{car.generation}</p>}
            </div>
            <span className="rounded-full bg-[#FFF8E8] px-3 py-1 text-xs font-bold text-[#D97706]">دفترچه خودرو</span>
          </div>
          {showOverview && overviewSnippet && <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6B7280]">{overviewSnippet}</p>}
          <div className="mt-4 grid gap-2 text-xs text-[#6B7280] sm:grid-cols-2">
            <Spec label="سال‌ها" value={years} />
            <Spec label="نوع موتور" value={car.engineType ?? "نامشخص"} />
            <Spec label="روغن پیشنهادی" value={car.viscosity ?? "ثبت نشده"} highlight />
            <Spec label="حجم روغن" value={car.oilCapacityLit ? `${car.oilCapacityLit.toString()} لیتر` : "نامشخص"} />
          </div>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] bg-[#F7F7F8] p-4">
        {car.productMappings.length > 0 ? (
          <div>
            <p className="mb-3 text-sm font-bold text-[#111827]">محصولات سازگار</p>
            <ul className="space-y-2">
              {car.productMappings.slice(0, 2).map(({ product }) => (
                <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link href={`/products/${product.slug}`} className="line-clamp-1 font-semibold text-[#374151] hover:text-[#D97706]">
                    {product.brand.name} - {product.name}
                  </Link>
                  <span className="shrink-0 text-xs font-bold text-[#111827]">{formatPrice(product.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">هنوز محصول سازگار برای این خودرو ثبت نشده است.</p>
        )}
        {showDetailLink && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/cars/${car.slug}`} className="btn-primary !min-h-10 text-xs">مشاهده دفترچه</Link>
            <Link href={`/products?car=${car.slug}`} className="btn-outline !min-h-10 text-xs">خرید روغن مناسب</Link>
          </div>
        )}
      </div>
    </article>
  );
}

function Spec({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 ${highlight ? "border-[#FDE7B0] bg-[#FFF8E8] text-[#D97706]" : "border-[#E5E7EB] bg-white"}`}>
      <span className="block text-[11px] font-medium opacity-75">{label}</span>
      <span className="mt-1 block font-bold">{value}</span>
    </div>
  );
}
