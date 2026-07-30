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
      <header className="panel-zen relative overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(251,252,254,0.8)_100%)]" />
        <p className="relative z-10 text-sm font-bold text-primary-accent-strong">برندهای فروشگاه</p>
        <h1 className="relative z-10 mt-3 text-2xl font-black text-text-strong md:text-4xl">برندهای همکاری‌شده با Oilbar</h1>
        <p className="relative z-10 mt-3 max-w-3xl text-sm leading-8 text-text-muted">
          مجموعه‌ای از معتبرترین برندهای جهانی روغن موتور با امکان فیلتر و مشاهده سریع محصولات مرتبط.
        </p>
      </header>
      {brands.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        <div className="panel-zen-muted rounded-[28px] border-dashed p-10 text-center text-sm font-semibold text-text-muted">
          هنوز برندی ثبت نشده است.
        </div>
      )}
      <Pagination pathname="/brands" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
