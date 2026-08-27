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
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <header>
        <h1 className="t-h1">دسته‌بندی‌های فروشگاه</h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-text-muted">
          روغن موتور، فیلتر و لوازم مصرفی را بر اساس نوع محصول انتخاب کنید.
        </p>
      </header>
      {categories.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface-secondary p-6 text-center text-sm font-semibold text-text-muted sm:p-10">
          هنوز دسته‌بندی‌ای ثبت نشده است.
        </div>
      )}
      <Pagination pathname="/categories" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
