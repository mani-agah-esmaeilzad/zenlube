import Link from "next/link";
import { ProductComparisonBoard } from "@/components/product/product-comparison-board";
import { getAllProductsLite } from "@/lib/data";

export const metadata = {
  title: "مقایسه تخصصی روغن موتور | Oilbar",
};

export default async function ProductComparisonPage() {
  const products = await getAllProductsLite();

  return (
    <div className="container-zen space-y-8 py-6 md:py-8 text-[#475467]">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="rounded-full border border-[#E7E8EE] px-4 py-2 text-sm font-bold text-[#475467] transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706]"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
      <ProductComparisonBoard products={products} />
    </div>
  );
}
