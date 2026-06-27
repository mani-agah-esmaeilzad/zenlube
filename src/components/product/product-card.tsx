import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/catalog";

type ProductCardProps = { product: ProductWithRelations };

export function ProductCard({ product }: ProductCardProps) {
  const specs = [product.viscosity, product.oilType, product.packagingSizeLit ? `${Number(product.packagingSizeLit).toLocaleString("fa-IR")} لیتر` : null].filter(Boolean);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/10">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100" aria-label={product.name}>
        {product.isBestseller && <span className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-black text-white">پرفروش</span>}
        <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">ضمانت اصالت</span>
        {product.imageUrl ? <Image src={product.imageUrl} alt={`تصویر ${product.name}`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">بدون تصویر</div>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs"><Link href={`/products?brand=${product.brand.slug}`} className="font-bold text-orange-600">{product.brand.name}</Link>{product.averageRating ? <span className="text-amber-500">★ {Number(product.averageRating).toFixed(1)}</span> : <span className="text-slate-400">ارسال سریع</span>}</div>
        <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-12 text-sm font-extrabold leading-6 text-slate-900 transition hover:text-orange-600">{product.name}</Link>
        <div className="mt-3 flex min-h-7 flex-wrap gap-1.5 text-[11px] text-slate-500">{specs.map((s) => <span key={String(s)} className="rounded-full bg-slate-100 px-2 py-1">{s}</span>)}</div>
        <div className="mt-3 text-xs text-slate-500">{product.stock > 0 ? <span className="text-emerald-600">موجود در انبار</span> : <span className="text-red-500">ناموجود</span>}</div>
        <div className="mt-auto pt-4"><div className="mb-3 flex items-end justify-between"><span className="text-xs text-slate-400">قیمت</span><span className="text-lg font-black text-[#0f2747]">{formatPrice(product.price)}</span></div><AddToCartButton productId={product.id} className="!py-2.5" /></div>
      </div>
    </article>
  );
}
