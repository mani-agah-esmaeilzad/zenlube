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
      className="panel-zen interactive-lift group flex h-full min-w-0 flex-col gap-4 rounded-[28px] p-4 text-sm text-text-muted"
    >
      <div className="relative h-32 w-full overflow-hidden rounded-[22px] border border-[rgba(231,232,238,0.78)] bg-[linear-gradient(180deg,#F7F8FA_0%,#F2F5F8_100%)] sm:h-40">
        {hasImage ? (
          <Image
            src={category.imageUrl as string}
            alt={category.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 80vw, 240px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-text-soft">
            <span className="text-3xl">🛢️</span>
            <p className="text-xs">تصویر موجود نیست</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171B23]/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="line-clamp-2 min-w-0 text-base font-extrabold text-text-strong sm:text-lg">{category.name}</h3>
        <span className="chip-zen shrink-0 px-3 py-1 text-xs">
          {category._count.products} محصول
        </span>
      </div>
      {category.description && (
        <p className="line-clamp-2 text-sm leading-7 text-text-muted">{category.description}</p>
      )}
      <span className="text-xs font-bold text-primary-accent-strong">مشاهده محصولات ←</span>
    </Link>
  );
}
