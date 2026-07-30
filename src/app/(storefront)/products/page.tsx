import Link from "next/link";
import { MobileProductsControls } from "@/components/catalog/mobile-products-controls";
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const brand = typeof params.brand === "string" ? params.brand : undefined;
  const car = typeof params.car === "string" ? params.car : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) || undefined : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) || undefined : undefined;
  const inStock = params.inStock === "1";
  const minRating = typeof params.minRating === "string" ? Number(params.minRating) || undefined : undefined;
  const allowedSorts = sorts.map((s) => s.value);
  const sort = typeof params.sort === "string" && allowedSorts.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : "latest";
  const page = Number(params.page ?? "1") || 1;
  const [categories, brands, productsResult] = await Promise.all([
    getHighlightedCategories(),
    getBrandsWithProductCount(),
    getAllProductsWithFilters({ search, category, brand, car, minPrice, maxPrice, inStock, minRating, sort, page }),
  ]);
  const { items, pageInfo } = productsResult;
  const sortLabel = sorts.find((item) => item.value === sort)?.label ?? sorts[0].label;
  const activeFilters = [
    search,
    category,
    brand,
    car,
    minPrice ? `از ${minPrice.toLocaleString("fa-IR")} تومان` : null,
    maxPrice ? `تا ${maxPrice.toLocaleString("fa-IR")} تومان` : null,
    inStock ? "فقط موجود" : null,
    minRating ? `${minRating} ستاره و بیشتر` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="container-zen py-6 md:py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-text-muted">
        <Link href="/" className="hover:text-primary-accent-strong">خانه</Link>
        <span>/</span>
        <span>فروشگاه</span>
      </nav>

      <header className="panel-zen relative mb-5 overflow-hidden rounded-[32px] p-5 sm:p-6 md:mb-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(251,252,254,0.8)_100%)]" />
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-[1.62rem] font-black leading-[1.65] text-text-strong sm:text-[1.95rem]">فروشگاه تخصصی روغن موتور و فیلتر</h1>
            <p className="mt-2 text-sm leading-8 text-text-muted">
              بر اساس برند، ویسکوزیته، نوع روغن و سازگاری خودرو فیلتر کنید. {pageInfo.total.toLocaleString("fa-IR")} کالا در این بخش پیدا شد.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 sm:max-w-md">
            <div className="metric-zen rounded-[22px]">
              <span className="text-[11px] font-bold text-text-muted">تعداد کالا</span>
              <p className="mt-1 text-lg font-black text-text-strong">{pageInfo.total.toLocaleString("fa-IR")}</p>
            </div>
            <div className="metric-zen rounded-[22px]">
              <span className="text-[11px] font-bold text-text-muted">دسته‌ها</span>
              <p className="mt-1 text-lg font-black text-text-strong">{categories.length.toLocaleString("fa-IR")}</p>
            </div>
            <div className="metric-zen rounded-[22px]">
              <span className="text-[11px] font-bold text-text-muted">برندها</span>
              <p className="mt-1 text-lg font-black text-text-strong">{brands.length.toLocaleString("fa-IR")}</p>
            </div>
          </div>
        </div>

        {activeFilters.length ? (
          <div className="relative z-10 mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
            {activeFilters.map((item) => (
              <span key={item} className="chip-zen px-3 py-1.5 text-xs">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <MobileProductsControls
        activeFilters={activeFilters}
        brands={brands.map((item) => ({ id: item.id, name: item.name, slug: item.slug }))}
        categories={categories.map((item) => ({ id: item.id, name: item.name, slug: item.slug }))}
        currentSortLabel={sortLabel}
        defaults={{ brand, car, category, inStock, maxPrice, minPrice, minRating, search, sort }}
        quickFilters={quickFilters}
        resultsCount={pageInfo.total}
        sorts={sorts}
      />

      <form method="get" className="grid gap-6 lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[288px_minmax(0,1fr)]">
        <aside className="panel-zen hidden h-fit rounded-[28px] p-5 lg:sticky lg:top-32 lg:block">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-text-strong">فیلترها</h2>
            <Link href="/products" className="text-xs font-bold text-primary-accent-strong">حذف همه فیلترها</Link>
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
              <input name="car" defaultValue={car} className="input-zen mt-2" placeholder="مدل یا اسلاگ خودرو" />
            </label>

            <div className="grid gap-3 xl:grid-cols-2">
              <label className="block text-xs font-bold text-[#374151]">
                حداقل قیمت
                <input name="minPrice" defaultValue={minPrice} className="input-zen mt-2" placeholder="مثلاً 500000" />
              </label>
              <label className="block text-xs font-bold text-[#374151]">
                حداکثر قیمت
                <input name="maxPrice" defaultValue={maxPrice} className="input-zen mt-2" placeholder="مثلاً 5000000" />
              </label>
            </div>

            <label className="panel-zen-muted flex items-center justify-between rounded-xl px-3 py-3 text-xs font-medium text-text-muted">
              فقط کالاهای موجود
              <input type="checkbox" name="inStock" value="1" defaultChecked={inStock} className="size-4 accent-[#F59E0B]" />
            </label>

            <label className="block text-xs font-bold text-[#374151]">
              حداقل امتیاز
              <select name="minRating" defaultValue={minRating ?? ""} className="input-zen mt-2">
                <option value="">همه امتیازها</option>
                <option value="4">۴ ستاره و بیشتر</option>
                <option value="3">۳ ستاره و بیشتر</option>
              </select>
            </label>

            <div>
              <p className="mb-2 text-xs font-bold text-[#374151]">فیلترهای سریع روغن</p>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((item) => (
                  <Link key={item} href={`/products?search=${encodeURIComponent(item)}`} className="chip-zen-muted interactive-lift rounded-full border px-3 py-1.5 text-xs font-semibold text-text-muted">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full">اعمال فیلتر</button>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="panel-zen-muted mb-5 hidden rounded-[24px] p-4 lg:block">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-h-8 min-w-0 flex-wrap gap-2">
                {activeFilters.length ? activeFilters.map((item) => (
                  <span key={item} className="chip-zen px-3 py-1.5 text-xs">{item}</span>
                )) : <span className="text-sm text-text-muted">همه محصولات فروشگاه</span>}
              </div>
              <label className="hidden items-center gap-2 text-xs font-bold text-[#374151] lg:flex">
                مرتب‌سازی
                <select name="sort" defaultValue={sort} className="input-zen !min-h-10 rounded-xl px-3 py-2">
                  {sorts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <button className="btn-secondary !min-h-9 !rounded-xl !px-4 !py-2 text-xs">اعمال</button>
              </label>
            </div>
          </div>

          {items.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-5">
              {items.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="panel-zen-muted rounded-[28px] p-8 text-center sm:p-10">
              <p className="text-xl font-extrabold text-text-strong">محصولی با این فیلترها پیدا نشد</p>
              <p className="mt-2 text-sm text-text-muted">فیلترها را تغییر دهید یا از راهنمای انتخاب روغن کمک بگیرید.</p>
              <Link href="/products" className="btn-primary mt-5">حذف فیلترها</Link>
            </div>
          )}

          <Pagination pathname="/products" searchParams={params} pageInfo={pageInfo} />
        </section>
      </form>
    </div>
  );
}
