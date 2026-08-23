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
      <header>
        <p className="text-sm font-bold text-primary-accent-strong">مسیریابی سریع خرید</p>
        <h1 className="t-h1 mt-2">دسته‌بندی‌های فروشگاه</h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-text-muted">
          روغن موتور، فیلتر و لوازم مصرفی را بر اساس نوع محصول انتخاب کنید.
        </p>
      </header>
      {categories.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface-secondary p-10 text-center text-sm font-semibold text-text-muted">
          هنوز دسته‌بندی‌ای ثبت نشده است.
        </div>
      )}
      <Pagination pathname="/categories" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
