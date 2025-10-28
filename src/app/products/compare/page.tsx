import Link from "next/link";
import { ProductComparisonBoard } from "@/components/product/product-comparison-board";
import { getAllProductsLite } from "@/lib/data";

export const metadata = {
  title: "مقایسه تخصصی روغن موتور | ZenLube",
};

export default async function ProductComparisonPage() {
  const products = await getAllProductsLite();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12 text-white">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
        >
          ← بازگشت به فروشگاه
        </Link>
      </div>
      <ProductComparisonBoard products={products} />
    </div>
  );
}
