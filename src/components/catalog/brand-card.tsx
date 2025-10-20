import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandCardProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{brand.name}</h3>
        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-100">
          {brand._count.products} محصول
        </span>
      </div>
      {brand.description && <p className="text-sm leading-6 text-white/70">{brand.description}</p>}
      <div className="flex gap-3 text-xs text-purple-200">
        <Link href={`/products?brand=${brand.slug}`} className="rounded-full border border-white/15 px-3 py-1 hover:border-purple-400/60">
          محصولات این برند
        </Link>
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-3 py-1 hover:border-purple-400/60"
          >
            وب‌سایت رسمی
          </a>
        )}
      </div>
    </div>
  );
}
