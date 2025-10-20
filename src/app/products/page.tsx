import Link from "next/link";
import { CategoryCard } from "@/components/catalog/category-card";
import { ProductCard } from "@/components/product/product-card";
import {
  getAllProductsWithFilters,
  getBrandsWithProductCount,
  getHighlightedCategories,
} from "@/lib/data";
import type { ProductSort } from "@/lib/data";

type ProductsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const brand = typeof searchParams.brand === "string" ? searchParams.brand : undefined;
  const car = typeof searchParams.car === "string" ? searchParams.car : undefined;
  const allowedSorts: ProductSort[] = ["latest", "price-asc", "price-desc", "rating", "bestseller"];
  const sort =
    typeof searchParams.sort === "string" && allowedSorts.includes(searchParams.sort as ProductSort)
      ? (searchParams.sort as ProductSort)
      : "latest";
  const page = Number(searchParams.page ?? "1") || 1;

  const [categories, brands, productsResult] = await Promise.all([
    getHighlightedCategories(),
    getBrandsWithProductCount(),
    getAllProductsWithFilters({ search, category, brand, car, sort, page }),
  ]);

  const { items, pageInfo } = productsResult;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-white">فروشگاه روغن موتور ZenLube</h1>
        <p className="text-sm leading-7 text-white/70">
          بر اساس برند، دسته‌بندی یا خودرو فیلتر کنید و بهترین روغن موتور را پیدا کنید. تمامی قیمت‌ها به‌روز و موجودی کالاها از طریق پنل مدیریت کنترل می‌شود.
        </p>
      </header>

      <form className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2 lg:grid-cols-5" method="get">
        <div className="flex flex-col gap-2">
          <label htmlFor="search" className="text-xs font-semibold text-white/70">
            جستجو
          </label>
          <input
            id="search"
            name="search"
            defaultValue={search}
            placeholder="نام محصول، برند یا ویسکوزیته"
            className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-purple-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="text-xs font-semibold text-white/70">
            دسته‌بندی
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-purple-400"
          >
            <option value="">همه دسته‌ها</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="brand" className="text-xs font-semibold text-white/70">
            برند
          </label>
          <select
            id="brand"
            name="brand"
            defaultValue={brand ?? ""}
            className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-purple-400"
          >
            <option value="">همه برندها</option>
            {brands.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="car" className="text-xs font-semibold text-white/70">
            فیلتر خودرو (اسلاگ)
          </label>
          <input
            id="car"
            name="car"
            defaultValue={car}
            placeholder="مثال: bmw-3-series-f30-320i"
            className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-purple-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="sort" className="text-xs font-semibold text-white/70">
            مرتب‌سازی
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-purple-400"
          >
            <option value="latest">جدیدترین</option>
            <option value="price-asc">ارزان‌ترین</option>
            <option value="price-desc">گران‌ترین</option>
            <option value="rating">بالاترین امتیاز</option>
            <option value="bestseller">پرفروش‌ترین</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-400"
          >
            اعمال فیلتر
          </button>
          <Link
            href="/products"
            className="rounded-full border border-white/20 px-6 py-2 text-sm text-white/70 transition hover:border-purple-300 hover:text-white"
          >
            حذف فیلترها
          </Link>
          <span className="text-xs text-white/50">{pageInfo.total} نتیجه یافت شد</span>
        </div>
      </form>

      <div className="mt-12 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {items.length ? (
            <div className="grid gap-8 md:grid-cols-2">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-black/30 p-12 text-center text-white/60">
              محصولی با فیلتر انتخابی یافت نشد.
            </div>
          )}
          {pageInfo.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4 text-sm text-white/70">
              {pageInfo.hasPreviousPage && (
                <Link
                  href={{
                    pathname: "/products",
                  query: {
                    ...searchParams,
                    page: String(page - 1),
                  },
                }}
                  className="rounded-full border border-white/20 px-4 py-2 hover:border-purple-300 hover:text-white"
                >
                  قبلی
                </Link>
              )}
              <span>
                صفحه {page} از {pageInfo.totalPages}
              </span>
              {pageInfo.hasNextPage && (
                <Link
                  href={{
                    pathname: "/products",
                  query: {
                    ...searchParams,
                    page: String(page + 1),
                  },
                }}
                  className="rounded-full border border-white/20 px-4 py-2 hover:border-purple-300 hover:text-white"
                >
                  بعدی
                </Link>
              )}
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">دسته‌بندی‌های محبوب</h2>
            <div className="grid gap-4">
              {categories.slice(0, 4).map((categoryItem) => (
                <CategoryCard key={categoryItem.id} category={categoryItem} />
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-purple-500/30 bg-purple-950/30 p-6 text-sm text-white/70">
            <h3 className="text-base font-semibold text-purple-100">چطور محصول مناسب را انتخاب کنم؟</h3>
            <ol className="mt-4 space-y-2 list-decimal list-inside">
              <li>دسته‌بندی را بر اساس نوع موتور (بنزینی، دیزلی، سنتتیک) انتخاب کنید.</li>
              <li>برند مورد اعتماد خود یا پیشنهاد ZenLube را فیلتر کنید.</li>
              <li>اگر خودرو در لیست ZenLube است، اسلاگ آن را وارد کنید تا محصولات پیشنهادی نمایش داده شوند.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
