import { CategoryCard } from "@/components/catalog/category-card";
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
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <StorefrontPageIntro
        description="نوع کالای موردنیاز را انتخاب کنید تا فقط محصولات مرتبط و مشخصات فنی همان گروه نمایش داده شود."
        meta={`${availableProducts.toLocaleString("fa-IR")} محصول آمادهٔ بررسی در ${availableCategories.length.toLocaleString("fa-IR")} دسته`}
        title="دسته‌بندی‌های فروشگاه"
      />
      {categories.length > 0 ? (
        <div className="space-y-8">
          {availableCategories.length ? (
            <section>
              <div className="mb-4">
                <h2 className="t-h2">دسته‌های دارای محصول</h2>
                <p className="mt-1 text-sm leading-7 text-text-muted">انتخاب‌های قابل خرید، بدون نمایش دسته‌های خالی در ابتدای مسیر.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {availableCategories.map((category) => <CategoryCard key={category.id} category={category} />)}
              </div>
            </section>
          ) : null}
          {upcomingCategories.length ? (
            <section className="border-t border-border pt-6">
              <div className="mb-4">
                <h2 className="text-base font-extrabold text-text-strong">دسته‌های در حال تکمیل</h2>
                <p className="mt-1 text-xs leading-6 text-text-muted">این بخش‌ها پس از ثبت محصول فعال می‌شوند.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingCategories.map((category) => <CategoryCard key={category.id} category={category} />)}
              </div>
            </section>
          ) : null}
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
