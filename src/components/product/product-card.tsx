import Image from "next/image";
import Link from "next/link";

import { WishlistButton } from "@/components/product/wishlist-button";
import { StatusPill } from "@/components/ui/status-pill";
import { formatProductCardPrice, getProductCardContent } from "@/lib/product-card-content";
import { resolveProductPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/catalog";

type ProductCardProps = {
  product: ProductWithRelations;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const content = getProductCardContent(product);
  const pricing = resolveProductPricing(product);
  const isAvailable = product.stock > 0 && pricing.effectivePrice > 0;
  const href = `/products/${product.slug}`;
  const hasPaddedPhoto = product.imageUrl?.includes("/products/persia-sign/up-to-5-450ml") ?? false;

  return (
    <article
      className={cn(
        "product-card group relative h-full min-w-0 bg-white",
        product.imageUrl
          ? "grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 sm:flex sm:flex-col"
          : "flex flex-col",
      )}
      data-product-slug={product.slug}
    >
      <div className="absolute left-0 top-0 z-10 sm:left-2 sm:top-2">
        <WishlistButton className="product-card-wishlist" compact productId={product.id} />
      </div>

      {product.imageUrl ? (
        <Link
          aria-label={product.name}
          className="relative block aspect-[4/5] overflow-hidden bg-white sm:aspect-[10/9]"
          href={href}
        >
          <Image
            alt={`تصویر ${product.name}`}
            className={cn(
              "object-contain p-1 transition duration-300 sm:p-3",
              hasPaddedPhoto
                ? "scale-[1.7] group-hover:scale-[1.73] sm:scale-[1.35] sm:group-hover:scale-[1.38]"
                : "group-hover:scale-[1.03]",
            )}
            fill
            priority={priority}
            sizes="(max-width:639px) 104px, (max-width:1023px) 50vw, (max-width:1535px) 33vw, 280px"
            src={product.imageUrl}
          />
          {pricing.hasDiscount && isAvailable ? (
            <div className="absolute right-2 top-2 hidden sm:block">
              <StatusPill className="px-2 py-0.5 text-[10px]" tone="warning">{pricing.label}</StatusPill>
            </div>
          ) : null}
        </Link>
      ) : null}

      <div className="min-w-0 pt-2 sm:mb-3 sm:mt-3 sm:pt-0">
        <Link
          className="product-card-brand inline-flex min-h-7 items-center pl-11 text-xs font-medium transition sm:pl-0"
          href={`/products?brand=${product.brand.slug}`}
        >
          {product.brand.name}
        </Link>

        <Link
          aria-label={product.name}
          className="product-card-title mt-1 block text-[15px] font-semibold leading-7 transition sm:text-base"
          href={href}
          title={product.name}
        >
          <span className="line-clamp-2">{content.title}</span>
        </Link>

        {content.model || content.volume ? (
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[13px] leading-6 text-text-muted">
            {content.model ? <bdi className="min-w-0 [overflow-wrap:anywhere]" dir="auto">{content.model}</bdi> : null}
            {content.model && content.volume ? <span aria-hidden="true" className="text-text-soft">|</span> : null}
            {content.volume ? <span className="whitespace-nowrap">{content.volume}</span> : null}
          </p>
        ) : null}

        <p className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-medium", isAvailable ? "text-success" : "text-error")}>
          <span aria-hidden="true" className={cn("size-1.5 rounded-full", isAvailable ? "bg-success" : "bg-error")} />
          {isAvailable ? "موجود" : "ناموجود"}
        </p>
      </div>

      <div className="col-span-2 mt-3 flex min-w-0 items-center justify-between gap-2 border-t border-border py-1.5 sm:mt-auto sm:pt-2">
        <Link className="product-card-action inline-flex min-h-11 shrink-0 items-center gap-1 text-xs font-medium" href={href}>
          مشاهده محصول
          <svg aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        {isAvailable ? (
          <div className="min-w-0 text-left" data-product-price>
            {pricing.hasDiscount ? (
              <del className="mb-0.5 block text-[11px] text-text-soft">
                <bdi dir="ltr">{formatProductCardPrice(pricing.basePrice)}</bdi> تومان
              </del>
            ) : null}
            <p className="inline-flex max-w-full items-baseline gap-1.5 whitespace-nowrap" dir="ltr">
              <span className="text-[11px] font-medium text-text-muted" dir="rtl">تومان</span>
              <bdi className="text-xl font-extrabold leading-8 text-text-strong sm:text-[22px]" dir="ltr">
                {formatProductCardPrice(pricing.effectivePrice)}
              </bdi>
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
