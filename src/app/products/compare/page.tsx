import Link from "next/link";
import { ProductComparisonBoard } from "@/components/product/product-comparison-board";
import { getAllProductsLite } from "@/lib/data";

export const metadata = {
  title: "مقایسه تخصصی روغن موتور | Oilbar",
};

export default async function ProductComparisonPage() {
  const products = await getAllProductsLite();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12 text-slate-700">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-sky-200 hover:text-slate-900"
        >
          ← بازگشت به فروشگاه
        </Link>
      </div>
      <ProductComparisonBoard products={products} />
    </div>
  );
}
