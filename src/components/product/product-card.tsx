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
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-purple-950/30 backdrop-blur transition hover:-translate-y-2 hover:border-purple-400/60">
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-purple-950/80 via-purple-900/40 to-black">
        {product.isBestseller && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-purple-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-purple-900/40">
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
          <div className="flex h-full w-full items-center justify-center text-white/30">
            بدون تصویر
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-4 right-4 flex flex-wrap items-center gap-2 text-xs font-medium text-white/90">
          <span className="rounded-full bg-white/10 px-3 py-1">
            {product.brand.name}
          </span>
          {product.viscosity && (
            <span className="rounded-full bg-purple-500/40 px-3 py-1 backdrop-blur">
              {product.viscosity}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
        <div className="space-y-3">
          <Link href={`/products/${product.slug}`} className="block text-lg font-semibold text-white transition hover:text-purple-200">
            {product.name}
          </Link>
          <p className="text-sm leading-6 text-white/70 line-clamp-3">
            {product.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-purple-100">
            {product.averageRating && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 font-semibold">
                ⭐ {Number(product.averageRating).toFixed(1)}
                <span className="text-white/60">
                  ({product.reviewCount})
                </span>
              </span>
            )}
            {product.packagingSizeLit && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">
                بسته‌بندی {Number(product.packagingSizeLit).toFixed(1)} لیتر
              </span>
            )}
            {product.originCountry && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">
                ساخت {product.originCountry}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/10 px-3 py-1">
            {product.category.name}
          </span>
          {product.oilType && (
            <span className="rounded-full border border-white/10 px-3 py-1">
              {product.oilType}
            </span>
          )}
        </div>
        {!!product.tags?.length && (
          <div className="flex flex-wrap gap-2 text-[11px] text-white/50">
            {product.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 px-2 py-1">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-white/50">قیمت</span>
            <span className="text-xl font-bold text-purple-200">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.carMappings.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              <p className="mb-2 font-semibold text-white">
                پیشنهاد شده برای:
              </p>
              <ul className="flex flex-wrap gap-2">
                {product.carMappings.slice(0, 3).map(({ car }) => (
                  <li key={car.id} className="rounded-full bg-white/10 px-3 py-1">
                    {car.manufacturer} {car.model}
                  </li>
                ))}
                {product.carMappings.length > 3 && (
                  <li className="rounded-full bg-white/10 px-3 py-1">
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
