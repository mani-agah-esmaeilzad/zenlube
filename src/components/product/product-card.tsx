import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/catalog";

type ProductCardProps = {
  product: ProductWithRelations;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-500/10 transition hover:-translate-y-2 hover:shadow-xl">
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        {product.isBestseller && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-sky-300/40">
            پرفروش
          </span>
        )}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            بدون تصویر
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent px-5 pb-4 pt-10 text-xs font-medium text-white">
          <span className="rounded-full bg-white/20 px-3 py-1">
            {product.brand.name}
          </span>
          {product.viscosity && (
            <span className="rounded-full bg-sky-500/70 px-3 py-1 backdrop-blur">
              {product.viscosity}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
        <div className="space-y-3">
          <Link href={`/products/${product.slug}`} className="block text-lg font-semibold text-slate-900 transition hover:text-sky-600">
            {product.name}
          </Link>
          <p className="text-sm leading-6 text-slate-600 line-clamp-3">
            {product.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {product.averageRating && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-600">
                ⭐ {Number(product.averageRating).toFixed(1)}
                <span className="text-amber-600/70">
                  ({product.reviewCount})
                </span>
              </span>
            )}
            {product.packagingSizeLit && (
              <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-500">
                بسته‌بندی {Number(product.packagingSizeLit).toFixed(1)} لیتر
              </span>
            )}
            {product.originCountry && (
              <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-500">
                ساخت {product.originCountry}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 px-3 py-1">
            {product.category.name}
          </span>
          {product.oilType && (
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {product.oilType}
            </span>
          )}
        </div>
        {!!product.tags?.length && (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            {product.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 px-2 py-1">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">قیمت</span>
            <span className="text-xl font-bold text-sky-600">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.carMappings.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="mb-2 font-semibold text-slate-800">
                پیشنهاد شده برای:
              </p>
              <ul className="flex flex-wrap gap-2">
                {product.carMappings.slice(0, 3).map(({ car }) => (
                  <li key={car.id} className="rounded-full bg-white px-3 py-1 text-slate-600 shadow-sm">
                    {car.manufacturer} {car.model}
                  </li>
                ))}
                {product.carMappings.length > 3 && (
                  <li className="rounded-full bg-white px-3 py-1 text-slate-500">
                    +{product.carMappings.length - 3}
                  </li>
                )}
              </ul>
            </div>
          )}
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </article>
  );
}
