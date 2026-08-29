import { BrandCard } from "@/components/catalog/brand-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import { getPaginatedBrandsWithProductCount } from "@/lib/data";
import { getPaginationParams } from "@/lib/pagination";

type BrandsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const params = await searchParams;
  const { page, pageSize } = getPaginationParams(params, { defaultPageSize: 12, maxPageSize: 48 });
  const { items: brands, pageInfo } = await getPaginatedBrandsWithProductCount({ page, pageSize });
  const availableBrands = brands.filter((brand) => brand._count.products > 0);
  const upcomingBrands = brands.filter((brand) => brand._count.products === 0);

  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:py-8">
      <StorefrontPageIntro
        compact
        description="ابتدا برندهایی را می‌بینید که اکنون محصول قابل خرید دارند؛ برندهای بدون کالا در بخش جدا و کم‌رنگ‌تر نمایش داده می‌شوند."
        meta={`${availableBrands.length.toLocaleString("fa-IR")} برند دارای محصول`}
        title="برندهای تخصصی Oilbar"
        tone="plain"
      />
      {brands.length > 0 ? (
        <div className="space-y-7">
          {availableBrands.length ? (
            <section>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-extrabold text-text-strong">برندهای موجود در فروشگاه</h2>
                <span className="text-xs font-bold text-text-muted">{availableBrands.length.toLocaleString("fa-IR")} برند</span>
              </div>
              <div className="grid border-t border-border md:grid-cols-2 md:gap-x-6 xl:grid-cols-3">
                {availableBrands.map((brand) => <BrandCard key={brand.id} brand={brand} />)}
              </div>
            </section>
          ) : null}
          {upcomingBrands.length ? (
            <section>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-base font-extrabold text-text-strong">برندهای در حال تکمیل</h2>
                <span className="text-xs text-text-muted">با اضافه‌شدن موجودی فعال می‌شوند</span>
              </div>
              <div className="grid border-t border-border sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
                {upcomingBrands.map((brand) => <BrandCard key={brand.id} brand={brand} />)}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState compact title="هنوز برندی ثبت نشده است" />
      )}
      <Pagination pathname="/brands" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
