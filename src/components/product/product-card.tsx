import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";

import { WishlistButton } from "@/components/product/wishlist-button";
import { PriceBlock } from "@/components/ui/price-block";
import { StatusPill } from "@/components/ui/status-pill";
import type { ProductWithRelations } from "@/types/catalog";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductWithRelations;
  compact?: boolean;
  priority?: boolean;
};

export function ProductCard({ product, compact = false, priority = false }: ProductCardProps) {
  const specs = [
    product.viscosity,
    product.packagingSizeLit ? `${Number(product.packagingSizeLit).toLocaleString("fa-IR")} لیتر` : null,
    product.oilType,
  ].filter(Boolean);

  const rating = product.averageRating ? Number(product.averageRating).toFixed(1) : null;
  const isAvailable = product.stock > 0;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(17,24,39,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(217,119,6,0.24)] hover:shadow-[0_14px_32px_rgba(17,24,39,0.07)]">
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

        <Link aria-label={product.name} className="block rounded-xl bg-surface-secondary" href={`/products/${product.slug}`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl sm:aspect-[10/9]">
            {product.imageUrl ? (
              <Image
                alt={`تصویر ${product.name}`}
                className="object-contain p-3 transition duration-300 group-hover:scale-[1.03] sm:p-4"
                fill
                priority={priority}
                sizes="(max-width:639px) calc(100vw - 32px), (max-width:1023px) 50vw, (max-width:1535px) 33vw, 220px"
                src={product.imageUrl}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-medium text-text-soft">بدون تصویر</div>
            )}
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

        {specs.length ? (
          <div className="mt-2 hidden text-[11px] font-medium leading-5 text-text-muted sm:block">
            <span className="line-clamp-1">{specs.join(" • ")}</span>
          </div>
        ) : null}

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] sm:mt-3">
          <span className={cn("inline-flex items-center gap-1 font-bold", isAvailable ? "text-success" : "text-error")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", isAvailable ? "bg-success" : "bg-error")} />
            {isAvailable ? "موجود" : "ناموجود"}
          </span>

          {rating && product.reviewCount > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-1 font-bold text-primary-accent-strong">
              <StarIcon className="h-3.5 w-3.5 fill-current" />
              {Number(rating).toLocaleString("fa-IR")}
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-2.5 sm:pt-3">
          <PriceBlock align="start" amount={product.price} className={compact ? "mb-2" : undefined} showLabel={false} size="sm" />
          {compact ? (
            <Link className="btn-outline w-full !min-h-10 text-xs" href={`/products/${product.slug}`}>
              مشاهده محصول
            </Link>
          ) : null}
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
