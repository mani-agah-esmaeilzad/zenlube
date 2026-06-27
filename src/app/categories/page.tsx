import { CategoryCard } from "@/components/catalog/category-card";
import { getHighlightedCategories } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getHighlightedCategories();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">دسته‌بندی‌ها</h1>
        <p className="text-sm leading-7 text-white/70">
          روغن‌های موتور را بر اساس نوع فرمولاسیون و کاربرد تفکیک کرده‌ایم تا سریعا به محصول مورد نیاز برسید.
        </p>
      </header>
      {categories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm font-semibold text-[#6B7280]">
          هنوز دسته‌بندی‌ای ثبت نشده است.
        </div>
      )}
    </div>
  );
}
