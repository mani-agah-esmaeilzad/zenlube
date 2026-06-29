import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Pagination } from "@/components/ui/pagination";
import { getAllProductsWithFilters, getBrandsWithProductCount, getHighlightedCategories } from "@/lib/data";
import type { ProductSort } from "@/lib/data";

type ProductsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sorts: { value: ProductSort; label: string }[] = [
  { value: "bestseller", label: "پرفروش‌ترین" },
  { value: "latest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "rating", label: "مرتبط‌ترین" },
];

const quickFilters = ["0W-20", "5W-30", "5W-40", "10W-40", "تمام سنتتیک", "نیمه سنتتیک", "API SP", "ارسال فوری", "تخفیف‌دار"];
const specFilters = ["ویسکوزیته", "نوع روغن", "حجم", "API", "ACEA", "مناسب برای خودرو", "موجودی", "تخفیف‌دار"];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const brand = typeof params.brand === "string" ? params.brand : undefined;
  const car = typeof params.car === "string" ? params.car : undefined;
  const allowedSorts = sorts.map((s) => s.value);
  const sort = typeof params.sort === "string" && allowedSorts.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : "latest";
  const page = Number(params.page ?? "1") || 1;
  const [categories, brands, productsResult] = await Promise.all([
    getHighlightedCategories(),
    getBrandsWithProductCount(),
    getAllProductsWithFilters({ search, category, brand, car, sort, page }),
  ]);
  const { items, pageInfo } = productsResult;
  const activeFilters = [search, category, brand, car].filter(Boolean) as string[];

  return (
    <div className="container-zen py-6 md:py-8">
      <nav className="mb-4 text-xs font-medium text-[#6B7280]">
        <Link href="/" className="hover:text-[#D97706]">خانه</Link>
        <span className="mx-2">/</span>
        فروشگاه
      </nav>

      <header className="mb-6 rounded-[32px] border border-[#202735] bg-[#171B23] p-6 text-white shadow-[0_20px_50px_rgba(17,24,39,0.16)] md:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-[#F5C56B]">فروشگاه تخصصی</p>
          <h1 className="mt-3 text-2xl font-extrabold leading-[1.7] md:text-4xl">فروشگاه تخصصی روغن موتور و فیلتر</h1>
          <p className="mt-3 text-sm leading-8 text-white/72">
            بر اساس برند، ویسکوزیته، نوع روغن، استاندارد API و سازگاری خودرو فیلتر کنید. {pageInfo.total.toLocaleString("fa-IR")} کالا پیدا شد.
          </p>
        </div>
      </header>

      <div className="mb-4 flex gap-2 lg:hidden">
        <button className="btn-outline flex-1">فیلترها</button>
        <button className="btn-outline flex-1">مرتب‌سازی</button>
      </div>

      <form method="get" className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="hidden h-fit rounded-[28px] border border-[#E7E8EE] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)] lg:sticky lg:top-40 lg:block">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171B23]">فیلترها</h2>
            <Link href="/products" className="text-xs font-bold text-[#D97706]">حذف همه فیلترها</Link>
          </div>
          <div className="mt-5 space-y-5">
            <input type="hidden" name="page" value="1" />
            <label className="block text-xs font-bold text-[#374151]">
              جستجو
              <input name="search" defaultValue={search} className="input-zen mt-2" placeholder="نام محصول، برند، مدل خودرو" />
            </label>
            <label className="block text-xs font-bold text-[#374151]">
              دسته‌بندی
              <select name="category" defaultValue={category ?? ""} className="input-zen mt-2">
                <option value="">همه دسته‌ها</option>
                {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold text-[#374151]">
              برند
              <select name="brand" defaultValue={brand ?? ""} className="input-zen mt-2">
                <option value="">همه برندها</option>
                {brands.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold text-[#374151]">
              مناسب برای خودرو
              <input name="car" defaultValue={car} className="input-zen mt-2" placeholder="اسلاگ خودرو" />
            </label>

            <div>
              <p className="mb-3 text-xs font-bold text-[#374151]">فیلترهای فنی</p>
              <div className="space-y-2">
                {specFilters.map((item) => (
                  <label key={item} className="flex items-center justify-between rounded-xl border border-[#E7E8EE] px-3 py-2 text-xs font-medium text-[#6B7280]">
                    {item}
                    <input type="checkbox" className="size-4 accent-[#F59E0B]" />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-[#374151]">فیلترهای سریع روغن</p>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((item) => (
                  <Link key={item} href={`/products?search=${encodeURIComponent(item)}`} className="rounded-full border border-[#E7E8EE] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706]">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full">اعمال فیلتر</button>
          </div>
        </aside>

        <section>
          <div className="mb-5 rounded-[24px] border border-[#E7E8EE] bg-white p-4 shadow-[0_10px_28px_rgba(17,24,39,0.04)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-h-8 flex-wrap gap-2">
                {activeFilters.length ? activeFilters.map((item) => (
                  <span key={item} className="rounded-full bg-[#FFF8E8] px-3 py-1.5 text-xs font-bold text-[#D97706]">{item}</span>
                )) : <span className="text-sm text-[#6B7280]">همه محصولات فروشگاه</span>}
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#374151]">
                مرتب‌سازی
                <select name="sort" defaultValue={sort} className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                  {sorts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <button className="btn-secondary !min-h-9 !rounded-xl !px-4 !py-2 text-xs">اعمال</button>
              </label>
            </div>
          </div>

          {items.length ? (
            <div className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3">
              {items.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#E7E8EE] bg-white p-10 text-center">
              <p className="text-xl font-extrabold text-[#171B23]">محصولی با این فیلترها پیدا نشد</p>
              <p className="mt-2 text-sm text-[#6B7280]">فیلترها را تغییر دهید یا از راهنمای انتخاب روغن کمک بگیرید.</p>
              <Link href="/products" className="btn-primary mt-5">حذف فیلترها</Link>
            </div>
          )}

          <Pagination pathname="/products" searchParams={params} pageInfo={pageInfo} />
        </section>
      </form>
    </div>
  );
}
