import { BrandCard } from "@/components/catalog/brand-card";
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
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <StorefrontPageIntro
        description="ابتدا برندهایی را می‌بینید که اکنون محصول قابل خرید دارند؛ برندهای بدون کالا در بخش جدا و کم‌رنگ‌تر نمایش داده می‌شوند."
        meta={`${availableBrands.length.toLocaleString("fa-IR")} برند دارای محصول`}
        title="برندهای تخصصی Oilbar"
      />
      {brands.length > 0 ? (
        <div className="space-y-8">
          {availableBrands.length ? (
            <section>
              <div className="mb-4">
                <h2 className="t-h2">برندهای موجود در فروشگاه</h2>
                <p className="mt-1 text-sm leading-7 text-text-muted">برندهایی که همین حالا برای آن‌ها محصول ثبت شده است.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {availableBrands.map((brand) => <BrandCard key={brand.id} brand={brand} />)}
              </div>
            </section>
          ) : null}
          {upcomingBrands.length ? (
            <section className="border-t border-border pt-6">
              <div className="mb-4">
                <h2 className="text-base font-extrabold text-text-strong">فهرست برندهای در حال تکمیل</h2>
                <p className="mt-1 text-xs leading-6 text-text-muted">با اضافه‌شدن موجودی، لینک محصولات هر برند فعال می‌شود.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingBrands.map((brand) => <BrandCard key={brand.id} brand={brand} />)}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface-secondary p-6 text-center text-sm font-semibold text-text-muted sm:p-10">
          هنوز برندی ثبت نشده است.
        </div>
      )}
      <Pagination pathname="/brands" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
