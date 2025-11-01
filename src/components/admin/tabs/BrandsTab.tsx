import { cn } from "@/lib/utils";
import { faDateFormatter, faDecimalFormatter, faNumberFormatter } from "@/lib/formatters";
import type { BrandsTabData } from "@/services/admin/types";
import { deleteBrandFormAction } from "@/actions/admin";
import { BrandCreateForm, BrandEditForm } from "@/components/admin/forms/BrandForm";

export function BrandsTab({ data }: { data: BrandsTabData }) {
  const { brands, totalReviews } = data;

  const totalBrands = brands.length;
  const totalProducts = brands.reduce((acc, brand) => acc + brand.productCount, 0);
  const brandAverageProducts = totalBrands > 0 ? totalProducts / totalBrands : 0;
  const bestSellingBrand = brands.reduce<null | (typeof brands)[number]>((best, brand) => {
    if (!best || brand.productCount > best.productCount) {
      return brand;
    }
    return best;
  }, null);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">افزودن برند</h2>
          <p className="mt-2 text-xs text-slate-500">
            برند جدید را با اطلاعات کامل ثبت کنید تا در فرم‌های محصول و صفحات فروشگاهی در دسترس باشد.
          </p>
          <BrandCreateForm />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-900">گزارش برندها</h3>
          <ul className="mt-4 space-y-3 text-xs text-slate-500">
            <li>
              مجموع برندهای ثبت‌شده: <span className="text-slate-900">{faNumberFormatter.format(totalBrands)}</span>
            </li>
            <li>
              میانگین محصول برای هر برند: <span className="text-slate-900">{faDecimalFormatter.format(brandAverageProducts)}</span>
            </li>
            <li>
              پربارترین برند:
              {" "}
              {bestSellingBrand ? (
                <span className="text-slate-900">
                  {bestSellingBrand.name} ({faNumberFormatter.format(bestSellingBrand.productCount)} محصول)
                </span>
              ) : (
                <span className="text-slate-900">—</span>
              )}
            </li>
            <li>
              مجموع نظرات محصولات: <span className="text-slate-900">{faNumberFormatter.format(totalReviews)}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">لیست برندها</h2>
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
            <thead className="bg-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 text-right">نام</th>
                <th className="px-4 py-3 text-right">اسلاگ</th>
                <th className="px-4 py-3 text-right">محصولات</th>
                <th className="px-4 py-3 text-right">تاریخ ایجاد</th>
                <th className="px-4 py-3 text-right">وب‌سایت</th>
                <th className="px-4 py-3 text-right">اقدامات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-slate-50">
              {brands.map((brand) => {
                const canDelete = brand.productCount === 0;
                return (
                  <tr key={brand.id}>
                    <td className="px-4 py-3 text-slate-900">{brand.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{brand.slug}</td>
                    <td className="px-4 py-3">{faNumberFormatter.format(brand.productCount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{faDateFormatter.format(brand.createdAt)}</td>
                    <td className="px-4 py-3 text-xs">
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:text-sky-600"
                        >
                          مشاهده
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-3 text-xs">
                        <details className="group">
                          <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-slate-500 transition group-open:border-sky-400 group-open:text-sky-600">
                            ویرایش
                          </summary>
                          <div className="mt-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                            <BrandEditForm brand={brand} />
                          </div>
                        </details>
                        <form action={deleteBrandFormAction} className="flex items-center gap-2">
                          <input type="hidden" name="brandId" value={brand.id} />
                          <button
                            type="submit"
                            disabled={!canDelete}
                            title={
                              canDelete
                                ? "حذف برند"
                                : "ابتدا محصولات وابسته به این برند را ویرایش یا حذف کنید."
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
              {!brands.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">
                    هنوز برندی ثبت نشده است.
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
