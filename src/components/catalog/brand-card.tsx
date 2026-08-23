import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandCardProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-4 rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {brand.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={brand.name} className="h-10 w-auto max-w-[80px] object-contain" src={brand.imageUrl} />
          ) : null}
          <h3 className="line-clamp-2 min-w-0 text-base font-extrabold text-text-strong">{brand.name}</h3>
        </div>
        <span className="chip-zen shrink-0 px-3 py-1 text-xs">{brand._count.products.toLocaleString("fa-IR")} محصول</span>
      </div>
      {brand.description ? <p className="text-sm leading-7 text-text-muted">{brand.description}</p> : null}
      <div className="mt-auto flex flex-col gap-2 text-xs text-text-muted sm:flex-row sm:flex-wrap sm:gap-3">
        <Link className="btn-outline !min-h-10 rounded-xl px-3 text-xs font-bold" href={`/products?brand=${brand.slug}`}>
          محصولات این برند
        </Link>
        {brand.website ? (
          <a
            className="btn-ghost !min-h-10 rounded-xl px-3 text-xs font-bold"
            href={brand.website}
            rel="noreferrer"
            target="_blank"
          >
            وب‌سایت رسمی
          </a>
        ) : null}
      </div>
    </div>
  );
}
