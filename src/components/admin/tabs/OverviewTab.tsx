import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import {
  faDateFormatter,
  faDateTimeFormatter,
  faDecimalFormatter,
  faNumberFormatter,
} from "@/lib/formatters";
import type { OverviewTabData } from "@/services/admin/types";

const orderStatusLabels: Record<string, string> = {
  PENDING: "در انتظار",
  PAID: "پرداخت‌شده",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغوشده",
};

export function OverviewTab({ data }: { data: OverviewTabData }) {
  const {
    categories,
    brands,
    cars,
    products,
    users,
    recentOrders,
    totalRevenue,
    revenueLast30,
    ordersByStatus,
    ordersLast30,
    totalReviews,
    maintenanceTasks,
    productQuestions,
    carQuestions,
    engagementGroups,
  } = data;

  const totalOrders = Object.values(ordersByStatus).reduce((acc, count) => acc + count, 0);
  const pendingOrders = ordersByStatus.PENDING ?? 0;
  const paidOrders = ordersByStatus.PAID ?? 0;
  const shippedOrders = ordersByStatus.SHIPPED ?? 0;
  const deliveredOrders = ordersByStatus.DELIVERED ?? 0;
  const cancelledOrders = ordersByStatus.CANCELLED ?? 0;
  const successfulOrders = paidOrders + shippedOrders + deliveredOrders;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const totalProducts = products.length;
  const totalBrands = brands.length;
  const totalCategories = categories.length;
  const totalCustomers = users.filter((user) => user.role === "CUSTOMER").length;
  const totalAdmins = users.length - totalCustomers;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomers30 = users.filter(
    (user) => user.role === "CUSTOMER" && user.createdAt >= thirtyDaysAgo,
  ).length;

  const inventoryValue = products.reduce((acc, product) => acc + product.price * product.stock, 0);

  const lowStockCount = products.filter((product) => product.stock < 10).length;

  const recentUsers = users.slice(0, 5);
  const latestProducts = products.slice(0, 5);

  const overviewCards = [
    {
      label: "درآمد کل",
      value: formatPrice(totalRevenue),
      helper: `${faNumberFormatter.format(totalOrders)} سفارش ثبت‌شده`,
    },
    {
      label: "درآمد ۳۰ روز اخیر",
      value: formatPrice(revenueLast30),
      helper: `${faNumberFormatter.format(ordersLast30)} سفارش جدید در ۳۰ روز`,
    },
    {
      label: "میانگین ارزش سفارش",
      value: formatPrice(averageOrderValue),
      helper:
        successfulOrders > 0
          ? `${faNumberFormatter.format(successfulOrders)} سفارش موفق`
          : "داده‌ای ثبت نشده",
    },
    {
      label: "مشتریان فعال",
      value: faNumberFormatter.format(totalCustomers),
      helper: `${faNumberFormatter.format(newCustomers30)} مشتری جدید در ۳۰ روز اخیر`,
    },
    {
      label: "محصولات فعال",
      value: faNumberFormatter.format(totalProducts),
      helper: `${faNumberFormatter.format(lowStockCount)} مورد در آستانه اتمام موجودی`,
    },
    {
      label: "ارزش موجودی انبار",
      value: formatPrice(inventoryValue),
      helper: `${faNumberFormatter.format(totalBrands)} برند | ${faNumberFormatter.format(
        totalCategories,
      )} دسته‌بندی`,
    },
  ];

  const orderStatusChips = [
    { key: "PENDING", label: orderStatusLabels.PENDING, value: pendingOrders },
    { key: "PAID", label: orderStatusLabels.PAID, value: paidOrders },
    { key: "SHIPPED", label: orderStatusLabels.SHIPPED, value: shippedOrders },
    { key: "DELIVERED", label: orderStatusLabels.DELIVERED, value: deliveredOrders },
    { key: "CANCELLED", label: orderStatusLabels.CANCELLED, value: cancelledOrders },
  ];

  const brandAverageProducts = totalBrands > 0 ? totalProducts / totalBrands : 0;
  const categoryAverageProducts = totalCategories > 0 ? totalProducts / totalCategories : 0;

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

  const productBySlug = new Map(products.map((product) => [product.slug, product] as const));

  maintenanceGroups.sort((a, b) => {
    const aLabel = `${a.car?.manufacturer ?? ""} ${a.car?.model ?? ""}`.trim();
    const bLabel = `${b.car?.manufacturer ?? ""} ${b.car?.model ?? ""}`.trim();
    return aLabel.localeCompare(bLabel);
  });

  const pendingProductQuestionsList = productQuestions.filter((question) => question.status === "PENDING");
  const answeredProductQuestionsList = productQuestions.filter((question) => question.status === "ANSWERED");
  const pendingCarQuestionsList = carQuestions.filter((question) => question.status === "PENDING");
  const answeredCarQuestionsList = carQuestions.filter((question) => question.status === "ANSWERED");

  const pendingProductQuestionsCount = pendingProductQuestionsList.length;
  const pendingCarQuestionsCount = pendingCarQuestionsList.length;

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

  const topCarNotebookViews = notebookViewEntries
    .map((entry) => {
      const car = cars.find((c) => c.id === entry.entityId);
      if (!car) {
        return null;
      }
      return {
        car,
        count: entry.count,
      };
    })
    .filter(Boolean)
    .slice(0, 6) as Array<{ car: (typeof cars)[number]; count: number }>;

  const topProductComparisons = comparisonEntries
    .map((entry) => {
      const product = products.find((p) => p.id === entry.entityId);
      if (!product) {
        return null;
      }
      return {
        product,
        count: entry.count,
      };
    })
    .filter(Boolean)
    .slice(0, 6) as Array<{ product: (typeof products)[number]; count: number }>;

  const reportsSummaryCards = [
    {
      label: "برنامه‌های نگهداری",
      value: faNumberFormatter.format(maintenanceTasks.length),
      helper: `${faNumberFormatter.format(maintenanceGroups.length)} خودرو پوشش داده شده است`,
    },
    {
      label: "پرسش‌های در انتظار",
      value: faNumberFormatter.format(pendingProductQuestionsCount + pendingCarQuestionsCount),
      helper: `محصول: ${faNumberFormatter.format(
        pendingProductQuestionsCount,
      )} · خودرو: ${faNumberFormatter.format(pendingCarQuestionsCount)}`,
    },
    {
      label: "بازدید دفترچه دیجیتال",
      value: faNumberFormatter.format(totalNotebookViews),
      helper: `${faNumberFormatter.format(topCarNotebookViews.length)} خودرو پرتوجه`,
    },
    {
      label: "افزودن به مقایسه",
      value: faNumberFormatter.format(totalComparisonAdds),
      helper: `${faNumberFormatter.format(topProductComparisons.length)} محصول پرتکرار`,
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-500/10"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">وضعیت سفارش‌ها</h2>
        <div className="flex flex-wrap gap-3">
          {orderStatusChips.map((chip) => (
            <span
              key={chip.key}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            >
              <span>{chip.label}</span>
              <span className="rounded-full bg-sky-500/20 px-2 py-1 text-slate-900">
                {faNumberFormatter.format(chip.value)}
              </span>
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">آخرین سفارش‌ها</h2>
            <span className="text-xs text-slate-400">
              {totalOrders
                ? `${faNumberFormatter.format(totalOrders)} سفارش در مجموع`
                : "هنوز سفارشی ثبت نشده"}
            </span>
          </div>
          {recentOrders.length ? (
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
              <thead className="bg-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-right">مشتری</th>
                  <th className="px-4 py-3 text-right">ایمیل</th>
                  <th className="px-4 py-3 text-right">مبلغ</th>
                  <th className="px-4 py-3 text-right">وضعیت</th>
                  <th className="px-4 py-3 text-right">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-slate-900">{order.fullName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{order.email}</td>
                    <td className="px-4 py-3 text-slate-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                        {orderStatusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {faDateTimeFormatter.format(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">هنوز سفارشی ثبت نشده است.</div>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">خلاصه مشتریان</h3>
          <ul className="space-y-2 text-xs text-slate-500">
            <li>مشتریان: {faNumberFormatter.format(totalCustomers)}</li>
            <li>مدیران: {faNumberFormatter.format(totalAdmins)}</li>
            <li>نظرات ثبت‌شده: {faNumberFormatter.format(totalReviews)}</li>
          </ul>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-600">میانگین محصولات برای هر برند:</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {faDecimalFormatter.format(brandAverageProducts)}
            </p>
            <p className="mt-4 text-xs text-slate-600">میانگین محصولات برای هر دسته‌بندی:</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {faDecimalFormatter.format(categoryAverageProducts)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">آخرین محصولات</h2>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              {faNumberFormatter.format(totalProducts)} محصول فعال
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {latestProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.brand.name} · {product.category.name}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                  {formatPrice(product.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">کاربران تازه</h2>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              {faNumberFormatter.format(users.length)} کاربر کل
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name ?? "کاربر بدون نام"}</p>
                  <p className="text-xs text-slate-500">{user.email ?? "—"}</p>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                  {faDateFormatter.format(user.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">پربازدیدترین خودروها</h2>
          <div className="mt-6 space-y-4">
            {topCarNotebookViews.length ? (
              topCarNotebookViews.map(({ car, count }) => (
                <div key={car.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {car.manufacturer} {car.model}
                    </p>
                    <p className="text-xs text-slate-500">بازدید دفترچه: {faNumberFormatter.format(count)}</p>
                  </div>
                  <Link
                    href={`/cars/${car.slug}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-sky-600"
                  >
                    مشاهده
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">داده‌ای برای نمایش وجود ندارد.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">محبوب‌ترین مقایسه‌ها</h2>
          <div className="mt-6 space-y-4">
            {topProductComparisons.length ? (
              topProductComparisons.map(({ product, count }) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.brand.name}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                    {faNumberFormatter.format(count)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">داده‌ای برای نمایش وجود ندارد.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">پرسش‌های محصولات</h3>
          <p className="mt-2 text-xs text-slate-500">
            {faNumberFormatter.format(pendingProductQuestionsCount)} سوال در انتظار پاسخ
          </p>
          <div className="mt-4 space-y-3">
            {[...pendingProductQuestionsList, ...answeredProductQuestionsList].slice(0, 5).map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  {question.authorName} · {faDateFormatter.format(question.createdAt)}
                </p>
                {question.product ? (
                  <Link
                    href={`/products/${question.product.slug}`}
                    className="mt-2 inline-flex text-[11px] text-purple-300 hover:text-sky-600"
                  >
                    {question.product.brandName} · {question.product.name}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">پرسش‌های خودروها</h3>
          <p className="mt-2 text-xs text-slate-500">
            {faNumberFormatter.format(pendingCarQuestionsCount)} سوال در انتظار پاسخ
          </p>
          <div className="mt-4 space-y-3">
            {[...pendingCarQuestionsList, ...answeredCarQuestionsList].slice(0, 5).map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  {question.authorName} · {faDateFormatter.format(question.createdAt)}
                </p>
                {question.car ? (
                  <Link
                    href={`/cars/${question.car.slug}`}
                    className="mt-2 inline-flex text-[11px] text-purple-300 hover:text-sky-600"
                  >
                    {question.car.manufacturer} {question.car.model}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">گزارش سریع</h3>
          <div className="mt-4 space-y-3">
            {reportsSummaryCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
                <p className="mt-1 text-[11px] text-slate-400">{card.helper}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p>رویدادهای تعاملی ثبت‌شده: {faNumberFormatter.format(totalEngagementEvents)}</p>
              <ul className="mt-2 space-y-1">
                {Object.entries(engagementByEventType).map(([eventType, value]) => (
                  <li key={eventType}>
                    {eventType}: {faNumberFormatter.format(value)}
                  </li>
                ))}
              </ul>
            </div>
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
