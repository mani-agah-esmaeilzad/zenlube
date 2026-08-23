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
      className="group flex h-full min-w-0 flex-col gap-4 rounded-2xl border border-border bg-white p-4 text-sm text-text-muted transition hover:border-[rgba(217,119,6,0.28)]"
      href={`/products?category=${category.slug}`}
    >
      <div className="relative h-32 w-full overflow-hidden rounded-xl bg-surface-secondary sm:h-40">
        {hasImage ? (
          <Image
            alt={category.name}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            fill
            sizes="(max-width: 768px) 80vw, 240px"
            src={category.imageUrl as string}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-primary-accent-strong">
            {category.name.trim().charAt(0)}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="line-clamp-2 min-w-0 text-base font-extrabold text-text-strong">{category.name}</h3>
        <span className="chip-zen shrink-0 px-3 py-1 text-xs">{category._count.products.toLocaleString("fa-IR")} محصول</span>
      </div>
      {category.description ? <p className="line-clamp-2 text-sm leading-7 text-text-muted">{category.description}</p> : null}
      <span className="text-xs font-bold text-primary-accent-strong">مشاهده محصولات</span>
    </Link>
  );
}
