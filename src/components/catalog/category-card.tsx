import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/generated/prisma";

type CategoryCardProps = {
  category: Category & { _count: { products: number } };
};

export function CategoryCard({ category }: CategoryCardProps) {
  const hasImage = Boolean(category.imageUrl);

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-400/20"
    >
      <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
        {hasImage ? (
          <Image
            src={category.imageUrl as string}
            alt={category.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 80vw, 240px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
            <span className="text-3xl">🛢️</span>
            <p className="text-xs">تصویر موجود نیست</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
          {category._count.products} محصول
        </span>
      </div>
      {category.description && (
        <p className="text-sm leading-6 text-slate-600 line-clamp-2">{category.description}</p>
      )}
      <span className="text-xs font-semibold text-sky-600">مشاهده محصولات →</span>
    </Link>
  );
}
