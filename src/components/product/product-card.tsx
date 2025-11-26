import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/catalog";

type ProductCardProps = {
  product: ProductWithRelations;
};

export function ProductCard({ product }: ProductCardProps) {
  const rating = product.averageRating ? Number(product.averageRating).toFixed(1) : null;
  const packageSize = product.packagingSizeLit ? Number(product.packagingSizeLit).toFixed(1) : null;
  const isAvailable = product.stock > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-2">
      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">بدون تصویر</div>
        )}
        <div className="absolute inset-x-0 top-4 flex flex-wrap items-center gap-2 px-6">
          {product.isBestseller ? (
            <span className="wp-pill border-emerald-200 bg-emerald-50 font-semibold text-emerald-700">پرفروش</span>
          ) : null}
          {product.viscosity ? (
            <span className="wp-pill border-emerald-200 bg-emerald-50 text-emerald-700">ویسکوزیته {product.viscosity}</span>
          ) : null}
          {product.oilType ? (
            <span className="wp-pill border-white/20 bg-white/90 text-slate-700">{product.oilType}</span>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-6 py-4 text-xs text-white">
          <span className="rounded-full bg-white/20 px-3 py-1">{product.brand.name}</span>
          {packageSize ? <span className="rounded-full bg-white/20 px-3 py-1">{packageSize} لیتر</span> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-2">
          <Link href={`/products/${product.slug}`} className="block text-lg font-semibold text-slate-900 transition hover:text-sky-600">
            {product.name}
          </Link>
          <p className="text-sm leading-6 text-slate-600 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 px-3 py-1">{product.category.name}</span>
          {product.originCountry ? <span className="rounded-full border border-slate-200 px-3 py-1">ساخت {product.originCountry}</span> : null}
          {rating ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              ⭐ {rating}
              <span className="text-emerald-600/70">({product.reviewCount})</span>
            </span>
          ) : null}
        </div>

        {product.tags?.length ? (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            {product.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 px-2 py-1">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto space-y-4">
          {product.carMappings.length > 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">خودروهای پیشنهادی</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {product.carMappings.slice(0, 3).map(({ car }) => (
                  <li key={car.id} className="rounded-full bg-white px-3 py-1 shadow-sm">
                    {car.manufacturer} {car.model}
                  </li>
                ))}
                {product.carMappings.length > 3 ? (
                  <li className="rounded-full bg-white px-3 py-1">+{product.carMappings.length - 3}</li>
                ) : null}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400">قیمت آنلاین</p>
                <p className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</p>
              </div>
              <span className={`text-xs font-semibold ${isAvailable ? "text-emerald-600" : "text-rose-500"}`}>
                {isAvailable ? "موجود" : "ناموجود"}
              </span>
            </div>
            <AddToCartButton productId={product.id} className="mt-3 w-full" disabled={!isAvailable} />
          </div>
        </div>
      </div>
    </article>
  );
}
