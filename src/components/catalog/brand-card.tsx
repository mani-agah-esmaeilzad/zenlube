import Link from "next/link";
import type { Brand } from "@/generated/prisma";

type BrandCardProps = {
  brand: Brand & { _count: { products: number } };
};

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-[28px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-[#F5C56B] hover:shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#171B23]">{brand.name}</h3>
        <span className="rounded-full bg-[#FFF8E8] px-3 py-1 text-xs font-bold text-[#D97706]">
          {brand._count.products} محصول
        </span>
      </div>
      {brand.description && <p className="text-sm leading-7 text-[#667085]">{brand.description}</p>}
      <div className="mt-auto flex flex-wrap gap-3 text-xs text-[#667085]">
        <Link
          href={`/products?brand=${brand.slug}`}
          className="rounded-full border border-[#E7E8EE] px-3 py-1.5 font-bold transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706]"
        >
          محصولات این برند
        </Link>
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#E7E8EE] px-3 py-1.5 font-bold transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706]"
          >
            وب‌سایت رسمی
          </a>
        )}
      </div>
    </div>
  );
}
