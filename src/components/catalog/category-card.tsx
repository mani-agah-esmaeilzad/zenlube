import Link from "next/link";
import type { Category } from "@/generated/prisma";

type CategoryCardProps = {
  category: Category & { _count: { products: number } };
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-purple-400/60"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-100">
          {category._count.products} محصول
        </span>
      </div>
      {category.description && (
        <p className="text-sm leading-6 text-white/60 line-clamp-3">{category.description}</p>
      )}
      <span className="text-xs font-medium text-purple-200">
        مشاهده محصولات →
      </span>
    </Link>
  );
}
