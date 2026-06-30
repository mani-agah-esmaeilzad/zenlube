import Link from "next/link";

import { resetDatabaseExceptAdminFormAction } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";
import {
  faDateFormatter,
  faDateTimeFormatter,
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

const orderStatusColors: Record<string, string> = {
  PENDING: "bg-amber-400",
  PAID: "bg-sky-500",
  SHIPPED: "bg-indigo-500",
  DELIVERED: "bg-emerald-500",
  CANCELLED: "bg-rose-400",
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
    maintenanceTasks,
    productQuestions,
    carQuestions,
    engagementGroups,
  } = data;

  const totalOrders = Object.values(ordersByStatus).reduce((acc, value) => acc + value, 0);
  const successfulOrders =
    (ordersByStatus.PAID ?? 0) +
    (ordersByStatus.SHIPPED ?? 0) +
    (ordersByStatus.DELIVERED ?? 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCustomers = users.filter((user) => user.role === "CUSTOMER").length;
  const totalAdmins = users.length - totalCustomers;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomers30 = users.filter(
    (user) => user.role === "CUSTOMER" && user.createdAt >= thirtyDaysAgo,
  ).length;
  const inventoryValue = products.reduce((acc, product) => acc + product.price * product.stock, 0);
  const lowStockCount = products.filter((product) => product.stock < 10).length;
  const outOfStockCount = products.filter((product) => product.stock <= 0).length;
  const pendingProductQuestions = productQuestions.filter((question) => question.status === "PENDING").length;
  const pendingCarQuestions = carQuestions.filter((question) => question.status === "PENDING").length;
  const notebookViews = engagementGroups
    .filter((item) => item.eventType === "notebook_view")
    .reduce((sum, item) => sum + item.count, 0);
  const comparisonAdds = engagementGroups
    .filter((item) => item.eventType === "comparison_add")
    .reduce((sum, item) => sum + item.count, 0);
  const maintenanceCoverage = cars.length ? Math.round((maintenanceTasks.length / Math.max(cars.length, 1)) * 100) : 0;
  const latestProducts = products.slice(0, 5);
  const recentUsers = users.slice(0, 5);
  const recentOrderChart = recentOrders.slice(0, 6).reverse();
  const chartMax = Math.max(...recentOrderChart.map((order) => order.total), 1);

  const metricCards = [
    {
      label: "درآمد کل",
      value: formatPrice(totalRevenue),
      helper: `${faNumberFormatter.format(totalOrders)} سفارش ثبت شده`,
    },
    {
      label: "درآمد ۳۰ روز اخیر",
      value: formatPrice(revenueLast30),
      helper: `${faNumberFormatter.format(ordersLast30)} سفارش در ۳۰ روز اخیر`,
    },
    {
      label: "میانگین ارزش سفارش",
      value: formatPrice(averageOrderValue),
      helper: `${faNumberFormatter.format(successfulOrders)} سفارش موفق`,
    },
    {
      label: "مشتریان فعال",
      value: faNumberFormatter.format(totalCustomers),
      helper: `${faNumberFormatter.format(newCustomers30)} مشتری جدید`,
    },
    {
      label: "محصولات فعال",
      value: faNumberFormatter.format(products.length),
      helper: `${faNumberFormatter.format(lowStockCount)} مورد کم‌موجودی`,
    },
    {
      label: "ارزش موجودی",
      value: formatPrice(inventoryValue),
      helper: `${faNumberFormatter.format(brands.length)} برند · ${faNumberFormatter.format(categories.length)} دسته`,
    },
  ];

  const operationsCards = [
    {
      label: "هشدار موجودی",
      value: faNumberFormatter.format(lowStockCount),
      helper: `${faNumberFormatter.format(outOfStockCount)} کالا ناموجود`,
      href: "/admin?tab=products&stockStatus=low",
    },
    {
      label: "پرسش‌های بی‌پاسخ",
      value: faNumberFormatter.format(pendingProductQuestions + pendingCarQuestions),
      helper: `محصول ${faNumberFormatter.format(pendingProductQuestions)} · خودرو ${faNumberFormatter.format(
        pendingCarQuestions,
      )}`,
      href: "/admin?tab=questions",
    },
    {
      label: "پوشش نگهداری",
      value: `${faNumberFormatter.format(maintenanceCoverage)}٪`,
      helper: `${faNumberFormatter.format(maintenanceTasks.length)} برنامه فعال`,
      href: "/admin?tab=maintenance",
    },
    {
      label: "تعامل‌های کلیدی",
      value: faNumberFormatter.format(notebookViews + comparisonAdds),
      helper: `دفترچه ${faNumberFormatter.format(notebookViews)} · مقایسه ${faNumberFormatter.format(comparisonAdds)}`,
      href: "/admin?tab=reports",
    },
  ];

  const quickActions = [
    { label: "افزودن محصول جدید", href: "/admin?tab=products" },
    { label: "رسیدگی به سفارش‌ها", href: "/admin?tab=orders" },
    { label: "پاسخ به پرسش‌ها", href: "/admin?tab=questions" },
    { label: "به‌روزرسانی دفترچه خودروها", href: "/admin?tab=maintenance" },
  ];

  const orderStatusItems = Object.entries(orderStatusLabels).map(([key, label]) => {
    const value = ordersByStatus[key] ?? 0;
    const share = totalOrders > 0 ? Math.round((value / totalOrders) * 100) : 0;
    return {
      key,
      label,
      value,
      share,
      colorClass: orderStatusColors[key] ?? "bg-slate-300",
    };
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {metricCards.map((card) => (
          <div key={card.label} className="admin-kpi">
            <p className="admin-kpi-label">{card.label}</p>
            <p className="admin-kpi-value">{card.value}</p>
            <p className="admin-kpi-helper">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="admin-panel p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#111827]">نماگر فروش سفارش‌های اخیر</h2>
              <p className="mt-1 text-xs leading-6 text-[#667085]">
                این نمودار از شش سفارش اخیر ساخته شده تا شیب فروش و سطح پرداخت را سریع ببینید.
              </p>
            </div>
            <span className="admin-chip">{faNumberFormatter.format(recentOrderChart.length)} سفارش اخیر</span>
          </div>

          {recentOrderChart.length ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[24px] border border-[#E6EAF2] bg-[#F8FAFC] p-4">
                <div className="flex h-48 items-end justify-between gap-3">
                  {recentOrderChart.map((order) => (
                    <div key={order.id} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                      <div className="flex h-40 w-full items-end justify-center">
                        <div
                          className="w-full rounded-t-[16px] bg-gradient-to-t from-[#F59E0B] to-[#FFD38A]"
                          style={{
                            height: `${Math.max(18, Math.round((order.total / chartMax) * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-[11px] font-bold text-[#111827]">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-[10px] text-[#98A2B3]">#{order.id.slice(0, 5)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {recentOrderChart.map((order) => (
                  <div key={order.id} className="rounded-[22px] border border-[#E6EAF2] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#111827]">{order.fullName}</p>
                        <p className="mt-1 text-[11px] text-[#98A2B3]">{faDateTimeFormatter.format(order.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-[#FFF7E8] px-3 py-1 text-[11px] font-bold text-[#D97706]">
                        {orderStatusLabels[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-[#111827]">{formatPrice(order.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-6 py-10 text-center text-sm text-[#667085]">
              هنوز سفارشی برای نمایش روند ثبت نشده است.
            </div>
          )}
        </div>

        <div className="admin-panel p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#111827]">جریان وضعیت سفارش‌ها</h2>
              <p className="mt-1 text-xs leading-6 text-[#667085]">
                نسبت هر وضعیت به کل سفارش‌ها برای تصمیم‌های عملیاتی روزانه.
              </p>
            </div>
            <span className="admin-chip">{faNumberFormatter.format(totalOrders)} سفارش</span>
          </div>

          <div className="mt-6 space-y-4">
            {orderStatusItems.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-[#111827]">{item.label}</span>
                  <span className="text-[#667085]">
                    {faNumberFormatter.format(item.value)} · {faNumberFormatter.format(item.share)}٪
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#EEF2F7]">
                  <div
                    className={`h-2 rounded-full ${item.colorClass}`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-[#E6EAF2] bg-[#F8FAFC] p-4">
            <p className="text-xs font-bold text-[#667085]">خروجی سریع عملیات</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {operationsCards.map((card) => (
                <Link key={card.label} href={card.href} className="rounded-[20px] border border-[#E6EAF2] bg-white p-4 transition hover:border-[#F5C56B]">
                  <p className="text-xs text-[#667085]">{card.label}</p>
                  <p className="mt-2 text-xl font-black text-[#111827]">{card.value}</p>
                  <p className="mt-1 text-[11px] text-[#98A2B3]">{card.helper}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-panel p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#111827]">آخرین سفارش‌ها</h2>
              <p className="mt-1 text-xs leading-6 text-[#667085]">
                نمای فشرده مشتری، مبلغ و آخرین وضعیت برای رسیدگی سریع.
              </p>
            </div>
            <Link href="/admin?tab=orders" className="admin-chip">
              مشاهده همه سفارش‌ها
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div key={order.id} className="rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[#111827]">{order.fullName}</p>
                      <p className="mt-1 text-[11px] text-[#98A2B3]">
                        {order.email ?? "ایمیل ثبت نشده"} · {faDateTimeFormatter.format(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-[#111827]">{formatPrice(order.total)}</p>
                      <span className="mt-2 inline-flex rounded-full bg-[#FFF7E8] px-3 py-1 text-[11px] font-bold text-[#D97706]">
                        {orderStatusLabels[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-6 py-10 text-center text-sm text-[#667085]">
                هنوز سفارشی ثبت نشده است.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="admin-panel p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#111827]">دسترسی سریع</h2>
                <p className="mt-1 text-xs leading-6 text-[#667085]">پرتکرارترین مسیرهای کاری برای ادمین.</p>
              </div>
              <span className="admin-chip">{faNumberFormatter.format(quickActions.length)} مسیر</span>
            </div>
            <div className="mt-6 grid gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between rounded-[20px] border border-[#E6EAF2] bg-[#FBFCFE] px-4 py-3 text-sm font-bold text-[#111827] transition hover:border-[#F5C56B] hover:bg-white"
                >
                  <span>{action.label}</span>
                  <span className="text-[#F59E0B]">←</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="admin-panel p-5 md:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                <p className="text-xs text-[#667085]">مدیران فعال</p>
                <p className="mt-2 text-xl font-black text-[#111827]">{faNumberFormatter.format(totalAdmins)}</p>
              </div>
              <div className="rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                <p className="text-xs text-[#667085]">خودروهای ثبت‌شده</p>
                <p className="mt-2 text-xl font-black text-[#111827]">{faNumberFormatter.format(cars.length)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="admin-panel p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#111827]">آخرین محصولات</h2>
              <p className="mt-1 text-xs leading-6 text-[#667085]">
                تازه‌ترین محصولات و وضعیت قیمت برای بازبینی سریع کاتالوگ.
              </p>
            </div>
            <Link href="/admin?tab=products" className="admin-chip">
              مدیریت محصولات
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {latestProducts.map((product) => (
              <div key={product.id} className="rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#111827]">{product.name}</p>
                    <p className="mt-1 text-[11px] text-[#98A2B3]">
                      {product.brand.name} · {product.category.name}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-[#111827]">{formatPrice(product.price)}</p>
                    <p className="mt-1 text-[11px] text-[#667085]">
                      موجودی {faNumberFormatter.format(product.stock)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#111827]">کاربران تازه</h2>
              <p className="mt-1 text-xs leading-6 text-[#667085]">
                رشد کاربران و تازه‌واردها را برای پیگیری فعال‌سازی مرور کنید.
              </p>
            </div>
            <Link href="/admin?tab=users" className="admin-chip">
              مشاهده کاربران
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#111827]">{user.name ?? "کاربر بدون نام"}</p>
                    <p className="mt-1 text-[11px] text-[#98A2B3]">{user.email ?? "ایمیل ثبت نشده"}</p>
                  </div>
                  <div className="text-left">
                    <span className="rounded-full bg-[#F4F7FB] px-3 py-1 text-[11px] font-bold text-[#475467]">
                      {user.role === "ADMIN" ? "مدیر" : "مشتری"}
                    </span>
                    <p className="mt-2 text-[11px] text-[#98A2B3]">{faDateFormatter.format(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-[#B42318]">نگهداری و خطر</p>
            <h2 className="mt-2 text-xl font-black text-[#111827]">بازنشانی کامل پایگاه داده</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#667085]">
              این اقدام تمام اطلاعات فروشگاه را حذف می‌کند و فقط ادمین فعلی باقی می‌ماند. قبل از اجرا از فایل‌های لازم نسخه پشتیبان بگیرید.
            </p>
          </div>
          <form action={resetDatabaseExceptAdminFormAction}>
            <button type="submit" className="rounded-2xl bg-[#D92D20] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#B42318]">
              بازنشانی پایگاه داده
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
