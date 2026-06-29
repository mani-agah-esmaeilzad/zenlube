import { CategoryCard } from "@/components/catalog/category-card";
import { Pagination } from "@/components/ui/pagination";
import { getPaginatedCategoriesWithProductCount } from "@/lib/data";
import { getPaginationParams } from "@/lib/pagination";

type CategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const { page, pageSize } = getPaginationParams(params, { defaultPageSize: 12, maxPageSize: 48 });
  const { items: categories, pageInfo } = await getPaginatedCategoriesWithProductCount({ page, pageSize });

  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <header className="rounded-[32px] border border-[#E7E8EE] bg-[#171B23] p-6 text-white shadow-[0_20px_50px_rgba(17,24,39,0.16)] md:p-8">
        <p className="text-sm font-bold text-[#F5C56B]">مسیریابی سریع خرید</p>
        <h1 className="mt-3 text-2xl font-black md:text-4xl">دسته‌بندی‌های فروشگاه</h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-white/72">
          روغن‌های موتور را بر اساس نوع فرمولاسیون و کاربرد تفکیک کرده‌ایم تا سریعا به محصول مورد نیاز برسید.
        </p>
      </header>
      {categories.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#D0D5DD] bg-white p-10 text-center text-sm font-semibold text-[#667085]">
          هنوز دسته‌بندی‌ای ثبت نشده است.
        </div>
      )}
      <Pagination pathname="/categories" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
