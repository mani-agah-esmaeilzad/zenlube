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
      <header className="rounded-[32px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] md:p-8">
        <p className="text-sm font-bold text-[#D97706]">برندهای فروشگاه</p>
        <h1 className="mt-3 text-2xl font-black text-[#171B23] md:text-4xl">برندهای همکاری‌شده با Oilbar</h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[#667085]">
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
        <div className="rounded-[28px] border border-dashed border-[#D0D5DD] bg-white p-10 text-center text-sm font-semibold text-[#667085]">
          هنوز برندی ثبت نشده است.
        </div>
      )}
      <Pagination pathname="/brands" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
