import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { CarWithProducts } from "@/types/catalog";

type CarCardProps = {
  car: CarWithProducts;
  showDetailLink?: boolean;
  showOverview?: boolean;
};

export function CarCard({
  car,
  showDetailLink = true,
  showOverview = true,
}: CarCardProps) {
  const overviewText = car.overviewDetails?.trim();
  const overviewSnippet =
    overviewText && overviewText.length > 180
      ? `${overviewText.slice(0, 180)}…`
      : overviewText ?? "";

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-purple-400/60">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-white">
          {car.manufacturer} {car.model}
        </h3>
        {car.generation && <p className="text-sm text-white/60">{car.generation}</p>}
        {showOverview && overviewSnippet && (
          <p className="mt-2 text-sm leading-6 text-white/70">{overviewSnippet}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-white/70">
          {car.engineType && (
            <span className="rounded-full border border-white/10 px-3 py-1">
              {car.engineType}
            </span>
          )}
          {car.engineCode && (
            <span className="rounded-full border border-white/10 px-3 py-1">
              {car.engineCode}
            </span>
          )}
          {car.viscosity && (
            <span className="rounded-full border border-purple-400/50 bg-purple-500/20 px-3 py-1">
              ویسکوزیته پیشنهادی {car.viscosity}
            </span>
          )}
        </div>
      </div>
      <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
        <div className="flex justify-between">
          <span>سال ساخت:</span>
          <span>
            {car.yearFrom ?? "نامشخص"} - {car.yearTo ?? "نامشخص"}
          </span>
        </div>
        {car.oilCapacityLit && (
          <div className="flex justify-between">
            <span>ظرفیت روغن:</span>
            <span>{car.oilCapacityLit.toString()} لیتر</span>
          </div>
        )}
        {car.specification && (
          <div className="flex justify-between">
            <span>استاندارد:</span>
            <span>{car.specification}</span>
          </div>
        )}
      </div>
      {car.productMappings.length > 0 ? (
        <div className="space-y-3 rounded-2xl border border-purple-500/30 bg-purple-950/40 p-4">
          <p className="text-sm font-semibold text-purple-100">محصولات پیشنهادی</p>
          <ul className="space-y-2">
            {car.productMappings.slice(0, 3).map(({ product }) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 text-sm text-white/80"
              >
                <Link href={`/products/${product.slug}`} className="hover:text-purple-200">
                  {product.brand.name} — {product.name}
                </Link>
                <span className="text-xs text-white/50">{formatPrice(product.price)}</span>
              </li>
            ))}
          </ul>
          {car.productMappings.length > 3 && (
            <p className="text-xs text-white/60">
              {car.productMappings.length - 3} محصول دیگر در سایت موجود است.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-white/50">
          هنوز محصولی برای این خودرو ثبت نشده است.
        </p>
      )}
      {showDetailLink && (
        <Link
          href={`/cars/${car.slug}`}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-300 hover:text-purple-100"
        >
          صفحه تخصصی {car.manufacturer} {car.model}
        </Link>
      )}
    </article>
  );
}
