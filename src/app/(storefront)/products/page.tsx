import Link from "next/link";

import { ProductFilterFields } from "@/components/catalog/product-filter-fields";
import { MobileProductsControls } from "@/components/catalog/mobile-products-controls";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import { getAllProductsWithFilters, getBrandsWithProductCount, getHighlightedCategories, getProductFilterFacets } from "@/lib/data";
import type { ProductSort } from "@/lib/data";

type ProductsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sorts: { value: ProductSort; label: string }[] = [
  { value: "bestseller", label: "پرفروش‌ترین" },
  { value: "latest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "rating", label: "بالاترین امتیاز" },
];
const allowedSorts = sorts.map((item) => item.value);

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const brand = typeof params.brand === "string" ? params.brand : undefined;
  const car = typeof params.car === "string" ? params.car : undefined;
  const viscosity = typeof params.viscosity === "string" ? params.viscosity : undefined;
  const oilType = typeof params.oilType === "string" ? params.oilType : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) || undefined : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) || undefined : undefined;
  const inStock = params.inStock === "1";
  const minRating = typeof params.minRating === "string" ? Number(params.minRating) || undefined : undefined;
  const sort = typeof params.sort === "string" && allowedSorts.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : "latest";
  const page = Number(params.page ?? "1") || 1;

  const [categories, brands, facets, productsResult] = await Promise.all([
    getHighlightedCategories(),
    getBrandsWithProductCount(),
    getProductFilterFacets(),
    getAllProductsWithFilters({ search, category, brand, car, viscosity, oilType, minPrice, maxPrice, inStock, minRating, sort, page }),
  ]);

  const { items, pageInfo } = productsResult;
  const sortLabel = sorts.find((item) => item.value === sort)?.label ?? sorts[0].label;
  const categoryName = categories.find((item) => item.slug === category)?.name;
  const brandName = brands.find((item) => item.slug === brand)?.name;
  const activeFilters = [
    search,
    categoryName,
    brandName,
    viscosity,
    oilType,
    car,
    minPrice ? `از ${minPrice.toLocaleString("fa-IR")}` : null,
    maxPrice ? `تا ${maxPrice.toLocaleString("fa-IR")}` : null,
    inStock ? "فقط موجود" : null,
    minRating ? `${minRating} ستاره و بیشتر` : null,
  ].filter(Boolean) as string[];

  const filterDefaults = { brand, car, category, viscosity, oilType, inStock, maxPrice, minPrice, minRating, search, sort };

  return (
    <div className="container-zen py-5 sm:py-6 md:py-8">
      <Breadcrumb items={[{ href: "/", label: "خانه" }, { label: "فروشگاه" }]} />

      <StorefrontPageIntro
        actions={(
          <Link className="btn-outline w-full bg-white lg:w-auto" href="/products/compare">
            مقایسه محصولات
          </Link>
        )}
        className="mb-5 mt-3 sm:mb-6 sm:mt-4"
        description="بر اساس برند، ویسکوزیته، نوع روغن یا سازگاری خودرو، انتخاب مناسب را سریع‌تر پیدا کنید."
        meta={`${pageInfo.total.toLocaleString("fa-IR")} کالا در فروشگاه`}
        title="فروشگاه تخصصی روغن موتور و فیلتر"
      />

      <MobileProductsControls
        activeFilters={activeFilters}
        brands={brands.map((item) => ({ id: item.id, name: item.name, slug: item.slug }))}
        categories={categories.map((item) => ({ id: item.id, name: item.name, slug: item.slug }))}
        currentSortLabel={sortLabel}
        defaults={filterDefaults}
        oilTypes={facets.oilTypes}
        resultsCount={pageInfo.total}
        sorts={sorts}
        viscosities={facets.viscosities}
      />

      <form className="mt-5 grid gap-6 lg:mt-0 lg:grid-cols-[260px_minmax(0,1fr)]" method="get">
        <aside className="hidden h-fit rounded-2xl border border-border bg-white p-5 lg:sticky lg:top-28 lg:block">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-text-strong">فیلترها</h2>
            <Link className="text-xs font-bold text-primary-accent-strong" href="/products">
              حذف همه
            </Link>
          </div>
          <input name="page" type="hidden" value="1" />
          <ProductFilterFields
            brands={brands}
            categories={categories}
            defaults={filterDefaults}
            oilTypes={facets.oilTypes}
            viscosities={facets.viscosities}
          />
          <button className="btn-primary mt-5 w-full">اعمال فیلتر</button>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 hidden items-center justify-between gap-3 lg:flex">
            <div className="flex min-h-8 min-w-0 flex-wrap gap-2">
              {activeFilters.length ? (
                activeFilters.map((item) => (
                  <span key={item} className="chip-zen px-3 py-1.5 text-xs">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm text-text-muted">همه محصولات فروشگاه</span>
              )}
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-text">
              مرتب‌سازی
              <select className="input-zen !min-h-10 rounded-xl px-3 py-2" defaultValue={sort} name="sort">
                {sorts.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button className="btn-secondary !min-h-9 !rounded-xl !px-4 !py-2 text-xs">اعمال</button>
            </label>
          </div>

          {items.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {items.map((product, index) => (
                <ProductCard key={product.id} priority={index === 0} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              actionHref="/products"
              actionLabel="حذف فیلترها"
              description="فیلترها را تغییر دهید یا از راهنمای انتخاب روغن کمک بگیرید."
              title="محصولی با این فیلترها پیدا نشد"
            />
          )}

          <Pagination pageInfo={pageInfo} pathname="/products" searchParams={params} />
        </section>
      </form>
    </div>
  );
}
