import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/generated/prisma";

type CategoryCardProps = {
  category: Category & { _count: { products: number } };
};

export function CategoryCard({ category }: CategoryCardProps) {
  const hasImage = Boolean(category.imageUrl);
  const hasProducts = category._count.products > 0;

  const content = (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-secondary">
        {hasImage ? (
          <Image
            alt={category.name}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            fill
            sizes="(max-width: 768px) 84px, 104px"
            src={category.imageUrl as string}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-primary-accent-strong">
            {category.name.trim().charAt(0)}
          </div>
        )}
      </div>

      <div className="min-w-0 py-1">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h3 className="line-clamp-2 min-w-0 text-base font-extrabold leading-7 text-text-strong">{category.name}</h3>
          <span className="shrink-0 text-[11px] font-bold text-text-muted">
            {hasProducts ? `${category._count.products.toLocaleString("fa-IR")} محصول` : "در حال تکمیل"}
          </span>
        </div>
        {category.description ? <p className="mt-1 line-clamp-2 text-xs leading-6 text-text-muted sm:text-sm">{category.description}</p> : null}
        {hasProducts ? <span className="mt-2 inline-block text-xs font-bold text-primary-accent-strong">مشاهده محصولات</span> : null}
      </div>

      {hasProducts ? (
        <svg
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-text-soft transition group-hover:-translate-x-0.5 group-hover:text-primary-accent-strong"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      ) : null}
    </>
  );

  return hasProducts ? (
    <Link
      className="group grid min-w-0 grid-cols-[76px_minmax(0,1fr)_20px] items-center gap-3 rounded-2xl border border-border bg-white p-3 transition hover:border-[rgba(217,119,6,0.28)] sm:grid-cols-[96px_minmax(0,1fr)_20px] sm:gap-4"
      href={`/products?category=${category.slug}`}
    >
      {content}
    </Link>
  ) : (
    <div className="group grid min-w-0 grid-cols-[64px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-surface-secondary p-3 opacity-75">
      {content}
    </div>
  );
}
