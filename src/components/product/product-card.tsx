import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { WishlistButton } from "@/components/product/wishlist-button";
import { PriceBlock } from "@/components/ui/price-block";
import { StatusPill } from "@/components/ui/status-pill";
import type { ProductWithRelations } from "@/types/catalog";

type ProductCardProps = {
  product: ProductWithRelations;
};

export function ProductCard({ product }: ProductCardProps) {
  const specs = [
    product.viscosity,
    product.packagingSizeLit ? `${Number(product.packagingSizeLit).toLocaleString("fa-IR")} لیتر` : null,
    product.oilType,
  ].filter(Boolean);

  const rating = product.averageRating ? Number(product.averageRating).toFixed(1) : null;
  const isAvailable = product.stock > 0;

  return (
    <article className="panel-zen interactive-lift group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px]">
      <div className="relative flex h-full min-w-0 flex-col p-2.5 sm:p-3">
        <div className="absolute left-2.5 top-2.5 z-10 sm:left-3 sm:top-3">
          <WishlistButton compact productId={product.id} />
        </div>

        <div className="absolute right-2.5 top-2.5 z-10 flex max-w-[74%] flex-wrap justify-end gap-1.5 sm:right-3 sm:top-3">
          {product.isBestseller ? (
            <StatusPill className="px-2 py-0.5 text-[10px]" tone="dark">
              پرفروش
            </StatusPill>
          ) : null}
          {product.isFeatured ? (
            <StatusPill className="px-2 py-0.5 text-[10px]" tone="warning">
              ویژه
            </StatusPill>
          ) : null}
        </div>

        <Link aria-label={product.name} className="block rounded-[20px] bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F6F9_100%)] p-2.5" href={`/products/${product.slug}`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.9),rgba(255,255,255,0.55)_38%,rgba(243,246,249,0.8)_100%)] sm:aspect-[10/9]">
          {product.imageUrl ? (
            <Image
              alt={`تصویر ${product.name}`}
              className="object-contain p-3 transition duration-300 group-hover:scale-[1.035] sm:p-4"
              fill
              sizes="(max-width:767px) 50vw, (max-width:1023px) 33vw, (max-width:1535px) 25vw, 220px"
              src={product.imageUrl}
            />
          ) : <div className="flex h-full items-center justify-center text-xs font-medium text-text-soft">بدون تصویر</div>}
        </div>
        </Link>

        <Link
          className="mt-3 text-[11px] font-bold tracking-[0.01em] text-text-soft transition hover:text-primary-accent-strong"
          href={`/products?brand=${product.brand.slug}`}
        >
          {product.brand.name}
        </Link>

        <Link
          className="mt-1 line-clamp-2 min-h-12 text-[13px] font-bold leading-6 text-text-strong transition hover:text-primary-accent-strong sm:text-sm"
          href={`/products/${product.slug}`}
        >
          {product.name}
        </Link>

        <div className="mt-2 min-h-5 text-[11px] font-medium leading-5 text-text-muted">
          {specs.length ? <span className="line-clamp-1">{specs.join(" • ")}</span> : null}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
          <span className={`inline-flex items-center gap-1 font-bold ${isAvailable ? "text-emerald-700" : "text-[#D92D20]"}`}>
            <span className={`h-2 w-2 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.75)] ${isAvailable ? "bg-emerald-500" : "bg-[#D92D20]"}`} />
            {isAvailable ? "موجود در انبار" : "ناموجود"}
          </span>

          {rating && product.reviewCount > 0 ? (
            <span className="shrink-0 inline-flex items-center gap-1 font-bold text-[#F59E0B]">
              <StarIcon className="h-3.5 w-3.5 fill-current" />
              {Number(rating).toLocaleString("fa-IR")}
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-3">
          <PriceBlock amount={product.price} align="start" className="mb-2" label="قیمت" size="sm" />
          <AddToCartButton className="w-full" disabled={!isAvailable} productId={product.id} size="sm" />
        </div>
      </div>
    </article>
  );
}

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="m12 2 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9l6.7-.9L12 2Z" />
    </svg>
  );
}
