import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createBrandAction,
  createCarAction,
  createCategoryAction,
  createMaintenanceTaskAction,
  createProductAction,
  deleteBrandFormAction,
  deleteMaintenanceTaskFormAction,
  deleteCategoryFormAction,
  deleteProductFormAction,
  answerQuestionAction,
  archiveQuestionAction,
  updateUserRoleAction,
} from "@/actions/admin";
import { getAppSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { cn, formatPrice } from "@/lib/utils";

export const revalidate = 0;

const tabs = [
  { id: "overview", label: "نمای کلی" },
  { id: "products", label: "محصولات" },
  { id: "cars", label: "خودروها" },
  { id: "maintenance", label: "نگهداری" },
  { id: "questions", label: "پرسش‌ها" },
  { id: "brands", label: "برندها" },
  { id: "categories", label: "دسته‌بندی‌ها" },
  { id: "users", label: "کاربران" },
  { id: "reports", label: "گزارش‌ها" },
] as const;

type TabKey = (typeof tabs)[number]["id"];

const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
});

const numberFormatter = new Intl.NumberFormat("fa-IR");

const decimalFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
});

const orderStatusLabels: Record<string, string> = {
  PENDING: "در انتظار",
  PAID: "پرداخت‌شده",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغوشده",
};

const questionStatusLabels: Record<string, string> = {
  PENDING: "در انتظار پاسخ",
  ANSWERED: "پاسخ داده شده",
  ARCHIVED: "بایگانی شده",
};

const roleLabels = {
  ADMIN: "مدیر",
  CUSTOMER: "مشتری",
} as const;

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const rawSession = await getAppSession();
  const role = (rawSession as { user?: { role?: string | null } } | null)?.user?.role;

  if (role !== "ADMIN") {
    redirect("/sign-in?callbackUrl=/admin");
  }

  const sessionUserId =
    (rawSession as { user?: { id?: string | null } } | null)?.user?.id ?? null;

  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedTabParam = resolvedSearchParams.tab;
  const requestedTab = Array.isArray(requestedTabParam) ? requestedTabParam[0] : requestedTabParam;
  const activeTab =
    requestedTab && tabs.some((tab) => tab.id === requestedTab)
      ? (requestedTab as TabKey)
      : "overview";

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    categories,
    brands,
    cars,
    products,
    users,
    recentOrders,
    revenueAggregate,
    ordersByStatus,
    totalReviews,
    ordersLast30,
    revenueLast30Aggregate,
    maintenanceTasks,
    productQuestions,
    carQuestions,
    engagementGroups,
  ] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.car.findMany({
      orderBy: [
        { manufacturer: "asc" },
        { model: "asc" },
      ],
      include: {
        _count: { select: { productMappings: true } },
      },
    }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        brand: true,
        category: true,
        carMappings: {
          include: { car: true },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true } },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.productReview.count(),
    prisma.order.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.carMaintenanceTask.findMany({
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            generation: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { priority: "asc" },
        { updatedAt: "desc" },
      ],
    }),
    prisma.productQuestion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            brand: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.carQuestion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        car: {
          select: {
            id: true,
            manufacturer: true,
            model: true,
            slug: true,
          },
        },
      },
    }),
    prisma.engagementEvent.groupBy({
      by: ["entityType", "entityId", "eventType"],
      _count: { _all: true },
      orderBy: { _count: { entityId: "desc" } },
      take: 30,
    }),
  ]);

  const totalRevenue = Number(revenueAggregate._sum.total ?? 0);
  const revenueLast30 = Number(revenueLast30Aggregate._sum.total ?? 0);

  const orderStatusCounts = ordersByStatus.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  const totalOrders = Object.values(orderStatusCounts).reduce((acc, count) => acc + count, 0);
  const pendingOrders = orderStatusCounts.PENDING ?? 0;
  const paidOrders = orderStatusCounts.PAID ?? 0;
  const shippedOrders = orderStatusCounts.SHIPPED ?? 0;
  const deliveredOrders = orderStatusCounts.DELIVERED ?? 0;
  const cancelledOrders = orderStatusCounts.CANCELLED ?? 0;
  const successfulOrders = paidOrders + shippedOrders + deliveredOrders;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const totalProducts = products.length;
  const totalBrands = brands.length;
  const totalCategories = categories.length;
  const totalCars = cars.length;
  const totalCustomers = users.filter((user) => user.role === "CUSTOMER").length;
  const totalAdmins = users.length - totalCustomers;
  const newCustomers30 = users.filter(
    (user) => user.role === "CUSTOMER" && user.createdAt >= thirtyDaysAgo,
  ).length;

  const inventoryValue = products.reduce(
    (acc, product) => acc + Number(product.price) * product.stock,
    0,
  );

  const lowStockProducts = products.filter((product) => product.stock < 10);
  const lowStockCount = lowStockProducts.length;
  const lowStockPreview = lowStockProducts.slice(0, 5);

  const bestSellingBrands = [...brands]
    .sort((a, b) => b._count.products - a._count.products)
    .slice(0, 5);
  const busiestCategories = [...categories]
    .sort((a, b) => b._count.products - a._count.products)
    .slice(0, 5);

  const recentUsers = users.slice(0, 5);
  const latestProducts = products.slice(0, 5);

  const overviewCards = [
    {
      label: "درآمد کل",
      value: formatPrice(totalRevenue),
      helper: `${numberFormatter.format(totalOrders)} سفارش ثبت‌شده`,
    },
    {
      label: "درآمد ۳۰ روز اخیر",
      value: formatPrice(revenueLast30),
      helper: `${numberFormatter.format(ordersLast30)} سفارش جدید در ۳۰ روز`,
    },
    {
      label: "میانگین ارزش سفارش",
      value: formatPrice(averageOrderValue),
      helper:
        successfulOrders > 0
          ? `${numberFormatter.format(successfulOrders)} سفارش موفق`
          : "داده‌ای ثبت نشده",
    },
    {
      label: "مشتریان فعال",
      value: numberFormatter.format(totalCustomers),
      helper: `${numberFormatter.format(newCustomers30)} مشتری جدید در ۳۰ روز اخیر`,
    },
    {
      label: "محصولات فعال",
      value: numberFormatter.format(totalProducts),
      helper: `${numberFormatter.format(lowStockCount)} مورد در آستانه اتمام موجودی`,
    },
    {
      label: "ارزش موجودی انبار",
      value: formatPrice(inventoryValue),
      helper: `${numberFormatter.format(totalBrands)} برند | ${numberFormatter.format(
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
          car: task.car ?? null,
          tasks: [] as typeof maintenanceTasks,
        });
      }
      acc.get(key)?.tasks.push(task);
      return acc;
    },
    new Map<string, { car: (typeof maintenanceTasks)[number]["car"] | null; tasks: typeof maintenanceTasks }>(),
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

  const totalNotebookViews = notebookViewEntries.reduce((sum, item) => sum + item._count._all, 0);
  const totalComparisonAdds = comparisonEntries.reduce((sum, item) => sum + item._count._all, 0);
  const totalEngagementEvents = engagementGroups.reduce((sum, item) => sum + item._count._all, 0);

  const engagementByEventType = engagementGroups.reduce<Record<string, number>>((acc, item) => {
    acc[item.eventType] = (acc[item.eventType] ?? 0) + item._count._all;
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
        count: entry._count._all,
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
        count: entry._count._all,
      };
    })
    .filter(Boolean)
    .slice(0, 6) as Array<{ product: (typeof products)[number]; count: number }>;

  const reportsSummaryCards = [
    {
      label: "برنامه‌های نگهداری",
      value: numberFormatter.format(maintenanceTasks.length),
      helper: `${numberFormatter.format(maintenanceGroups.length)} خودرو پوشش داده شده است`,
    },
    {
      label: "پرسش‌های در انتظار",
      value: numberFormatter.format(pendingProductQuestionsCount + pendingCarQuestionsCount),
      helper: `محصول: ${numberFormatter.format(pendingProductQuestionsCount)} · خودرو: ${numberFormatter.format(pendingCarQuestionsCount)}`,
    },
    {
      label: "بازدید دفترچه دیجیتال",
      value: numberFormatter.format(totalNotebookViews),
      helper: `${numberFormatter.format(topCarNotebookViews.length)} خودرو پرتوجه`,
    },
    {
      label: "افزودن به مقایسه",
      value: numberFormatter.format(totalComparisonAdds),
      helper: `${numberFormatter.format(topProductComparisons.length)} محصول پرتکرار`,
    },
  ];

  const content = (() => {
    switch (activeTab) {
      case "overview":
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
                      {numberFormatter.format(chip.value)}
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
                      ? `${numberFormatter.format(totalOrders)} سفارش در مجموع`
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
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {order.user?.email ?? order.email}
                          </td>
                          <td className="px-4 py-3 text-slate-900">{formatPrice(order.total)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                              {orderStatusLabels[order.status] ?? order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {dateTimeFormatter.format(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-6 py-10 text-sm text-slate-500">هنوز سفارشی ثبت نشده است.</p>
                )}
              </div>

              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-900">برندهای دارای بیشترین محصول</h2>
                  </div>
                  {bestSellingBrands.length ? (
                    <ul className="divide-y divide-slate-200">
                      {bestSellingBrands.map((brand) => (
                        <li
                          key={brand.id}
                          className="flex items-center justify-between px-5 py-3 text-sm text-slate-700"
                        >
                          <div>
                            <p className="text-slate-900">{brand.name}</p>
                            <p className="text-xs text-slate-400">{brand.slug}</p>
                          </div>
                          <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-600">
                            {numberFormatter.format(brand._count.products)} محصول
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-5 py-8 text-xs text-slate-400">هنوز برندی ثبت نشده است.</p>
                  )}
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-900">دسته‌بندی‌های پرترافیک</h2>
                  </div>
                  {busiestCategories.length ? (
                    <ul className="divide-y divide-slate-200">
                      {busiestCategories.map((category) => (
                        <li
                          key={category.id}
                          className="flex items-center justify-between px-5 py-3 text-sm text-slate-700"
                        >
                          <div>
                            <p className="text-slate-900">{category.name}</p>
                            <p className="text-xs text-slate-400">{category.slug}</p>
                          </div>
                          <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-600">
                            {numberFormatter.format(category._count.products)} محصول
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-5 py-8 text-xs text-slate-400">هنوز دسته‌بندی ثبت نشده است.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-sm font-semibold text-slate-900">آخرین کاربران ثبت‌نام‌شده</h2>
                </div>
                {recentUsers.length ? (
                  <ul className="divide-y divide-slate-200">
                    {recentUsers.map((user) => (
                      <li
                        key={user.id}
                        className="flex items-center justify-between px-5 py-3 text-sm text-slate-700"
                      >
                        <div>
                          <p className="text-slate-900">{user.name ?? user.email}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                        <div className="text-left text-xs text-slate-400">
                          <p>{roleLabels[user.role]}</p>
                          <p>{dateFormatter.format(user.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-xs text-slate-400">هنوز کاربری ثبت نشده است.</p>
                )}
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-sm font-semibold text-slate-900">محصولات تازه به‌روزرسانی‌شده</h2>
                </div>
                {latestProducts.length ? (
                  <ul className="divide-y divide-slate-200">
                    {latestProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between px-5 py-3 text-sm text-slate-700"
                      >
                        <div>
                          <p className="text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-400">
                            {product.brand.name} · {product.category.name}
                          </p>
                        </div>
                        <div className="text-left text-xs text-slate-400">
                          <p>{formatPrice(product.price)}</p>
                          <p>{numberFormatter.format(product.stock)} عدد موجودی</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-xs text-slate-400">هنوز محصولی ثبت نشده است.</p>
                )}
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    محصولات در آستانه اتمام موجودی
                  </h2>
                </div>
                {lowStockPreview.length ? (
                  <ul className="divide-y divide-slate-200">
                    {lowStockPreview.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between px-5 py-3 text-sm text-slate-700"
                      >
                        <div>
                          <p className="text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.brand.name}</p>
                        </div>
                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-200">
                          {numberFormatter.format(product.stock)} عدد
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-xs text-slate-400">
                    هیچ محصولی در آستانه اتمام موجودی نیست.
                  </p>
                )}
              </div>
            </section>
          </div>
        );
      case "products":
        return (
          <div className="space-y-10">
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">افزودن محصول جدید</h2>
              <p className="mt-2 text-xs text-slate-500">
                پس از ثبت محصول، خودروهای سازگار را انتخاب کنید تا در صفحه خودروها و پیشنهادها
                نمایش داده شود.
              </p>
              <form
                action={async (formData) => {
                  "use server";
                  await createProductAction(formData);
                }}
                className="mt-6 grid gap-4 sm:grid-cols-2"
              >
                <input
                  name="name"
                  placeholder="نام محصول"
                  className="sm:col-span-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <input
                  name="slug"
                  placeholder="اسلاگ (مثال: mobil-1-5w30)"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <input
                  name="sku"
                  placeholder="کد محصول / SKU"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <input
                  name="price"
                  placeholder="قیمت (ریال)"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <input
                  name="stock"
                  placeholder="موجودی"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <input
                  name="viscosity"
                  placeholder="ویسکوزیته"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <input
                  name="oilType"
                  placeholder="نوع روغن (مثال: تمام سنتتیک)"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <input
                  name="imageUrl"
                  placeholder="آدرس تصویر محصول"
                  className="sm:col-span-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <div>
                  <label className="text-xs text-slate-500">دسته‌بندی</label>
                  <select
                    name="categoryId"
                    className="mt-2 w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">برند</label>
                  <select
                    name="brandId"
                    className="mt-2 w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">خودروهای سازگار</label>
                  <select
                    name="carIds"
                    multiple
                    className="mt-2 h-40 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  >
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.manufacturer} {car.model} {car.generation ?? ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] text-slate-400">
                    با نگه داشتن کلیدهای Ctrl یا Cmd می‌توانید چند خودرو را همزمان انتخاب کنید.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    className="h-5 w-5 rounded border border-slate-200 bg-slate-100"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-slate-500">
                    نمایش در محصولات ویژه
                  </label>
                </div>
                <textarea
                  name="description"
                  placeholder="توضیحات محصول"
                  className="sm:col-span-2 h-28 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                />
                <button
                  type="submit"
                  className="sm:col-span-2 rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600"
                >
                  ذخیره محصول
                </button>
              </form>
            </section>

            {lowStockCount ? (
              <section className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
                <h3 className="text-sm font-semibold text-slate-900">محصولات کم‌موجودی</h3>
                <p className="mt-1 text-xs text-slate-600">
                  {numberFormatter.format(lowStockCount)} محصول کمتر از ۱۰ عدد موجودی دارند.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lowStockPreview.map((product) => (
                    <span
                      key={product.id}
                      className="rounded-full border border-yellow-400/40 px-3 py-1 text-xs text-yellow-100"
                    >
                      {product.name} ({numberFormatter.format(product.stock)})
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">مدیریت محصولات</h2>
                <p className="mt-2 text-xs text-slate-500">
                  برای حذف محصول از جدول زیر استفاده کنید. برای ویرایش، محصول را دوباره با اسلاگ
                  مشابه ثبت کنید تا به‌روزرسانی انجام شود.
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-right">نام</th>
                      <th className="px-4 py-3 text-right">برند</th>
                      <th className="px-4 py-3 text-right">دسته‌بندی</th>
                      <th className="px-4 py-3 text-right">قیمت</th>
                      <th className="px-4 py-3 text-right">موجودی</th>
                      <th className="px-4 py-3 text-right">خودروها</th>
                      <th className="px-4 py-3 text-right">اقدامات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-slate-50">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3 text-slate-900">{product.name}</td>
                        <td className="px-4 py-3">{product.brand.name}</td>
                        <td className="px-4 py-3">{product.category.name}</td>
                        <td className="px-4 py-3">{formatPrice(product.price)}</td>
                        <td className="px-4 py-3">{numberFormatter.format(product.stock)}</td>
                        <td className="px-4 py-3 text-xs">
                          {product.carMappings.length ? (
                            <div className="flex flex-wrap gap-2">
                              {product.carMappings.map(({ car }) => (
                                <span
                                  key={car.id}
                                  className="rounded-full border border-slate-200 px-2 py-1"
                                >
                                  {car.manufacturer} {car.model}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">ثبت‌نشده</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <form
                            action={async (formData) => {
                              "use server";
                              await deleteProductFormAction(formData);
                            }}
                          >
                            <input type="hidden" name="productId" value={product.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-red-400/40 px-3 py-1 text-xs text-red-200 transition hover:border-red-300 hover:text-red-100"
                            >
                              حذف
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        );
      case "cars":
        return (
          <div className="space-y-10">
            <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">ثبت یا ویرایش خودرو</h2>
                <p className="mt-2 text-xs text-slate-500">
                  خودرو جدید را با دیتاشیت کامل ثبت کنید. برای ویرایش، فرم را با همان اسلاگ ارسال
                  کنید تا اطلاعات دفترچه‌ای به‌روزرسانی شود.
                </p>
                <form
                  action={async (formData) => {
                    "use server";
                    await createCarAction(formData);
                  }}
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                >
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
                      {numberFormatter.format(totalCars)} خودرو در پایگاه داده موجود است.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                    مرتب‌سازی بر اساس سازنده
                  </span>
                </div>
                <div className="overflow-hidden rounded-3xl border border-slate-200">
                  {cars.length ? (
                    <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                      <thead className="bg-slate-100 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-4 py-3 text-right">نام</th>
                          <th className="px-4 py-3 text-right">سال‌ها</th>
                          <th className="px-4 py-3 text-right">موتور</th>
                          <th className="px-4 py-3 text-right">ویسکوزیته</th>
                          <th className="px-4 py-3 text-right">محصولات مرتبط</th>
                          <th className="px-4 py-3 text-right">آخرین به‌روزرسانی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-slate-50">
                        {cars.map((car) => (
                          <tr key={car.id}>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <Link
                                  href={`/cars/${car.slug}`}
                                  className="text-slate-900 hover:text-sky-600"
                                >
                                  {car.manufacturer} {car.model}
                                </Link>
                                {car.generation && (
                                  <span className="text-xs text-slate-400">{car.generation}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {car.yearFrom ?? "نامشخص"} — {car.yearTo ?? "نامشخص"}
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
                                  {car.oilCapacityLit.toString()} لیتر
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {numberFormatter.format(car._count?.productMappings ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {dateFormatter.format(car.updatedAt)}
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
      case "maintenance":
        return (
          <div className="space-y-10">
            <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">افزودن برنامه نگهداری</h2>
                <p className="mt-2 text-xs text-slate-500">
                  برنامه‌های سرویس دوره‌ای را بر اساس خودرو و بازه‌های زمانی/کیلومتر ثبت کنید. با ثبت
                  دوباره همان عنوان برای یک خودرو، اطلاعات به‌روزرسانی می‌شود.
                </p>
                <form
                  action={async (formData) => {
                    "use server";
                    await createMaintenanceTaskAction(formData);
                  }}
                  className="mt-6 grid gap-4"
                >
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
                      برای اتصال مستقیم به محصولات، اسلاگ فروشگاهی را وارد کنید. در صورت خالی بودن این بخش،
                      فقط توضیحات نمایش داده خواهد شد.
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
                  <li>
                    تعداد کل برنامه‌ها: {numberFormatter.format(maintenanceTasks.length)} مورد
                  </li>
                  <li>
                    خودروهای دارای برنامه فعال: {numberFormatter.format(maintenanceGroups.length)} دستگاه
                  </li>
                  <li>
                    میانگین وظایف هر خودرو: {maintenanceGroups.length
                      ? decimalFormatter.format(maintenanceTasks.length / maintenanceGroups.length)
                      : "0"}
                  </li>
                </ul>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">راهنمای به‌روزرسانی</p>
                  <p className="mt-2 leading-6 text-slate-500">
                    برای ویرایش یک برنامه، همان عنوان را دوباره با اطلاعات جدید ارسال کنید. برای حذف، از
                    لیست برنامه‌های فعال استفاده کنید.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">دفترچه نگهداری خودروها</h2>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                  {numberFormatter.format(maintenanceTasks.length)} برنامه ثبت‌شده
                </span>
              </div>
              {maintenanceGroups.length ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  {maintenanceGroups.map((group, index) => {
                    const { car, tasks } = group;
                    const groupKey = car?.id ?? `group-${index}`;

                    return (
                      <div
                        key={groupKey}
                        className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6"
                      >
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
                            {numberFormatter.format(tasks.length)} وظیفه
                          </span>
                        </div>
                        <div className="space-y-3">
                          {tasks.map((task) => {
                            const recommendedProducts = task.recommendedProductSlugs ?? [];

                            return (
                              <div
                                key={task.id}
                                className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                              >
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
                                    هر {task.intervalKm ? numberFormatter.format(task.intervalKm) + " کیلومتر" : "—"}
                                  </span>
                                  <span className="rounded-full border border-slate-200 px-3 py-1">
                                    هر {task.intervalMonths ? numberFormatter.format(task.intervalMonths) + " ماه" : "—"}
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
                                <form
                                  action={async (formData) => {
                                    "use server";
                                    await deleteMaintenanceTaskFormAction(formData);
                                  }}
                                >
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
      case "questions":
        return (
          <div className="space-y-10">
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">پرسش‌های محصولات</h2>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                    {numberFormatter.format(pendingProductQuestionsCount)} در انتظار پاسخ
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {[...pendingProductQuestionsList, ...answeredProductQuestionsList].map((question) => {
                    const isAnswered = question.status === "ANSWERED";
                    return (
                      <div key={question.id} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                            <p className="mt-2 text-[11px] text-slate-400">
                              {question.authorName} · {dateFormatter.format(question.createdAt)}
                            </p>
                            {question.product ? (
                              <Link
                                href={`/products/${question.product.slug}`}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-purple-300 hover:text-sky-600"
                              >
                                {question.product.brand.name} · {question.product.name}
                              </Link>
                            ) : null}
                          </div>
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1 text-[11px]",
                              isAnswered
                                ? "border-emerald-400/40 text-emerald-200"
                                : question.status === "ARCHIVED"
                                ? "border-slate-200 text-slate-400"
                                : "border-yellow-400/40 text-yellow-200",
                            )}
                          >
                            {questionStatusLabels[question.status] ?? question.status}
                          </span>
                        </div>
                        <form
                          action={async (formData) => {
                            "use server";
                            await answerQuestionAction(formData);
                          }}
                          className="space-y-3"
                        >
                          <input type="hidden" name="questionId" value={question.id} />
                          <input type="hidden" name="type" value="product" />
                          <textarea
                            name="answer"
                            defaultValue={question.answer ?? ""}
                            placeholder="پاسخ خود را بنویسید"
                            className="h-24 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                          />
                          <label className="flex items-center gap-2 text-[11px] text-slate-500">
                            <input
                              name="markAnswered"
                              type="checkbox"
                              defaultChecked={isAnswered}
                              className="h-4 w-4 rounded border border-slate-200 bg-slate-100"
                            />
                            علامت‌گذاری به عنوان پاسخ داده شده
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="submit"
                              className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-sky-600"
                            >
                              ذخیره پاسخ
                            </button>
                            <button
                              type="submit"
                              formAction={async () => {
                                "use server";
                                await archiveQuestionAction(question.id, "product");
                              }}
                              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500 transition hover:border-white/40 hover:text-slate-700"
                            >
                              بایگانی
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">پرسش‌های خودرو</h2>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                    {numberFormatter.format(pendingCarQuestionsCount)} در انتظار پاسخ
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {[...pendingCarQuestionsList, ...answeredCarQuestionsList].map((question) => {
                    const isAnswered = question.status === "ANSWERED";
                    return (
                      <div key={question.id} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                            <p className="mt-2 text-[11px] text-slate-400">
                              {question.authorName} · {dateFormatter.format(question.createdAt)}
                            </p>
                            {question.car ? (
                              <Link
                                href={`/cars/${question.car.slug}`}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-purple-300 hover:text-sky-600"
                              >
                                {question.car.manufacturer} · {question.car.model}
                              </Link>
                            ) : null}
                          </div>
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1 text-[11px]",
                              isAnswered
                                ? "border-emerald-400/40 text-emerald-200"
                                : question.status === "ARCHIVED"
                                ? "border-slate-200 text-slate-400"
                                : "border-yellow-400/40 text-yellow-200",
                            )}
                          >
                            {questionStatusLabels[question.status] ?? question.status}
                          </span>
                        </div>
                        <form
                          action={async (formData) => {
                            "use server";
                            await answerQuestionAction(formData);
                          }}
                          className="space-y-3"
                        >
                          <input type="hidden" name="questionId" value={question.id} />
                          <input type="hidden" name="type" value="car" />
                          <textarea
                            name="answer"
                            defaultValue={question.answer ?? ""}
                            placeholder="پاسخ خود را بنویسید"
                            className="h-24 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                          />
                          <label className="flex items-center gap-2 text-[11px] text-slate-500">
                            <input
                              name="markAnswered"
                              type="checkbox"
                              defaultChecked={isAnswered}
                              className="h-4 w-4 rounded border border-slate-200 bg-slate-100"
                            />
                            علامت‌گذاری به عنوان پاسخ داده شده
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="submit"
                              className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-sky-600"
                            >
                              ذخیره پاسخ
                            </button>
                            <button
                              type="submit"
                              formAction={async () => {
                                "use server";
                                await archiveQuestionAction(question.id, "car");
                              }}
                              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500 transition hover:border-white/40 hover:text-slate-700"
                            >
                              بایگانی
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        );
      case "brands":
        return (
          <div className="space-y-10">
            <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">افزودن برند</h2>
                <p className="mt-2 text-xs text-slate-500">
                  برند جدید را با اطلاعات کامل ثبت کنید تا در فرم‌های محصول و صفحات فروشگاهی
                  در دسترس باشد.
                </p>
                <form
                  action={async (formData) => {
                    "use server";
                    await createBrandAction(formData);
                  }}
                  className="mt-6 space-y-4"
                >
                  <input
                    name="name"
                    placeholder="نام برند"
                    className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <input
                    name="slug"
                    placeholder="اسلاگ (مثال: mobil-1)"
                    className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <input
                    name="imageUrl"
                    placeholder="آدرس لوگو یا تصویر برند (اختیاری)"
                    className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <input
                    name="website"
                    placeholder="وب‌سایت رسمی (اختیاری)"
                    className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <textarea
                    name="description"
                    placeholder="توضیح کوتاه درباره برند"
                    className="h-24 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600"
                  >
                    ذخیره برند
                  </button>
                </form>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-sm font-semibold text-slate-900">گزارش برندها</h3>
                <ul className="mt-4 space-y-3 text-xs text-slate-500">
                  <li>
                    مجموع برندهای ثبت‌شده:{" "}
                    <span className="text-slate-900">{numberFormatter.format(totalBrands)}</span>
                  </li>
                  <li>
                    میانگین محصول برای هر برند:{" "}
                    <span className="text-slate-900">
                      {decimalFormatter.format(brandAverageProducts)}
                    </span>
                  </li>
                  <li>
                    پربارترین برند:{" "}
                    {bestSellingBrands[0] ? (
                      <span className="text-slate-900">
                        {bestSellingBrands[0].name} (
                        {numberFormatter.format(bestSellingBrands[0]._count.products)} محصول)
                      </span>
                    ) : (
                      <span className="text-slate-900">—</span>
                    )}
                  </li>
                  <li>
                    مجموع نظرات محصولات:{" "}
                    <span className="text-slate-900">{numberFormatter.format(totalReviews)}</span>
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
                      const canDelete = brand._count.products === 0;
                      return (
                        <tr key={brand.id}>
                          <td className="px-4 py-3 text-slate-900">{brand.name}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{brand.slug}</td>
                          <td className="px-4 py-3">
                            {numberFormatter.format(brand._count.products)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {dateFormatter.format(brand.createdAt)}
                          </td>
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
                            <form
                              action={async (formData) => {
                                "use server";
                                await deleteBrandFormAction(formData);
                              }}
                              className="flex items-center gap-2"
                            >
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
                                  "rounded-full border px-3 py-1 text-xs transition",
                                  canDelete
                                    ? "border-red-400/40 text-red-200 hover:border-red-300 hover:text-red-100"
                                    : "cursor-not-allowed border-slate-200 text-slate-300",
                                )}
                              >
                                حذف
                              </button>
                            </form>
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
      case "categories":
        return (
          <div className="space-y-10">
            <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">افزودن دسته‌بندی</h2>
                <p className="mt-2 text-xs text-slate-500">
                  برای نمایش دقیق‌تر محصولات، دسته‌بندی‌های تخصصی تعریف کنید.
                </p>
                <form
                  action={async (formData) => {
                    "use server";
                    await createCategoryAction(formData);
                  }}
                  className="mt-6 space-y-4"
                >
                  <input
                    name="name"
                    placeholder="نام دسته‌بندی"
                    className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <input
                    name="slug"
                    placeholder="اسلاگ (مثال: full-synthetic)"
                    className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <input
                    name="imageUrl"
                    placeholder="آدرس تصویر شاخص (اختیاری)"
                    className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <textarea
                    name="description"
                    placeholder="توضیح کوتاه"
                    className="h-24 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600"
                  >
                    ذخیره دسته‌بندی
                  </button>
                </form>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-sm font-semibold text-slate-900">گزارش دسته‌بندی‌ها</h3>
                <ul className="mt-4 space-y-3 text-xs text-slate-500">
                  <li>
                    مجموع دسته‌بندی‌ها:{" "}
                    <span className="text-slate-900">{numberFormatter.format(totalCategories)}</span>
                  </li>
                  <li>
                    میانگین محصول برای هر دسته:{" "}
                    <span className="text-slate-900">
                      {decimalFormatter.format(categoryAverageProducts)}
                    </span>
                  </li>
                  <li>
                    پرترافیک‌ترین دسته:{" "}
                    {busiestCategories[0] ? (
                      <span className="text-slate-900">
                        {busiestCategories[0].name} (
                        {numberFormatter.format(busiestCategories[0]._count.products)} محصول)
                      </span>
                    ) : (
                      <span className="text-slate-900">—</span>
                    )}
                  </li>
                  <li>
                    محصولات کم‌موجودی:{" "}
                    <span className="text-slate-900">{numberFormatter.format(lowStockCount)}</span>
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
                      const canDelete = category._count.products === 0;
                      return (
                        <tr key={category.id}>
                          <td className="px-4 py-3 text-slate-900">{category.name}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{category.slug}</td>
                          <td className="px-4 py-3">
                            {numberFormatter.format(category._count.products)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {dateFormatter.format(category.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <form
                              action={async (formData) => {
                                "use server";
                                await deleteCategoryFormAction(formData);
                              }}
                              className="flex items-center gap-2"
                            >
                              <input type="hidden" name="categoryId" value={category.id} />
                              <button
                                type="submit"
                                disabled={!canDelete}
                                title={
                                  canDelete
                                    ? "حذف دسته‌بندی"
                                    : "ابتدا محصولات وابسته به این دسته را مدیریت کنید."
                                }
                                className={cn(
                                  "rounded-full border px-3 py-1 text-xs transition",
                                  canDelete
                                    ? "border-red-400/40 text-red-200 hover:border-red-300 hover:text-red-100"
                                    : "cursor-not-allowed border-slate-200 text-slate-300",
                                )}
                              >
                                حذف
                              </button>
                            </form>
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
      case "users":
        return (
          <div className="space-y-10">
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">مدیریت کاربران</h2>
              <p className="mt-2 text-xs text-slate-500">
                نقش کاربران را کنترل کنید و تصویر دقیقی از رشد کاربران فعال داشته باشید.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="rounded-full border border-slate-200 px-4 py-2">
                  {numberFormatter.format(users.length)} کاربر ثبت‌شده
                </span>
                <span className="rounded-full border border-slate-200 px-4 py-2">
                  {numberFormatter.format(totalAdmins)} مدیر فعال
                </span>
                <span className="rounded-full border border-slate-200 px-4 py-2">
                  {numberFormatter.format(totalCustomers)} مشتری فعال
                </span>
                <span className="rounded-full border border-slate-200 px-4 py-2">
                  {numberFormatter.format(newCustomers30)} ثبت‌نام جدید (۳۰ روز اخیر)
                </span>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
                <thead className="bg-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-right">نام</th>
                    <th className="px-4 py-3 text-right">ایمیل</th>
                    <th className="px-4 py-3 text-right">نقش</th>
                    <th className="px-4 py-3 text-right">سفارش‌ها</th>
                    <th className="px-4 py-3 text-right">تاریخ عضویت</th>
                    <th className="px-4 py-3 text-right">اقدامات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-slate-50">
                  {users.map((user) => {
                    const isSelf = sessionUserId === user.id;
                    return (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{user.name ?? "بدون نام"}</span>
                            {isSelf ? (
                              <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
                                شما
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{user.email}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {roleLabels[user.role]}
                        </td>
                        <td className="px-4 py-3">
                          {numberFormatter.format(user._count.orders)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {dateFormatter.format(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <form
                            action={async (formData) => {
                              "use server";
                              await updateUserRoleAction(formData);
                            }}
                            className="flex items-center gap-2"
                          >
                            <input type="hidden" name="userId" value={user.id} />
                            <select
                              name="role"
                              defaultValue={user.role}
                              disabled={isSelf}
                              className={cn(
                                "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700",
                                isSelf && "cursor-not-allowed opacity-50",
                              )}
                            >
                              <option value="CUSTOMER">مشتری</option>
                              <option value="ADMIN">مدیر</option>
                            </select>
                            <button
                              type="submit"
                              disabled={isSelf}
                              title={isSelf ? "امکان تغییر نقش کاربر فعلی وجود ندارد." : "ذخیره نقش"}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs transition",
                                isSelf
                                  ? "cursor-not-allowed border-slate-200 text-slate-300"
                                  : "border-sky-200 text-sky-600 hover:border-sky-200 hover:text-slate-900",
                              )}
                            >
                              به‌روزرسانی
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                  {!users.length ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">
                        هنوز کاربری ثبت نشده است.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </section>
          </div>
        );
      case "reports":
        return (
          <div className="space-y-10">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {reportsSummaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-500/10"
                >
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
                      جمع کل بازدید صفحات دفترچه: {numberFormatter.format(totalNotebookViews)}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-400">
                    {numberFormatter.format(topCarNotebookViews.length)} خودرو
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
                          {car.generation && (
                            <p className="text-[11px] text-slate-400">{car.generation}</p>
                          )}
                        </div>
                        <span className="rounded-full border border-sky-200 px-3 py-1 text-xs text-sky-600">
                          {numberFormatter.format(count)} بازدید
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-center text-xs text-slate-400">
                    هنوز داده‌ای برای نمایش بازدیدها ثبت نشده است.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">محصولات پرتکرار در مقایسه</h3>
                    <p className="mt-2 text-xs text-slate-500">
                      مجموع دفعات افزودن به مقایسه: {numberFormatter.format(totalComparisonAdds)}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-400">
                    {numberFormatter.format(topProductComparisons.length)} محصول
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
                          <Link
                            href={`/products/${product.slug}`}
                            className="font-medium text-slate-900 hover:text-sky-600"
                          >
                            {product.brand.name} · {product.name}
                          </Link>
                          <p className="text-[11px] text-slate-400">
                            {product.viscosity ?? "ویسکوزیته نامشخص"}
                          </p>
                        </div>
                        <span className="rounded-full border border-sky-200 px-3 py-1 text-xs text-sky-600">
                          {numberFormatter.format(count)} مرتبه
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-center text-xs text-slate-400">
                    هنوز کاربری محصولی را برای مقایسه اضافه نکرده است.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">خلاصه تعاملات ثبت‌شده</h3>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-400">
                  {numberFormatter.format(totalEngagementEvents)} رویداد
                </span>
              </div>
              {totalEngagementEvents ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(engagementByEventType).map(([eventType, count]) => (
                    <div
                      key={eventType}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                    >
                      <p className="text-xs text-slate-400">نوع رویداد</p>
                      <p className="mt-1 font-semibold text-slate-900">{eventType}</p>
                      <p className="mt-2 text-[11px] text-slate-500">
                        {numberFormatter.format(count)} بار ثبت شده است.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-center text-xs text-slate-400">
                  هنوز رویداد تعاملی در سیستم ثبت نشده است.
                </p>
              )}
            </section>
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">پنل مدیریت ZenLube</h1>
        <p className="text-sm leading-7 text-slate-600">
          تغییرات موجودی، برندها، دسته‌بندی‌ها و کاربران را در یک نگاه مدیریت کنید. تمام
          به‌روزرسانی‌ها بلافاصله در وب‌سایت اعمال می‌شود.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {numberFormatter.format(totalProducts)} محصول فعال
          </span>
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {numberFormatter.format(totalBrands)} برند
          </span>
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {numberFormatter.format(totalCategories)} دسته‌بندی
          </span>
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {numberFormatter.format(totalCars)} خودرو ثبت‌شده
          </span>
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {numberFormatter.format(totalOrders)} سفارش
          </span>
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {formatPrice(totalRevenue)} درآمد ثبت‌شده
          </span>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const href = tab.id === "overview" ? "/admin" : `/admin?tab=${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition",
                isActive
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-200/60"
                  : "text-slate-600 hover:bg-white hover:text-slate-900",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {content}
    </div>
  );
}
