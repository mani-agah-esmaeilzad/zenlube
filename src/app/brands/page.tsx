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
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <header className="space-y-3 text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">برندهای همکاری شده با Oilbar</h1>
        <p className="text-sm leading-7 text-slate-600">
          مجموعه‌ای از معتبرترین برندهای جهانی روغن موتور با امکان فیلتر و مشاهده سریع محصولات مرتبط.
        </p>
      </header>
      {brands.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm font-semibold text-[#6B7280]">
          هنوز برندی ثبت نشده است.
        </div>
      )}
      <Pagination pathname="/brands" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
