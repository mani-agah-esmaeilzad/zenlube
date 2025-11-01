import Link from "next/link";

import { faDateFormatter, faNumberFormatter } from "@/lib/formatters";
import type { CarsTabData } from "@/services/admin/types";
import { createCarAction } from "@/actions/admin";

export function CarsTab({ data }: { data: CarsTabData }) {
  const { cars } = data;

  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">ثبت یا ویرایش خودرو</h2>
          <p className="mt-2 text-xs text-slate-500">
            خودرو جدید را با دیتاشیت کامل ثبت کنید. برای ویرایش، فرم را با همان اسلاگ ارسال کنید تا اطلاعات دفترچه‌ای به‌روزرسانی شود.
          </p>
          <form action={createCarAction} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              name="slug"
              placeholder="اسلاگ خودرو (مثال: bmw-320i-f30)"
              className="sm:col-span-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="manufacturer"
              placeholder="سازنده"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="model"
              placeholder="مدل"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="generation"
              placeholder="نسل / تیپ (اختیاری)"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="imageUrl"
              placeholder="آدرس تصویر یا جلد دفترچه (اختیاری)"
              className="sm:col-span-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="engineType"
              placeholder="نوع موتور"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="engineCode"
              placeholder="کد موتور (اختیاری)"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="viscosity"
              placeholder="ویسکوزیته پیشنهادی (SAE)"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="oilCapacityLit"
              placeholder="ظرفیت روغن موتور (لیتر)"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="specification"
              placeholder="استاندارد سازنده (مثال: VW 504.00)"
              className="sm:col-span-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="yearFrom"
              placeholder="سال شروع تولید"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <input
              name="yearTo"
              placeholder="سال پایان تولید"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              name="overviewDetails"
              placeholder="صفحه مقدمه دفترچه: معرفی کلی خودرو"
              className="sm:col-span-2 h-28 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              name="engineDetails"
              placeholder="صفحه موتور: ساختار فنی، ظرفیت، روغن و توصیه‌های سرویس"
              className="sm:col-span-2 h-32 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              name="gearboxDetails"
              placeholder="صفحه گیربکس: نوع جعبه‌دنده، روغن مناسب، ظرفیت و دوره‌های سرویس"
              className="sm:col-span-2 h-32 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              name="maintenanceInfo"
              placeholder="صفحه نگهداری: برنامه بازدیدها، سیالات مصرفی و نکات تخصصی"
              className="sm:col-span-2 h-32 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <button
              type="submit"
              className="sm:col-span-2 rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600"
            >
              ذخیره خودرو
            </button>
          </form>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">خودروهای ثبت‌شده</h2>
              <p className="mt-1 text-xs text-slate-500">
                {faNumberFormatter.format(cars.length)} خودرو در پایگاه داده موجود است.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              مرتب‌سازی بر اساس سازنده
            </span>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white">
            {cars.length ? (
              <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                <thead className="bg-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-right">خودرو</th>
                    <th className="px-4 py-3 text-right">سال‌های تولید</th>
                    <th className="px-4 py-3 text-right">موتور</th>
                    <th className="px-4 py-3 text-right">روغن پیشنهادی</th>
                    <th className="px-4 py-3 text-right">محصولات مرتبط</th>
                    <th className="px-4 py-3 text-right">آخرین بروزرسانی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-slate-50">
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-900">
                            {car.manufacturer} {car.model} {car.generation ?? ""}
                          </span>
                          <Link
                            href={`/cars/${car.slug}`}
                            className="text-xs text-purple-300 hover:text-sky-600"
                          >
                            مشاهده صفحه
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {car.yearFrom ?? "—"} تا {car.yearTo ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {car.engineType ?? "نامشخص"}
                        {car.engineCode ? (
                          <span className="ml-2 inline-block rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500">
                            {car.engineCode}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {car.viscosity ?? "—"}
                        {car.oilCapacityLit ? (
                          <span className="ml-2 inline-block rounded-full border border-sky-200 px-2 py-0.5 text-[11px] text-sky-600">
                            {car.oilCapacityLit} لیتر
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {faNumberFormatter.format(car.productMappingCount)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {faDateFormatter.format(car.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-6 py-10 text-sm text-slate-500">
                هنوز خودرویی ثبت نشده است. اولین خودرو را با فرم کنار ثبت کنید.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
