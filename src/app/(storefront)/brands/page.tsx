import { BrandCard } from "@/components/catalog/brand-card";
import { Pagination } from "@/components/ui/pagination";
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

  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <header>
        <p className="text-sm font-bold text-primary-accent-strong">برندهای فروشگاه</p>
        <h1 className="t-h1 mt-2">برندهای تخصصی Oilbar</h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-text-muted">
          برندهای روغن موتور و فیلتر موجود در فروشگاه را ببینید و محصولات هر برند را بررسی کنید.
        </p>
      </header>
      {brands.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface-secondary p-10 text-center text-sm font-semibold text-text-muted">
          هنوز برندی ثبت نشده است.
        </div>
      )}
      <Pagination pathname="/brands" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
