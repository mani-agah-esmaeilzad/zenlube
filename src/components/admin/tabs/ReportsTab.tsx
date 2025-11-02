import Link from "next/link";

import { faNumberFormatter } from "@/lib/formatters";
import type { ReportsTabData } from "@/services/admin/types";

export function ReportsTab({ data }: { data: ReportsTabData }) {
  const { engagementGroups, maintenanceTasks, productQuestions, carQuestions, products, cars } = data;

  const notebookViewEntries = engagementGroups.filter(
    (item) => item.entityType === "car" && item.eventType === "notebook_view",
  );
  const comparisonEntries = engagementGroups.filter(
    (item) => item.entityType === "product" && item.eventType === "comparison_add",
  );

  const totalNotebookViews = notebookViewEntries.reduce((sum, item) => sum + item.count, 0);
  const totalComparisonAdds = comparisonEntries.reduce((sum, item) => sum + item.count, 0);
  const totalEngagementEvents = engagementGroups.reduce((sum, item) => sum + item.count, 0);

  const engagementByEventType = engagementGroups.reduce<Record<string, number>>((acc, item) => {
    acc[item.eventType] = (acc[item.eventType] ?? 0) + item.count;
    return acc;
  }, {});

  const maintenanceGroups = maintenanceTasks.reduce<Record<string, number>>((acc, task) => {
    const key = task.car?.id ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const reportsSummaryCards = [
    {
      label: "برنامه‌های نگهداری",
      value: faNumberFormatter.format(maintenanceTasks.length),
      helper: `${faNumberFormatter.format(Object.keys(maintenanceGroups).length)} خودرو دارای دفترچه فعال`,
    },
    {
      label: "پرسش‌های محصولات",
      value: faNumberFormatter.format(productQuestions.length),
      helper: `${faNumberFormatter.format(productQuestions.filter((q) => q.status === "PENDING").length)} در انتظار پاسخ`,
    },
    {
      label: "پرسش‌های خودروها",
      value: faNumberFormatter.format(carQuestions.length),
      helper: `${faNumberFormatter.format(carQuestions.filter((q) => q.status === "PENDING").length)} در انتظار پاسخ`,
    },
    {
      label: "رویدادهای ثبت‌شده",
      value: faNumberFormatter.format(totalEngagementEvents),
      helper: `${Object.keys(engagementByEventType).length} نوع رویداد`,
    },
  ];

  const topCarNotebookViews = notebookViewEntries
    .map((entry) => {
      const car = cars.find((c) => c.id === entry.entityId);
      if (!car) {
        return null;
      }
      return { car, count: entry.count };
    })
    .filter(Boolean)
    .slice(0, 8) as Array<{ car: (typeof cars)[number]; count: number }>;

  const topProductComparisons = comparisonEntries
    .map((entry) => {
      const product = products.find((p) => p.id === entry.entityId);
      if (!product) {
        return null;
      }
      return { product, count: entry.count };
    })
    .filter(Boolean)
    .slice(0, 8) as Array<{ product: (typeof products)[number]; count: number }>;

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportsSummaryCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-500/10">
            <p className="text-xs text-slate-400">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-2 text-[11px] text-slate-400">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">پربازدیدترین دفترچه‌های خودرو</h3>
              <p className="mt-2 text-xs text-slate-500">
                جمع کل بازدید صفحات دفترچه: {faNumberFormatter.format(totalNotebookViews)}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-400">
              {faNumberFormatter.format(topCarNotebookViews.length)} خودرو
            </span>
          </div>
          {topCarNotebookViews.length ? (
            <ul className="mt-4 space-y-3">
              {topCarNotebookViews.map(({ car, count }) => (
                <li
                  key={car.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                >
                  <div>
                    <Link href={`/cars/${car.slug}`} className="font-medium text-slate-900 hover:text-sky-600">
                      {car.manufacturer} {car.model}
                    </Link>
                    {car.generation ? <p className="text-[11px] text-slate-400">{car.generation}</p> : null}
                  </div>
                  <span className="rounded-full border border-sky-200 px-3 py-1 text-xs text-sky-600">
                    {faNumberFormatter.format(count)} بازدید
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-center text-xs text-slate-400">هنوز داده‌ای برای نمایش بازدیدها ثبت نشده است.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">محصولات پرتکرار در مقایسه</h3>
              <p className="mt-2 text-xs text-slate-500">
                مجموع دفعات افزودن به مقایسه: {faNumberFormatter.format(totalComparisonAdds)}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-400">
              {faNumberFormatter.format(topProductComparisons.length)} محصول
            </span>
          </div>
          {topProductComparisons.length ? (
            <ul className="mt-4 space-y-3">
              {topProductComparisons.map(({ product, count }) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                >
                  <div>
                    <Link href={`/products/${product.slug}`} className="font-medium text-slate-900 hover:text-sky-600">
                      {product.brand.name} · {product.name}
                    </Link>
                    <p className="text-[11px] text-slate-400">{product.viscosity ?? "ویسکوزیته نامشخص"}</p>
                  </div>
                  <span className="rounded-full border border-sky-200 px-3 py-1 text-xs text-sky-600">
                    {faNumberFormatter.format(count)} مرتبه
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-center text-xs text-slate-400">هنوز داده‌ای برای نمایش مقایسه‌ها ثبت نشده است.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">جزئیات رویدادهای تعاملی</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(engagementByEventType).map(([eventType, value]) => (
            <div key={eventType} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">{eventType}</p>
              <p className="mt-2 text-[11px] text-slate-500">{faNumberFormatter.format(value)} رویداد</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
