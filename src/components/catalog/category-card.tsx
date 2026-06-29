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
      className="group flex h-full flex-col gap-4 rounded-[28px] border border-[#E7E8EE] bg-white p-4 text-sm text-[#667085] shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-[#F5C56B] hover:shadow-[0_24px_64px_rgba(15,23,42,0.12)]"
    >
      <div className="relative h-40 w-full overflow-hidden rounded-[22px] border border-[#EEF0F5] bg-[#F7F8FA]">
        {hasImage ? (
          <Image
            src={category.imageUrl as string}
            alt={category.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 80vw, 240px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[#98A2B3]">
            <span className="text-3xl">🛢️</span>
            <p className="text-xs">تصویر موجود نیست</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171B23]/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#171B23]">{category.name}</h3>
        <span className="rounded-full bg-[#FFF8E8] px-3 py-1 text-xs font-bold text-[#D97706]">
          {category._count.products} محصول
        </span>
      </div>
      {category.description && (
        <p className="line-clamp-2 text-sm leading-7 text-[#667085]">{category.description}</p>
      )}
      <span className="text-xs font-bold text-[#D97706]">مشاهده محصولات ←</span>
    </Link>
  );
}
