import Link from "next/link";

import { faDecimalFormatter, faNumberFormatter } from "@/lib/formatters";
import type { MaintenanceTabData } from "@/services/admin/types";
import {
  createMaintenanceTaskAction,
  deleteMaintenanceTaskFormAction,
} from "@/actions/admin";

export function MaintenanceTab({ data }: { data: MaintenanceTabData }) {
  const { cars, maintenanceTasks, products } = data;

  const maintenanceGroupsMap = maintenanceTasks.reduce(
    (acc, task) => {
      const key = task.car?.id ?? "unknown";
      if (!acc.has(key)) {
        acc.set(key, {
          car: task.car,
          tasks: [] as typeof maintenanceTasks,
        });
      }
      acc.get(key)?.tasks.push(task);
      return acc;
    },
    new Map<string, { car: (typeof maintenanceTasks)[number]["car"]; tasks: typeof maintenanceTasks }>(),
  );

  const maintenanceGroups = Array.from(maintenanceGroupsMap.values()).map((group) => ({
    ...group,
    tasks: [...group.tasks].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      const aInterval = a.intervalKm ?? Number.MAX_SAFE_INTEGER;
      const bInterval = b.intervalKm ?? Number.MAX_SAFE_INTEGER;
      return aInterval - bInterval;
    }),
  }));

  maintenanceGroups.sort((a, b) => {
    const aLabel = `${a.car?.manufacturer ?? ""} ${a.car?.model ?? ""}`.trim();
    const bLabel = `${b.car?.manufacturer ?? ""} ${b.car?.model ?? ""}`.trim();
    return aLabel.localeCompare(bLabel);
  });

  const productBySlug = new Map(products.map((product) => [product.slug, product] as const));

  const maintenanceSummary = {
    totalTasks: maintenanceTasks.length,
    carCount: maintenanceGroups.length,
    averageTasksPerCar: maintenanceGroups.length
      ? maintenanceTasks.length / maintenanceGroups.length
      : 0,
  };

  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">افزودن برنامه نگهداری</h2>
          <p className="mt-2 text-xs text-slate-500">
            برنامه‌های سرویس دوره‌ای را بر اساس خودرو و بازه‌های زمانی/کیلومتر ثبت کنید. با ثبت دوباره همان عنوان برای یک خودرو، اطلاعات به‌روزرسانی می‌شود.
          </p>
          <form action={createMaintenanceTaskAction} className="mt-6 grid gap-4">
            <div>
              <label className="text-xs text-slate-500">انتخاب خودرو</label>
              <select
                name="carId"
                className="mt-2 w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
              >
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.manufacturer} {car.model} {car.generation ?? ""}
                  </option>
                ))}
              </select>
            </div>
            <input
              name="title"
              placeholder="عنوان برنامه (مثال: تعویض روغن ۱۰ هزار کیلومتر)"
              className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              name="description"
              placeholder="جزئیات انجام سرویس و نکات تکمیلی"
              className="h-24 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                name="intervalKm"
                placeholder="فاصله کیلومتری (مثال: 10000)"
                className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
              />
              <input
                name="intervalMonths"
                placeholder="فاصله زمانی (ماه)"
                className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
              />
              <select
                name="priority"
                defaultValue="1"
                className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
              >
                <option value="1">اولویت ۱ (حیاتی)</option>
                <option value="2">اولویت ۲</option>
                <option value="3">اولویت ۳</option>
                <option value="4">اولویت ۴</option>
                <option value="5">اولویت ۵</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">محصولات پیشنهادی (اسلاگ‌ها با ویرگول)</label>
              <input
                name="recommendedProductSlugs"
                placeholder="mobil-1-esp-x3-0w40, castrol-edge-5w30-ll"
                className="mt-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
              />
              <p className="mt-2 text-[11px] text-slate-400">
                برای اتصال مستقیم به محصولات، اسلاگ فروشگاهی را وارد کنید. در صورت خالی بودن این بخش، فقط توضیحات نمایش داده خواهد شد.
              </p>
            </div>
            <button
              type="submit"
              className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600"
            >
              ذخیره برنامه
            </button>
          </form>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-900">نمای کلی نگهداری</h3>
          <ul className="space-y-2 text-xs text-slate-500">
            <li>تعداد کل برنامه‌ها: {faNumberFormatter.format(maintenanceSummary.totalTasks)} مورد</li>
            <li>خودروهای دارای برنامه فعال: {faNumberFormatter.format(maintenanceSummary.carCount)} دستگاه</li>
            <li>
              میانگین وظایف هر خودرو: {maintenanceSummary.carCount
                ? faDecimalFormatter.format(maintenanceSummary.averageTasksPerCar)
                : "0"}
            </li>
          </ul>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">راهنمای به‌روزرسانی</p>
            <p className="mt-2 leading-6 text-slate-500">
              برای ویرایش یک برنامه، همان عنوان را دوباره با اطلاعات جدید ارسال کنید. برای حذف، از لیست برنامه‌های فعال استفاده کنید.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">دفترچه نگهداری خودروها</h2>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
            {faNumberFormatter.format(maintenanceTasks.length)} برنامه ثبت‌شده
          </span>
        </div>
        {maintenanceGroups.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {maintenanceGroups.map((group, index) => {
              const { car, tasks } = group;
              const groupKey = car?.id ?? `group-${index}`;

              return (
                <div key={groupKey} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {car ? `${car.manufacturer} ${car.model}` : "خودرو نامشخص"}
                      </p>
                      {car?.slug ? (
                        <Link
                          href={`/cars/${car.slug}`}
                          className="mt-1 inline-block text-xs text-purple-300 hover:text-sky-600"
                        >
                          مشاهده صفحه خودرو
                        </Link>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500">
                      {faNumberFormatter.format(tasks.length)} وظیفه
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.map((task) => {
                      const recommendedProducts = task.recommendedProductSlugs ?? [];
                      return (
                        <div key={task.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{task.title}</p>
                              <p className="mt-1 text-xs leading-6 text-slate-500">
                                {task.description ?? "جزئیاتی ثبت نشده است."}
                              </p>
                            </div>
                            <span className="rounded-full border border-sky-200 px-3 py-1 text-[11px] text-sky-600">
                              اولویت {task.priority}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                            <span className="rounded-full border border-slate-200 px-3 py-1">
                              هر {task.intervalKm ? `${faNumberFormatter.format(task.intervalKm)} کیلومتر` : "—"}
                            </span>
                            <span className="rounded-full border border-slate-200 px-3 py-1">
                              هر {task.intervalMonths ? `${faNumberFormatter.format(task.intervalMonths)} ماه` : "—"}
                            </span>
                          </div>
                          {recommendedProducts.length ? (
                            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                              {recommendedProducts.map((slug) => {
                                const prod = productBySlug.get(slug);
                                return prod ? (
                                  <Link
                                    key={slug}
                                    href={`/products/${prod.slug}`}
                                    className="inline-flex items-center gap-1 rounded-full border border-purple-400/30 bg-sky-500/10 px-3 py-1 text-sky-600 transition hover:border-sky-200/60 hover:text-purple-50"
                                  >
                                    {prod.brand.name} · {prod.name}
                                  </Link>
                                ) : (
                                  <span
                                    key={slug}
                                    className="rounded-full border border-slate-200 px-3 py-1 text-slate-500"
                                  >
                                    {slug}
                                  </span>
                                );
                              })}
                            </div>
                          ) : null}
                          <form action={deleteMaintenanceTaskFormAction}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-red-400/30 px-3 py-1 text-[11px] text-red-200 transition hover:border-red-300 hover:text-red-100"
                            >
                              حذف برنامه
                            </button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-400">
            هنوز برنامه نگهداری ثبت نشده است.
          </div>
        )}
      </section>
    </div>
  );
}
