import Link from "next/link";
import { ProductComparisonBoard } from "@/components/product/product-comparison-board";
import { getAllProductsLite } from "@/lib/data";

export const metadata = {
  title: "مقایسه تخصصی روغن موتور | Oilbar",
};

export default async function ProductComparisonPage() {
  const products = await getAllProductsLite();

  return (
    <div className="container-zen space-y-5 py-5 text-text sm:space-y-6 sm:py-6 md:py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="btn-outline rounded-full px-4 py-2 text-sm font-bold"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
      <ProductComparisonBoard products={products} />
    </div>
  );
}
