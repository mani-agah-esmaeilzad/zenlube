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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const brand = typeof params.brand === "string" ? params.brand : undefined;
  const car = typeof params.car === "string" ? params.car : undefined;
  const allowedSorts: ProductSort[] = ["latest", "price-asc", "price-desc", "rating", "bestseller"];
  const sort =
    typeof params.sort === "string" && allowedSorts.includes(params.sort as ProductSort)
      ? (params.sort as ProductSort)
      : "latest";
  const page = Number(params.page ?? "1") || 1;

  const [categories, brands, productsResult] = await Promise.all([
    getHighlightedCategories(),
    getBrandsWithProductCount(),
    getAllProductsWithFilters({ search, category, brand, car, sort, page }),
  ]);

  const { items, pageInfo } = productsResult;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex flex-col gap-4 text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">فروشگاه روغن موتور ZenLube</h1>
        <p className="text-sm leading-7 text-slate-600">
          بر اساس برند، دسته‌بندی یا خودرو فیلتر کنید و بهترین روغن موتور را پیدا کنید. تمامی قیمت‌ها به‌روز و موجودی کالاها از طریق پنل مدیریت کنترل می‌شود.
        </p>
      </header>

      <form className="mt-10 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-5" method="get">
        <div className="flex flex-col gap-2">
          <label htmlFor="search" className="text-xs font-semibold text-slate-600">
            جستجو
          </label>
          <input
            id="search"
            name="search"
            defaultValue={search}
            placeholder="نام محصول، برند یا ویسکوزیته"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="text-xs font-semibold text-slate-600">
            دسته‌بندی
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
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
          <label htmlFor="brand" className="text-xs font-semibold text-slate-600">
            برند
          </label>
          <select
            id="brand"
            name="brand"
            defaultValue={brand ?? ""}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
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
          <label htmlFor="car" className="text-xs font-semibold text-slate-600">
            فیلتر خودرو (اسلاگ)
          </label>
          <input
            id="car"
            name="car"
            defaultValue={car}
            placeholder="مثال: bmw-3-series-f30-320i"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="sort" className="text-xs font-semibold text-slate-600">
            مرتب‌سازی
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
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
            className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            اعمال فیلتر
          </button>
          <Link
            href="/products"
            className="rounded-full border border-slate-200 px-6 py-2 text-sm text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
          >
            حذف فیلترها
          </Link>
          <span className="text-xs text-slate-500">{pageInfo.total} نتیجه یافت شد</span>
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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
              محصولی با فیلتر انتخابی یافت نشد.
            </div>
          )}
          {pageInfo.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4 text-sm text-slate-600">
              {pageInfo.hasPreviousPage && (
                <Link
                  href={{
                    pathname: "/products",
                    query: {
                      ...params,
                      page: String(page - 1),
                    },
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-sky-200 hover:text-sky-700"
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
                      ...params,
                      page: String(page + 1),
                    },
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-sky-200 hover:text-sky-700"
                >
                  بعدی
                </Link>
              )}
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">دسته‌بندی‌های محبوب</h2>
            <div className="grid gap-4">
              {categories.slice(0, 4).map((categoryItem) => (
                <CategoryCard key={categoryItem.id} category={categoryItem} />
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <h3 className="text-base font-semibold text-slate-900">چطور محصول مناسب را انتخاب کنم؟</h3>
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
