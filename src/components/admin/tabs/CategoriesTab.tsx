import { cn } from "@/lib/utils";
import { faDateFormatter, faDecimalFormatter, faNumberFormatter } from "@/lib/formatters";
import type { CategoriesTabData } from "@/services/admin/types";
import { deleteCategoryFormAction } from "@/actions/admin";
import { CategoryCreateForm, CategoryEditForm } from "@/components/admin/forms/CategoryForm";

export function CategoriesTab({ data }: { data: CategoriesTabData }) {
  const { categories } = data;

  const totalCategories = categories.length;
  const totalProducts = categories.reduce((acc, category) => acc + category.productCount, 0);
  const categoryAverageProducts = totalCategories > 0 ? totalProducts / totalCategories : 0;
  const busiestCategory = categories.reduce<null | (typeof categories)[number]>((best, category) => {
    if (!best || category.productCount > best.productCount) {
      return category;
    }
    return best;
  }, null);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">افزودن دسته‌بندی</h2>
          <p className="mt-2 text-xs text-slate-500">
            برای نمایش دقیق‌تر محصولات، دسته‌بندی‌های تخصصی تعریف کنید.
          </p>
          <CategoryCreateForm />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-900">گزارش دسته‌بندی‌ها</h3>
          <ul className="mt-4 space-y-3 text-xs text-slate-500">
            <li>
              مجموع دسته‌بندی‌ها: <span className="text-slate-900">{faNumberFormatter.format(totalCategories)}</span>
            </li>
            <li>
              میانگین محصول برای هر دسته: <span className="text-slate-900">{faDecimalFormatter.format(categoryAverageProducts)}</span>
            </li>
            <li>
              پرترافیک‌ترین دسته:
              {" "}
              {busiestCategory ? (
                <span className="text-slate-900">
                  {busiestCategory.name} ({faNumberFormatter.format(busiestCategory.productCount)} محصول)
                </span>
              ) : (
                <span className="text-slate-900">—</span>
              )}
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">لیست دسته‌بندی‌ها</h2>
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
            <thead className="bg-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 text-right">نام</th>
                <th className="px-4 py-3 text-right">اسلاگ</th>
                <th className="px-4 py-3 text-right">محصولات</th>
                <th className="px-4 py-3 text-right">تاریخ ایجاد</th>
                <th className="px-4 py-3 text-right">اقدامات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-slate-50">
              {categories.map((category) => {
                const canDelete = category.productCount === 0;
                return (
                  <tr key={category.id}>
                    <td className="px-4 py-3 text-slate-900">{category.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{category.slug}</td>
                    <td className="px-4 py-3">{faNumberFormatter.format(category.productCount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{faDateFormatter.format(category.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-3 text-xs">
                        <details className="group">
                          <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-slate-500 transition group-open:border-sky-400 group-open:text-sky-600">
                            ویرایش
                          </summary>
                          <div className="mt-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                            <CategoryEditForm category={category} />
                          </div>
                        </details>
                        <form action={deleteCategoryFormAction} className="flex items-center gap-2">
                          <input type="hidden" name="categoryId" value={category.id} />
                          <button
                            type="submit"
                            disabled={!canDelete}
                            title={
                              canDelete
                                ? "حذف دسته‌بندی"
                                : "ابتدا محصولات وابسته به این دسته‌بندی را ویرایش یا حذف کنید."
                            }
                            className={cn(
                              "w-full rounded-full border px-3 py-1 text-xs transition",
                              canDelete
                                ? "border-red-400/40 text-red-200 hover:border-red-300 hover:text-red-100"
                                : "cursor-not-allowed border-slate-200 text-slate-300",
                            )}
                          >
                            حذف
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!categories.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-400">
                    هنوز دسته‌بندی ثبت نشده است.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
