import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/catalog";

type ProductCardProps = {
  product: ProductWithRelations;
};

export function ProductCard({ product }: ProductCardProps) {
  const specs = [
    product.viscosity,
    product.oilType,
    product.packagingSizeLit ? `${Number(product.packagingSizeLit).toLocaleString("fa-IR")} لیتر` : null,
  ].filter(Boolean);

  const rating = product.averageRating ? Number(product.averageRating).toFixed(1) : null;
  const isAvailable = product.stock > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#E7E8EE] bg-white transition hover:-translate-y-1 hover:border-[#F5C56B] hover:shadow-[0_18px_44px_rgba(17,24,39,0.12)]">
      <Link aria-label={product.name} className="relative block bg-[#F7F8FA] p-4" href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-[18px] bg-white">
          {product.imageUrl ? (
            <Image
              alt={`تصویر ${product.name}`}
              className="object-contain p-3 transition duration-500 group-hover:scale-105"
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              src={product.imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-medium text-[#98A2B3]">بدون تصویر</div>
          )}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {product.isBestseller ? (
            <span className="rounded-full bg-[#171B23] px-2.5 py-1 text-[11px] font-bold text-white">پرفروش</span>
          ) : null}
          {product.isFeatured ? (
            <span className="rounded-full bg-[#F59E0B] px-2.5 py-1 text-[11px] font-bold text-white">پیشنهاد ویژه</span>
          ) : null}
        </div>

        <button
          aria-label="افزودن به علاقه‌مندی"
          className="absolute left-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-[#E7E8EE] bg-white text-[#667085] transition hover:border-[#F5C56B] hover:text-[#D97706]"
          type="button"
        >
          <HeartIcon className="h-4 w-4" />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Link
            className="rounded-full bg-[#FFF8E8] px-2.5 py-1 text-[11px] font-bold text-[#D97706] transition hover:text-[#B45309]"
            href={`/products?brand=${product.brand.slug}`}
          >
            {product.brand.name}
          </Link>

          {rating ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F59E0B]">
              <StarIcon className="h-4 w-4 fill-current" />
              {Number(rating).toLocaleString("fa-IR")}
              {product.reviewCount ? (
                <span className="font-medium text-[#98A2B3]">({product.reviewCount.toLocaleString("fa-IR")})</span>
              ) : null}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-[#667085]">تازه اضافه شده</span>
          )}
        </div>

        <Link
          className="line-clamp-2 min-h-11 text-sm font-semibold leading-6 text-[#1F2937] transition hover:text-[#D97706]"
          href={`/products/${product.slug}`}
        >
          {product.name}
        </Link>

        <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
          {specs.slice(0, 3).map((spec) => (
            <span key={String(spec)} className="rounded-full border border-[#E7E8EE] px-2 py-1 text-[11px] font-medium text-[#667085]">
              {spec}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className={isAvailable ? "font-bold text-[#16A34A]" : "font-bold text-[#DC2626]"}>
            {isAvailable ? "موجود" : "ناموجود"}
          </span>
          <span className="text-[#667085]">ضمانت اصالت</span>
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-end justify-between gap-2">
            <span className="text-xs font-medium text-[#667085]">قیمت</span>
            <div className="text-left">
              {product.isFeatured ? (
                <div className="mb-1 text-xs text-[#98A2B3] line-through">{formatPrice(Number(product.price) * 1.08)}</div>
              ) : null}
              <div className="text-lg font-extrabold text-[#171B23]">{formatPrice(product.price)}</div>
            </div>
          </div>
          <AddToCartButton className="w-full" disabled={!isAvailable} productId={product.id} />
        </div>
      </div>
    </article>
  );
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="m12 2 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9l6.7-.9L12 2Z" />
    </svg>
  );
}
