import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandPillProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandPill({ brand }: BrandPillProps) {
  return (
    <Link
      href={`/products?brand=${brand.slug}`}
      className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:border-purple-400/60 hover:text-white"
    >
      <span className="text-white">{brand.name}</span>
      <span className="rounded-full bg-purple-500/30 px-2 py-1 text-xs text-purple-100">
        {brand._count.products}
      </span>
    </Link>
  );
}
