import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandCardProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <div className="panel-zen interactive-lift flex h-full min-w-0 flex-col gap-4 rounded-[28px] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="line-clamp-2 min-w-0 text-base font-extrabold text-text-strong sm:text-lg">{brand.name}</h3>
        <span className="chip-zen shrink-0 px-3 py-1 text-xs">
          {brand._count.products} محصول
        </span>
      </div>
      {brand.description && <p className="text-sm leading-7 text-text-muted">{brand.description}</p>}
      <div className="mt-auto flex flex-col gap-2 text-xs text-text-muted sm:flex-row sm:flex-wrap sm:gap-3">
        <Link
          href={`/products?brand=${brand.slug}`}
          className="chip-zen-muted interactive-lift rounded-full border px-3 py-1.5 font-bold"
        >
          محصولات این برند
        </Link>
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="chip-zen-muted interactive-lift rounded-full border px-3 py-1.5 font-bold"
          >
            وب‌سایت رسمی
          </a>
        )}
      </div>
    </div>
  );
}
