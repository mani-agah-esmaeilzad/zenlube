import Link from "next/link";
import type { Category } from "@/generated/prisma";

type CategoryCardProps = {
  category: Category & { _count: { products: number } };
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-500/15"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
          {category._count.products} محصول
        </span>
      </div>
      {category.description && (
        <p className="text-sm leading-6 text-slate-600 line-clamp-3">{category.description}</p>
      )}
      <span className="text-xs font-medium text-sky-600">
        مشاهده محصولات →
      </span>
    </Link>
  );
}
