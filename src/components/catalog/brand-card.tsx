import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandCardProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{brand.name}</h3>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
          {brand._count.products} محصول
        </span>
      </div>
      {brand.description && <p className="text-sm leading-6 text-slate-600">{brand.description}</p>}
      <div className="flex gap-3 text-xs text-slate-600">
        <Link
          href={`/products?brand=${brand.slug}`}
          className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-sky-200 hover:text-sky-700"
        >
          محصولات این برند
        </Link>
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-sky-200 hover:text-sky-700"
          >
            وب‌سایت رسمی
          </a>
        )}
      </div>
    </div>
  );
}
