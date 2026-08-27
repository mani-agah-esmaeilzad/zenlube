import Link from "next/link";
import { ProductComparisonBoard } from "@/components/product/product-comparison-board";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import { getAllProductsLite } from "@/lib/data";

export const metadata = {
  title: "مقایسه تخصصی روغن موتور | Oilbar",
};

export default async function ProductComparisonPage() {
  const products = await getAllProductsLite();

  return (
    <div className="container-zen space-y-5 py-5 text-text sm:space-y-6 sm:py-6 md:py-8">
      <StorefrontPageIntro
        actions={<Link href="/products" className="btn-outline w-full bg-white lg:w-auto">بازگشت به فروشگاه</Link>}
        compact
        description="حداکثر سه محصول را کنار هم بگذارید و ویسکوزیته، استاندارد و قیمت را با یک ساختار خوانا بررسی کنید."
        meta={`${products.length.toLocaleString("fa-IR")} محصول قابل انتخاب`}
        title="مقایسه تخصصی روغن موتور"
      />
      <ProductComparisonBoard products={products} />
    </div>
  );
}
