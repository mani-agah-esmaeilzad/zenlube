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
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-500/15">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-slate-900">
          {car.manufacturer} {car.model}
        </h3>
        {car.generation && <p className="text-sm text-slate-500">{car.generation}</p>}
        {showOverview && overviewSnippet && (
          <p className="mt-2 text-sm leading-6 text-slate-600">{overviewSnippet}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          {car.engineType && (
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {car.engineType}
            </span>
          )}
          {car.engineCode && (
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {car.engineCode}
            </span>
          )}
          {car.viscosity && (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
              ویسکوزیته پیشنهادی {car.viscosity}
            </span>
          )}
        </div>
      </div>
      <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
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
        <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
          <p className="text-sm font-semibold text-sky-700">محصولات پیشنهادی</p>
          <ul className="space-y-2">
            {car.productMappings.slice(0, 3).map(({ product }) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 text-sm text-slate-600"
              >
                <Link href={`/products/${product.slug}`} className="hover:text-sky-700">
                  {product.brand.name} — {product.name}
                </Link>
                <span className="text-xs text-slate-500">{formatPrice(product.price)}</span>
              </li>
            ))}
          </ul>
          {car.productMappings.length > 3 && (
            <p className="text-xs text-slate-500">
              {car.productMappings.length - 3} محصول دیگر در سایت موجود است.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          هنوز محصولی برای این خودرو ثبت نشده است.
        </p>
      )}
      {showDetailLink && (
        <Link
          href={`/cars/${car.slug}`}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
        >
          صفحه تخصصی {car.manufacturer} {car.model}
        </Link>
      )}
    </article>
  );
}
