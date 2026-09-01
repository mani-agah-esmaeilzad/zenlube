import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";

import { WishlistButton } from "@/components/product/wishlist-button";
import { PriceBlock } from "@/components/ui/price-block";
import { StatusPill } from "@/components/ui/status-pill";
import { resolveProductPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/catalog";

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
  const pricing = resolveProductPricing(product);
  const isAvailable = product.stock > 0 && pricing.effectivePrice > 0;
  const badge = pricing.promotionActive
    ? pricing.label
    : product.isBestseller
      ? "پرفروش"
      : product.isFeatured
        ? "ویژه"
        : null;

  return (
    <article
      className={cn(
        "group h-full min-w-0 border-b border-border pb-4",
        product.imageUrl
          ? "grid grid-cols-[112px_minmax(0,1fr)] gap-4 sm:flex sm:flex-col"
          : "flex flex-col",
      )}
    >
      {product.imageUrl ? (
        <div className="relative">
          <div className="absolute left-2.5 top-2.5 z-10 sm:left-3 sm:top-3">
            <WishlistButton compact productId={product.id} />
          </div>
          {badge ? (
            <div className="absolute right-3 top-3 z-10 hidden sm:block">
              <StatusPill className="px-2 py-0.5 text-[10px]" tone={product.isBestseller && !pricing.promotionActive ? "dark" : "warning"}>
                {badge}
              </StatusPill>
            </div>
          ) : null}

          <Link
            aria-label={product.name}
            className="relative block aspect-square overflow-hidden rounded-xl bg-surface-secondary sm:aspect-[10/9]"
            href={`/products/${product.slug}`}
          >
            <Image
              alt={`تصویر ${product.name}`}
              className="object-contain p-2.5 transition duration-300 group-hover:scale-[1.03] sm:p-4"
              fill
              priority={priority}
              sizes="(max-width:639px) 112px, (max-width:1023px) 50vw, (max-width:1535px) 33vw, 220px"
              src={product.imageUrl}
            />
          </Link>
        </div>
      ) : (
        <div className="flex min-h-11 items-center justify-between gap-3">
          {badge ? (
            <StatusPill className="px-2 py-0.5 text-[10px]" tone={product.isBestseller && !pricing.promotionActive ? "dark" : "warning"}>
              {badge}
            </StatusPill>
          ) : (
            <span />
          )}
          <WishlistButton compact productId={product.id} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          className="inline-flex min-h-11 items-center text-[11px] font-bold tracking-[0.01em] text-text-soft transition hover:text-primary-accent-strong sm:mt-3 md:min-h-9"
          href={`/products?brand=${product.brand.slug}`}
        >
          {product.brand.name}
        </Link>

        <Link
          className="mt-0.5 line-clamp-2 min-h-12 text-[13px] font-bold leading-6 text-text-strong transition hover:text-primary-accent-strong sm:mt-1 sm:text-sm"
          href={`/products/${product.slug}`}
        >
          {product.name}
        </Link>

        {specs.length ? (
          <div className="mt-2 hidden text-[11px] font-medium leading-5 text-text-muted sm:block">
            <span className="line-clamp-1">{specs.join(" • ")}</span>
          </div>
        ) : null}

        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] sm:mt-3">
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

        <div className="mt-auto pt-1.5 sm:pt-3">
          {pricing.hasDiscount ? (
            <del className="mb-0.5 block text-[11px] font-bold text-text-soft">
              {pricing.basePrice.toLocaleString("fa-IR")} ریال
            </del>
          ) : null}
          <PriceBlock align="start" amount={pricing.effectivePrice} showLabel={false} size="sm" />
          {isAvailable || compact ? (
            <Link className="mt-1 inline-flex min-h-11 items-center text-xs font-extrabold text-primary-accent-strong md:min-h-9" href={`/products/${product.slug}`}>
              {isAvailable ? "مشاهده و خرید" : "مشاهده محصول"}
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
