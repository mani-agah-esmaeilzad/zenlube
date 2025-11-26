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
      <section className="layout-shell space-y-4 pt-10">
        <header className="flex flex-col gap-4 text-slate-700">
          <h1 className="text-3xl font-semibold text-slate-900">فروشگاه تخصصی روغن موتور Oilbar</h1>
          <p className="text-sm leading-7 text-slate-600">
            با استفاده از فیلترهای سمت راست می‌توانید محصولات را بر اساس برند، دسته و خودرو محدود کنید و تجربه‌ای شبیه وب‌سایت‌های صنعتی استاندارد داشته باشید.
          </p>
        </header>
      </section>

      <section className="layout-shell grid gap-8 lg:grid-cols-[0.9fr,2fr]">
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <form className="space-y-4 rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_25px_50px_rgba(15,23,42,0.08)]" method="get">
            <p className="text-sm font-semibold text-slate-900">فیلتر محصولات</p>
            <FilterField label="جستجو" htmlFor="search">
              <input
                id="search"
                name="search"
                defaultValue={search}
                placeholder="نام محصول، برند یا ویسکوزیته"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
              />
            </FilterField>
            <FilterField label="دسته‌بندی" htmlFor="category">
              <select
                id="category"
                name="category"
                defaultValue={category ?? ""}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
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
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
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
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
              />
            </FilterField>
            <FilterField label="مرتب‌سازی" htmlFor="sort">
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
              >
                <option value="latest">جدیدترین</option>
                <option value="price-asc">ارزان‌ترین</option>
                <option value="price-desc">گران‌ترین</option>
                <option value="rating">بالاترین امتیاز</option>
                <option value="bestseller">پرفروش‌ترین</option>
              </select>
            </FilterField>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="flex-1 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
                اعمال فیلتر
              </button>
              <Link href="/products" className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600">
                حذف فیلترها
              </Link>
            </div>
            <span className="text-xs text-slate-500 block text-center">{pageInfo.total} نتیجه یافت شد</span>
          </form>

          <div className="space-y-3 rounded-[32px] border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">دسته‌بندی‌های محبوب</h2>
            <div className="grid gap-3">
              {categories.slice(0, 4).map((categoryItem) => (
                <CategoryCard key={categoryItem.id} category={categoryItem} />
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
            <h3 className="text-base font-semibold text-slate-900">راهنمای انتخاب</h3>
            <ol className="mt-4 space-y-2 list-decimal list-inside">
              <li>نوع موتور (بنزینی، دیزلی، هیبرید) و استاندارد خودرو را مشخص کنید.</li>
              <li>بر اساس برند یا ویسکوزیته مورد تأیید سازنده فیلتر کنید.</li>
              <li>اسلاگ خودرو را وارد کنید تا محصولات تطبیق داده شوند.</li>
            </ol>
          </div>
        </aside>

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
                  className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-emerald-200 hover:text-emerald-700"
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
                  className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  بعدی
                </Link>
              )}
            </div>
          )}
        </div>
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
