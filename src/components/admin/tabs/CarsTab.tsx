"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CarEditorForm } from "@/components/admin/forms/CarForm";
import { faDateFormatter, faNumberFormatter } from "@/lib/formatters";
import type { CarsTabData } from "@/services/admin/types";
import { deleteCarFormAction, toggleCarVisibilityFormAction } from "@/actions/admin";

export function CarsTab({ data }: { data: CarsTabData }) {
  const { cars } = data;
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) ?? null,
    [cars, selectedCarId],
  );
  const activeCarsCount = cars.filter((car) => car.isActive).length;
  const inactiveCarsCount = cars.length - activeCarsCount;

  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">مدیریت نمایش و اطلاعات خودرو</h2>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                از این بخش می‌توانید خودرو را ویرایش کنید، در سایت فعال یا غیرفعال نگه دارید و نمایش آن را کنترل کنید.
              </p>
            </div>
            {selectedCar ? (
              <button
                type="button"
                onClick={() => setSelectedCarId(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ثبت خودروی جدید
              </button>
            ) : null}
          </div>

          <CarEditorForm
            key={selectedCar?.id ?? "create"}
            car={selectedCar}
            onReset={() => setSelectedCarId(null)}
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">خودروهای ثبت‌شده</h2>
              <p className="mt-1 text-xs text-slate-500">
                {faNumberFormatter.format(cars.length)} خودرو در پایگاه داده موجود است.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 text-xs">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                {faNumberFormatter.format(activeCarsCount)} فعال
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-500">
                {faNumberFormatter.format(inactiveCarsCount)} غیرفعال
              </span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            {cars.length ? (
              <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                <thead className="bg-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-right">خودرو</th>
                    <th className="px-4 py-3 text-right">وضعیت</th>
                    <th className="px-4 py-3 text-right">سال‌های تولید</th>
                    <th className="px-4 py-3 text-right">موتور</th>
                    <th className="px-4 py-3 text-right">روغن پیشنهادی</th>
                    <th className="px-4 py-3 text-right">محصولات مرتبط</th>
                    <th className="px-4 py-3 text-right">آخرین بروزرسانی</th>
                    <th className="px-4 py-3 text-right">عملیات</th>
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
                          <span className="text-[11px] text-slate-400">{car.slug}</span>
                          {car.isActive ? (
                            <Link
                              href={`/cars/${car.slug}`}
                              className="text-xs text-purple-300 hover:text-sky-600"
                            >
                              مشاهده صفحه
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">در سایت نمایش داده نمی‌شود</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 font-bold ${
                            car.isActive
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          {car.isActive ? "فعال" : "غیرفعال"}
                        </span>
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
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCarId(car.id)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 transition hover:bg-white"
                          >
                            ویرایش
                          </button>
                          <form action={toggleCarVisibilityFormAction}>
                            <input type="hidden" name="carId" value={car.id} />
                            <input type="hidden" name="carSlug" value={car.slug} />
                            <input type="hidden" name="nextIsActive" value={car.isActive ? "false" : "true"} />
                            <button
                              type="submit"
                              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                                car.isActive
                                  ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
                                  : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              {car.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                            </button>
                          </form>
                          <form action={deleteCarFormAction}>
                            <input type="hidden" name="carId" value={car.id} />
                            <input type="hidden" name="carSlug" value={car.slug} />
                            <button type="submit" className="rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50">
                              حذف
                            </button>
                          </form>
                        </div>
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
