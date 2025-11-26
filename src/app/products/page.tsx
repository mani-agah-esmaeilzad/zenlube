import type { ReactNode } from "react";
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
    <div className="space-y-10 bg-slate-50 pb-16">
      <section className="layout-shell space-y-6 pt-10">
        <header className="flex flex-col gap-4 text-slate-700">
          <h1 className="text-3xl font-semibold text-slate-900">فروشگاه تخصصی روغن موتور Oilbar</h1>
          <p className="text-sm leading-7 text-slate-600">
            با استفاده از فیلترهای حرفه‌ای، سریع‌تر محصول مناسب خودرو، اقلیم و سبک رانندگی خود را پیدا کنید. موجودی‌ها به‌صورت لحظه‌ای از انبار مرکزی بروزرسانی می‌شود.
          </p>
        </header>

        <form className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:grid-cols-2 lg:grid-cols-5" method="get">
          <FilterField label="جستجو" htmlFor="search">
            <input
              id="search"
              name="search"
              defaultValue={search}
              placeholder="نام محصول، برند یا ویسکوزیته"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
            />
          </FilterField>
          <FilterField label="دسته‌بندی" htmlFor="category">
            <select
              id="category"
              name="category"
              defaultValue={category ?? ""}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
            >
              <option value="">همه دسته‌ها</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="برند" htmlFor="brand">
            <select
              id="brand"
              name="brand"
              defaultValue={brand ?? ""}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
            >
              <option value="">همه برندها</option>
              {brands.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="فیلتر خودرو (اسلاگ)" htmlFor="car">
            <input
              id="car"
              name="car"
              defaultValue={car}
              placeholder="مثال: bmw-3-series-f30-320i"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
            />
          </FilterField>
          <FilterField label="مرتب‌سازی" htmlFor="sort">
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
            >
              <option value="latest">جدیدترین</option>
              <option value="price-asc">ارزان‌ترین</option>
              <option value="price-desc">گران‌ترین</option>
              <option value="rating">بالاترین امتیاز</option>
              <option value="bestseller">پرفروش‌ترین</option>
            </select>
          </FilterField>
          <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap items-center gap-4">
            <button type="submit" className="rounded-full bg-gradient-to-l from-sky-500 to-indigo-500 px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90">
              اعمال فیلتر
            </button>
            <Link href="/products" className="rounded-full border border-slate-200 px-6 py-2 text-sm text-slate-600 transition hover:border-sky-200 hover:text-sky-700">
              حذف فیلترها
            </Link>
            <span className="text-xs text-slate-500">{pageInfo.total} نتیجه یافت شد</span>
          </div>
        </form>
      </section>

      <section className="layout-shell grid gap-10 lg:grid-cols-[2fr,0.9fr]">
        <div>
          {items.length ? (
            <div className="grid gap-8 md:grid-cols-2">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
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
          <div className="space-y-3 rounded-[32px] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">دسته‌بندی‌های محبوب</h2>
            <div className="grid gap-4">
              {categories.slice(0, 4).map((categoryItem) => (
                <CategoryCard key={categoryItem.id} category={categoryItem} />
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <h3 className="text-base font-semibold text-slate-900">چطور محصول مناسب را انتخاب کنم؟</h3>
            <ol className="mt-4 space-y-2 list-decimal list-inside">
              <li>نوع موتور و سطح استاندارد خودرو را مشخص کنید.</li>
              <li>برند مورد اعتماد یا پیشنهاد Oilbar را انتخاب کنید.</li>
              <li>در صورت موجود بودن خودرو در دیتابیس، اسلاگ آن را وارد کنید.</li>
            </ol>
          </div>
        </aside>
      </section>
    </div>
  );
}

function FilterField({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
      {label}
      {children}
    </label>
  );
}
