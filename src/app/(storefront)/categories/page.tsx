import { CategoryCard } from "@/components/catalog/category-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
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
  const availableCategories = categories.filter((category) => category._count.products > 0);
  const upcomingCategories = categories.filter((category) => category._count.products === 0);
  const availableProducts = categories.reduce((sum, category) => sum + category._count.products, 0);

  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:py-8">
      <StorefrontPageIntro
        compact
        description="نوع کالای موردنیاز را انتخاب کنید تا فقط محصولات مرتبط و مشخصات فنی همان گروه نمایش داده شود."
        meta={`${availableProducts.toLocaleString("fa-IR")} محصول آمادهٔ بررسی در ${availableCategories.length.toLocaleString("fa-IR")} دسته`}
        title="دسته‌بندی‌های فروشگاه"
        tone="plain"
      />
      {categories.length > 0 ? (
        <div className="space-y-7">
          {availableCategories.length ? (
            <section>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-extrabold text-text-strong">دسته‌های دارای محصول</h2>
                <span className="text-xs font-bold text-text-muted">{availableCategories.length.toLocaleString("fa-IR")} دسته</span>
              </div>
              <div className="grid border-t border-border md:grid-cols-2 md:gap-x-6 xl:grid-cols-3">
                {availableCategories.map((category) => <CategoryCard key={category.id} category={category} />)}
              </div>
            </section>
          ) : null}
          {upcomingCategories.length ? (
            <section>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-base font-extrabold text-text-strong">دسته‌های در حال تکمیل</h2>
                <span className="text-xs text-text-muted">پس از ثبت محصول فعال می‌شوند</span>
              </div>
              <div className="grid border-t border-border sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
                {upcomingCategories.map((category) => <CategoryCard key={category.id} category={category} />)}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState compact title="هنوز دسته‌بندی‌ای ثبت نشده است" />
      )}
      <Pagination pathname="/categories" searchParams={params} pageInfo={pageInfo} />
    </div>
  );
}
