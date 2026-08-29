import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/generated/prisma";

type CategoryCardProps = {
  category: Category & { _count: { products: number } };
};

export function CategoryCard({ category }: CategoryCardProps) {
  const hasProducts = category._count.products > 0;
  const productLabel = hasProducts
    ? `${category._count.products.toLocaleString("fa-IR")} محصول`
    : "در حال تکمیل";

  const copy = (
    <div className="min-w-0 flex-1 py-1">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h3 className="line-clamp-2 min-w-0 text-base font-extrabold leading-7 text-text-strong">
          {category.name}
        </h3>
        <span className="shrink-0 text-[11px] font-bold text-text-muted">{productLabel}</span>
      </div>
      {category.description ? (
        <p className="mt-1 line-clamp-2 text-xs leading-6 text-text-muted sm:text-sm">{category.description}</p>
      ) : null}
      {hasProducts ? (
        <span className="mt-2 inline-flex min-h-8 items-center text-xs font-extrabold text-primary-accent-strong">
          مشاهده محصولات
        </span>
      ) : null}
    </div>
  );

  const content = (
    <>
      {category.imageUrl ? (
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-secondary sm:h-24 sm:w-28">
          <Image
            alt={category.name}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            fill
            sizes="(max-width: 640px) 96px, 112px"
            src={category.imageUrl}
          />
        </div>
      ) : null}
      {copy}
    </>
  );

  return hasProducts ? (
    <Link
      className="group flex min-w-0 items-center gap-3 border-b border-border py-4 transition hover:border-primary-accent-strong/40 sm:gap-4"
      href={`/products?category=${category.slug}`}
    >
      {content}
    </Link>
  ) : (
    <div className="flex min-w-0 items-center gap-3 border-b border-border py-4 opacity-65 sm:gap-4">
      {content}
    </div>
  );
}
