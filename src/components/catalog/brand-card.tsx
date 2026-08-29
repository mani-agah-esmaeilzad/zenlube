import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandCardProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandCard({ brand }: BrandCardProps) {
  const hasProducts = brand._count.products > 0;

  return (
    <article className={`flex min-w-0 items-start gap-4 border-b border-border py-4 sm:py-5 ${hasProducts ? "" : "opacity-65"}`}>
      {brand.imageUrl ? (
        <div className="flex h-16 w-20 shrink-0 items-center justify-center bg-white sm:h-20 sm:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={brand.name} className="h-full w-full object-contain" loading="lazy" src={brand.imageUrl} />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start justify-between gap-3">
          {hasProducts ? (
            <Link
              className="line-clamp-2 min-h-11 min-w-0 text-base font-extrabold leading-7 text-text-strong transition hover:text-primary-accent-strong md:min-h-8"
              href={`/products?brand=${brand.slug}`}
            >
              {brand.name}
            </Link>
          ) : (
            <h3 className="line-clamp-2 min-w-0 text-base font-extrabold leading-7 text-text-strong">{brand.name}</h3>
          )}
          <span className="shrink-0 text-[11px] font-bold text-text-muted">
            {hasProducts ? `${brand._count.products.toLocaleString("fa-IR")} محصول` : "در حال تکمیل"}
          </span>
        </div>

        {brand.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-6 text-text-muted sm:text-sm">{brand.description}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
          {hasProducts ? (
            <Link
              className="inline-flex min-h-11 items-center font-extrabold text-primary-accent-strong transition hover:text-[#B45309] md:min-h-8"
              href={`/products?brand=${brand.slug}`}
            >
              مشاهده محصولات
            </Link>
          ) : (
            <span className="text-text-muted">هنوز محصولی ثبت نشده است</span>
          )}
          {brand.website ? (
            <a
              className="inline-flex min-h-11 items-center font-bold text-text-muted transition hover:text-text-strong md:min-h-8"
              href={brand.website}
              rel="noreferrer"
              target="_blank"
            >
              وب‌سایت رسمی
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
