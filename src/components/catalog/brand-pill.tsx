import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandPillProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandPill({ brand }: BrandPillProps) {
  const hasImage = Boolean(brand.imageUrl);

  return (
    <Link
      href={`/products?brand=${brand.slug}`}
      className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-sky-200 hover:text-slate-900"
    >
      <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-100 bg-slate-100">
        {hasImage ? (
          <Image
            src={brand.imageUrl as string}
            alt={brand.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            {brand.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-slate-800">{brand.name}</span>
        <span className="text-[11px] text-slate-400">{brand._count.products} محصول</span>
      </div>
    </Link>
  );
}
