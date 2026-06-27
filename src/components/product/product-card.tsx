import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/catalog";

type ProductCardProps = { product: ProductWithRelations };

export function ProductCard({ product }: ProductCardProps) {
  const specs = [
    product.viscosity,
    product.oilType,
    product.packagingSizeLit ? `${Number(product.packagingSizeLit).toLocaleString("fa-IR")} لیتر` : null,
  ].filter(Boolean);
  const rating = product.averageRating ? Number(product.averageRating).toFixed(1) : null;
  const isAvailable = product.stock > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_18px_44px_rgba(17,24,39,0.12)]">
      <Link href={`/products/${product.slug}`} className="relative block bg-[#F7F7F8] p-4" aria-label={product.name}>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={`تصویر ${product.name}`}
              fill
              className="object-contain p-3 transition duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-medium text-[#9CA3AF]">بدون تصویر</div>
          )}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {product.isBestseller && (
            <span className="rounded-full bg-[#EF394E] px-2.5 py-1 text-[11px] font-bold text-white">پرفروش</span>
          )}
          {product.isFeatured && (
            <span className="rounded-full bg-[#F59E0B] px-2.5 py-1 text-[11px] font-bold text-white">پیشنهاد ویژه</span>
          )}
        </div>
        <button
          type="button"
          aria-label="افزودن به علاقه‌مندی"
          className="absolute left-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:border-red-200 hover:text-red-600"
        >
          <HeartIcon className="h-4 w-4" />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Link href={`/products?brand=${product.brand.slug}`} className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-bold text-[#374151] transition hover:text-red-600">
            {product.brand.name}
          </Link>
          {rating ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F59E0B]">
              <StarIcon className="h-4 w-4 fill-current" />
              {Number(rating).toLocaleString("fa-IR")}
              {product.reviewCount ? <span className="font-medium text-[#9CA3AF]">({product.reviewCount.toLocaleString("fa-IR")})</span> : null}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-[#6B7280]">تازه اضافه شده</span>
          )}
        </div>

        <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-11 text-sm font-semibold leading-6 text-[#1F2937] transition hover:text-red-600">
          {product.name}
        </Link>

        <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
          {specs.slice(0, 3).map((spec) => (
            <span key={String(spec)} className="rounded-full border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#6B7280]">
              {spec}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className={isAvailable ? "font-bold text-[#16A34A]" : "font-bold text-[#DC2626]"}>
            {isAvailable ? "موجود" : "ناموجود"}
          </span>
          <span className="text-[#6B7280]">ضمانت اصالت</span>
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-end justify-between gap-2">
            <span className="text-xs font-medium text-[#6B7280]">قیمت</span>
            <div className="text-left">
              {product.isFeatured && <div className="mb-1 text-xs text-[#9CA3AF] line-through">{formatPrice(Number(product.price) * 1.08)}</div>}
              <div className="text-lg font-extrabold text-[#111827]">{formatPrice(product.price)}</div>
            </div>
          </div>
          <AddToCartButton productId={product.id} disabled={!isAvailable} className="w-full" />
        </div>
      </div>
    </article>
  );
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m12 2 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9l6.7-.9L12 2Z" />
    </svg>
  );
}
