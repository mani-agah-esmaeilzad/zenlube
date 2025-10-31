import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandPillProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandPill({ brand }: BrandPillProps) {
  return (
    <Link
      href={`/products?brand=${brand.slug}`}
      className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 transition hover:border-sky-200 hover:text-slate-900"
    >
      <span className="text-slate-800">{brand.name}</span>
      <span className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-700">
        {brand._count.products}
      </span>
    </Link>
  );
}
