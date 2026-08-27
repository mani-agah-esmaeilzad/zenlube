import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandCardProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandCard({ brand }: BrandCardProps) {
  const hasProducts = brand._count.products > 0;

  return (
    <article className={`flex h-full min-w-0 flex-col rounded-2xl border p-4 sm:p-5 ${hasProducts ? "border-border bg-white" : "border-border bg-surface-secondary opacity-75"}`}>
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2 sm:size-16">
          {brand.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={brand.name} className="h-full w-full object-contain" src={brand.imageUrl} />
          ) : (
            <span className="text-xl font-black text-primary-accent-strong">{brand.name.trim().charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 min-w-0 text-base font-extrabold leading-7 text-text-strong">{brand.name}</h3>
            <span className="shrink-0 text-[11px] font-bold text-text-muted">
              {hasProducts ? `${brand._count.products.toLocaleString("fa-IR")} محصول` : "در حال تکمیل"}
            </span>
          </div>
          {brand.description ? <p className="mt-2 line-clamp-2 text-xs leading-6 text-text-muted sm:text-sm">{brand.description}</p> : null}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-text-muted">
        {hasProducts ? (
          <Link className="font-extrabold text-primary-accent-strong transition hover:text-[#B45309]" href={`/products?brand=${brand.slug}`}>
            مشاهده محصولات
          </Link>
        ) : (
          <span>هنوز محصولی ثبت نشده است</span>
        )}
        {brand.website ? (
          <a
            className="shrink-0 font-bold text-text-muted transition hover:text-text-strong"
            href={brand.website}
            rel="noreferrer"
            target="_blank"
          >
            وب‌سایت رسمی
          </a>
        ) : null}
      </div>
    </article>
  );
}
