import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createBrandAction,
  createCarAction,
  createCategoryAction,
  createProductAction,
  deleteBrandFormAction,
  deleteCategoryFormAction,
  deleteProductFormAction,
  updateUserRoleAction,
} from "@/actions/admin";
import { getAppSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { cn, formatPrice } from "@/lib/utils";

export const revalidate = 0;

const tabs = [
  { id: "overview", label: "نمای کلی" },
  { id: "products", label: "محصولات" },
  { id: "brands", label: "برندها" },
  { id: "categories", label: "دسته‌بندی‌ها" },
  { id: "users", label: "کاربران" },
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

const roleLabels = {
  ADMIN: "مدیر",
  CUSTOMER: "مشتری",
} as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const rawSession = await getAppSession();
  const role = (rawSession as { user?: { role?: string | null } } | null)?.user?.role;

  if (role !== "ADMIN") {
    redirect("/sign-in?callbackUrl=/admin");
  }

  const sessionUserId =
    (rawSession as { user?: { id?: string | null } } | null)?.user?.id ?? null;

  const requestedTab = searchParams?.tab ?? "overview";
  const activeTab = tabs.some((tab) => tab.id === requestedTab)
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

  const content = (() => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-10">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/20"
                >
                  <p className="text-sm text-white/60">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
                  <p className="mt-1 text-xs text-white/50">{card.helper}</p>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">وضعیت سفارش‌ها</h2>
              <div className="flex flex-wrap gap-3">
                {orderStatusChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                  >
                    <span>{chip.label}</span>
                    <span className="rounded-full bg-purple-500/20 px-2 py-1 text-white">
                      {numberFormatter.format(chip.value)}
                    </span>
                  </span>
                ))}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">آخرین سفارش‌ها</h2>
                  <span className="text-xs text-white/50">
                    {totalOrders
                      ? `${numberFormatter.format(totalOrders)} سفارش در مجموع`
                      : "هنوز سفارشی ثبت نشده"}
                  </span>
                </div>
                {recentOrders.length ? (
                  <table className="min-w-full divide-y divide-white/10 text-sm text-white/70">
                    <thead className="bg-black/40 text-xs uppercase text-white/50">
                      <tr>
                        <th className="px-4 py-3 text-right">مشتری</th>
                        <th className="px-4 py-3 text-right">ایمیل</th>
                        <th className="px-4 py-3 text-right">مبلغ</th>
                        <th className="px-4 py-3 text-right">وضعیت</th>
                        <th className="px-4 py-3 text-right">تاریخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 text-white">{order.fullName}</td>
                          <td className="px-4 py-3 text-xs text-white/60">
                            {order.user?.email ?? order.email}
                          </td>
                          <td className="px-4 py-3 text-white">{formatPrice(order.total)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                              {orderStatusLabels[order.status] ?? order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-white/50">
                            {dateTimeFormatter.format(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-6 py-10 text-sm text-white/60">هنوز سفارشی ثبت نشده است.</p>
                )}
              </div>

              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h2 className="text-sm font-semibold text-white">برندهای دارای بیشترین محصول</h2>
                  </div>
                  {bestSellingBrands.length ? (
                    <ul className="divide-y divide-white/10">
                      {bestSellingBrands.map((brand) => (
                        <li
                          key={brand.id}
                          className="flex items-center justify-between px-5 py-3 text-sm text-white/80"
                        >
                          <div>
                            <p className="text-white">{brand.name}</p>
                            <p className="text-xs text-white/40">{brand.slug}</p>
                          </div>
                          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-100">
                            {numberFormatter.format(brand._count.products)} محصول
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-5 py-8 text-xs text-white/50">هنوز برندی ثبت نشده است.</p>
                  )}
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h2 className="text-sm font-semibold text-white">دسته‌بندی‌های پرترافیک</h2>
                  </div>
                  {busiestCategories.length ? (
                    <ul className="divide-y divide-white/10">
                      {busiestCategories.map((category) => (
                        <li
                          key={category.id}
                          className="flex items-center justify-between px-5 py-3 text-sm text-white/80"
                        >
                          <div>
                            <p className="text-white">{category.name}</p>
                            <p className="text-xs text-white/40">{category.slug}</p>
                          </div>
                          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-100">
                            {numberFormatter.format(category._count.products)} محصول
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-5 py-8 text-xs text-white/50">هنوز دسته‌بندی ثبت نشده است.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-sm font-semibold text-white">آخرین کاربران ثبت‌نام‌شده</h2>
                </div>
                {recentUsers.length ? (
                  <ul className="divide-y divide-white/10">
                    {recentUsers.map((user) => (
                      <li
                        key={user.id}
                        className="flex items-center justify-between px-5 py-3 text-sm text-white/80"
                      >
                        <div>
                          <p className="text-white">{user.name ?? user.email}</p>
                          <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                        <div className="text-left text-xs text-white/50">
                          <p>{roleLabels[user.role]}</p>
                          <p>{dateFormatter.format(user.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-xs text-white/50">هنوز کاربری ثبت نشده است.</p>
                )}
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-sm font-semibold text-white">محصولات تازه به‌روزرسانی‌شده</h2>
                </div>
                {latestProducts.length ? (
                  <ul className="divide-y divide-white/10">
                    {latestProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between px-5 py-3 text-sm text-white/80"
                      >
                        <div>
                          <p className="text-white">{product.name}</p>
                          <p className="text-xs text-white/40">
                            {product.brand.name} · {product.category.name}
                          </p>
                        </div>
                        <div className="text-left text-xs text-white/50">
                          <p>{formatPrice(product.price)}</p>
                          <p>{numberFormatter.format(product.stock)} عدد موجودی</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-xs text-white/50">هنوز محصولی ثبت نشده است.</p>
                )}
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-sm font-semibold text-white">
                    محصولات در آستانه اتمام موجودی
                  </h2>
                </div>
                {lowStockPreview.length ? (
                  <ul className="divide-y divide-white/10">
                    {lowStockPreview.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between px-5 py-3 text-sm text-white/80"
                      >
                        <div>
                          <p className="text-white">{product.name}</p>
                          <p className="text-xs text-white/40">{product.brand.name}</p>
                        </div>
                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-200">
                          {numberFormatter.format(product.stock)} عدد
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-xs text-white/50">
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
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">افزودن محصول جدید</h2>
              <p className="mt-2 text-xs text-white/60">
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
                  className="sm:col-span-2 rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="slug"
                  placeholder="اسلاگ (مثال: mobil-1-5w30)"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="sku"
                  placeholder="کد محصول / SKU"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="price"
                  placeholder="قیمت (ریال)"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="stock"
                  placeholder="موجودی"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="viscosity"
                  placeholder="ویسکوزیته"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="oilType"
                  placeholder="نوع روغن (مثال: تمام سنتتیک)"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="imageUrl"
                  placeholder="آدرس تصویر محصول"
                  className="sm:col-span-2 rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <div>
                  <label className="text-xs text-white/60">دسته‌بندی</label>
                  <select
                    name="categoryId"
                    className="mt-2 w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60">برند</label>
                  <select
                    name="brandId"
                    className="mt-2 w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-white/60">خودروهای سازگار</label>
                  <select
                    name="carIds"
                    multiple
                    className="mt-2 h-40 w-full rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  >
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.manufacturer} {car.model} {car.generation ?? ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] text-white/40">
                    با نگه داشتن کلیدهای Ctrl یا Cmd می‌توانید چند خودرو را همزمان انتخاب کنید.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    className="h-5 w-5 rounded border border-white/15 bg-black/40"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-white/60">
                    نمایش در محصولات ویژه
                  </label>
                </div>
                <textarea
                  name="description"
                  placeholder="توضیحات محصول"
                  className="sm:col-span-2 h-28 rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <button
                  type="submit"
                  className="sm:col-span-2 rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
                >
                  ذخیره محصول
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">ثبت خودرو جدید</h2>
              <form
                action={async (formData) => {
                  "use server";
                  await createCarAction(formData);
                }}
                className="mt-6 grid gap-4 sm:grid-cols-2"
              >
                <input
                  name="slug"
                  placeholder="اسلاگ خودرو (مثال: bmw-3-series-f30-320i)"
                  className="sm:col-span-2 rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="manufacturer"
                  placeholder="سازنده"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="model"
                  placeholder="مدل"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="generation"
                  placeholder="تریم / نسل"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="engineType"
                  placeholder="نوع موتور"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="engineCode"
                  placeholder="کد موتور"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="viscosity"
                  placeholder="ویسکوزیته پیشنهادی"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="oilCapacityLit"
                  placeholder="ظرفیت روغن (لیتر)"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="yearFrom"
                  placeholder="سال شروع تولید"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <input
                  name="yearTo"
                  placeholder="سال پایان تولید"
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <textarea
                  name="specification"
                  placeholder="استاندارد یا توضیح تکمیلی"
                  className="sm:col-span-2 h-24 rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                />
                <button
                  type="submit"
                  className="sm:col-span-2 rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
                >
                  ذخیره خودرو
                </button>
              </form>
            </section>

            {lowStockCount ? (
              <section className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
                <h3 className="text-sm font-semibold text-white">محصولات کم‌موجودی</h3>
                <p className="mt-1 text-xs text-white/70">
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
                <h2 className="text-xl font-semibold text-white">مدیریت محصولات</h2>
                <p className="mt-2 text-xs text-white/60">
                  برای حذف محصول از جدول زیر استفاده کنید. برای ویرایش، محصول را دوباره با اسلاگ
                  مشابه ثبت کنید تا به‌روزرسانی انجام شود.
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm text-white/70">
                  <thead className="bg-black/40 text-xs uppercase text-white/50">
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
                  <tbody className="divide-y divide-white/10 bg-black/20">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3 text-white">{product.name}</td>
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
                                  className="rounded-full border border-white/15 px-2 py-1"
                                >
                                  {car.manufacturer} {car.model}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-white/40">ثبت‌نشده</span>
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
      case "brands":
        return (
          <div className="space-y-10">
            <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold text-white">افزودن برند</h2>
                <p className="mt-2 text-xs text-white/60">
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
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <input
                    name="slug"
                    placeholder="اسلاگ (مثال: mobil-1)"
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <input
                    name="imageUrl"
                    placeholder="آدرس لوگو یا تصویر برند (اختیاری)"
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <input
                    name="website"
                    placeholder="وب‌سایت رسمی (اختیاری)"
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <textarea
                    name="description"
                    placeholder="توضیح کوتاه درباره برند"
                    className="h-24 w-full rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
                  >
                    ذخیره برند
                  </button>
                </form>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <h3 className="text-sm font-semibold text-white">گزارش برندها</h3>
                <ul className="mt-4 space-y-3 text-xs text-white/60">
                  <li>
                    مجموع برندهای ثبت‌شده:{" "}
                    <span className="text-white">{numberFormatter.format(totalBrands)}</span>
                  </li>
                  <li>
                    میانگین محصول برای هر برند:{" "}
                    <span className="text-white">
                      {decimalFormatter.format(brandAverageProducts)}
                    </span>
                  </li>
                  <li>
                    پربارترین برند:{" "}
                    {bestSellingBrands[0] ? (
                      <span className="text-white">
                        {bestSellingBrands[0].name} (
                        {numberFormatter.format(bestSellingBrands[0]._count.products)} محصول)
                      </span>
                    ) : (
                      <span className="text-white">—</span>
                    )}
                  </li>
                  <li>
                    مجموع نظرات محصولات:{" "}
                    <span className="text-white">{numberFormatter.format(totalReviews)}</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">لیست برندها</h2>
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm text-white/70">
                  <thead className="bg-black/40 text-xs uppercase text-white/50">
                    <tr>
                      <th className="px-4 py-3 text-right">نام</th>
                      <th className="px-4 py-3 text-right">اسلاگ</th>
                      <th className="px-4 py-3 text-right">محصولات</th>
                      <th className="px-4 py-3 text-right">تاریخ ایجاد</th>
                      <th className="px-4 py-3 text-right">وب‌سایت</th>
                      <th className="px-4 py-3 text-right">اقدامات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-black/20">
                    {brands.map((brand) => {
                      const canDelete = brand._count.products === 0;
                      return (
                        <tr key={brand.id}>
                          <td className="px-4 py-3 text-white">{brand.name}</td>
                          <td className="px-4 py-3 text-xs text-white/60">{brand.slug}</td>
                          <td className="px-4 py-3">
                            {numberFormatter.format(brand._count.products)}
                          </td>
                          <td className="px-4 py-3 text-xs text-white/50">
                            {dateFormatter.format(brand.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {brand.website ? (
                              <a
                                href={brand.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-200 hover:text-purple-100"
                              >
                                مشاهده
                              </a>
                            ) : (
                              <span className="text-white/40">—</span>
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
                                    : "cursor-not-allowed border-white/10 text-white/30",
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
                        <td colSpan={6} className="px-4 py-6 text-center text-xs text-white/50">
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
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold text-white">افزودن دسته‌بندی</h2>
                <p className="mt-2 text-xs text-white/60">
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
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <input
                    name="slug"
                    placeholder="اسلاگ (مثال: full-synthetic)"
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <input
                    name="imageUrl"
                    placeholder="آدرس تصویر شاخص (اختیاری)"
                    className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <textarea
                    name="description"
                    placeholder="توضیح کوتاه"
                    className="h-24 w-full rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
                  >
                    ذخیره دسته‌بندی
                  </button>
                </form>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <h3 className="text-sm font-semibold text-white">گزارش دسته‌بندی‌ها</h3>
                <ul className="mt-4 space-y-3 text-xs text-white/60">
                  <li>
                    مجموع دسته‌بندی‌ها:{" "}
                    <span className="text-white">{numberFormatter.format(totalCategories)}</span>
                  </li>
                  <li>
                    میانگین محصول برای هر دسته:{" "}
                    <span className="text-white">
                      {decimalFormatter.format(categoryAverageProducts)}
                    </span>
                  </li>
                  <li>
                    پرترافیک‌ترین دسته:{" "}
                    {busiestCategories[0] ? (
                      <span className="text-white">
                        {busiestCategories[0].name} (
                        {numberFormatter.format(busiestCategories[0]._count.products)} محصول)
                      </span>
                    ) : (
                      <span className="text-white">—</span>
                    )}
                  </li>
                  <li>
                    محصولات کم‌موجودی:{" "}
                    <span className="text-white">{numberFormatter.format(lowStockCount)}</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">لیست دسته‌بندی‌ها</h2>
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm text-white/70">
                  <thead className="bg-black/40 text-xs uppercase text-white/50">
                    <tr>
                      <th className="px-4 py-3 text-right">نام</th>
                      <th className="px-4 py-3 text-right">اسلاگ</th>
                      <th className="px-4 py-3 text-right">محصولات</th>
                      <th className="px-4 py-3 text-right">تاریخ ایجاد</th>
                      <th className="px-4 py-3 text-right">اقدامات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-black/20">
                    {categories.map((category) => {
                      const canDelete = category._count.products === 0;
                      return (
                        <tr key={category.id}>
                          <td className="px-4 py-3 text-white">{category.name}</td>
                          <td className="px-4 py-3 text-xs text-white/60">{category.slug}</td>
                          <td className="px-4 py-3">
                            {numberFormatter.format(category._count.products)}
                          </td>
                          <td className="px-4 py-3 text-xs text-white/50">
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
                                    : "cursor-not-allowed border-white/10 text-white/30",
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
                        <td colSpan={5} className="px-4 py-6 text-center text-xs text-white/50">
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
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">مدیریت کاربران</h2>
              <p className="mt-2 text-xs text-white/60">
                نقش کاربران را کنترل کنید و تصویر دقیقی از رشد کاربران فعال داشته باشید.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/60">
                <span className="rounded-full border border-white/15 px-4 py-2">
                  {numberFormatter.format(users.length)} کاربر ثبت‌شده
                </span>
                <span className="rounded-full border border-white/15 px-4 py-2">
                  {numberFormatter.format(totalAdmins)} مدیر فعال
                </span>
                <span className="rounded-full border border-white/15 px-4 py-2">
                  {numberFormatter.format(totalCustomers)} مشتری فعال
                </span>
                <span className="rounded-full border border-white/15 px-4 py-2">
                  {numberFormatter.format(newCustomers30)} ثبت‌نام جدید (۳۰ روز اخیر)
                </span>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm text-white/70">
                <thead className="bg-black/40 text-xs uppercase text-white/50">
                  <tr>
                    <th className="px-4 py-3 text-right">نام</th>
                    <th className="px-4 py-3 text-right">ایمیل</th>
                    <th className="px-4 py-3 text-right">نقش</th>
                    <th className="px-4 py-3 text-right">سفارش‌ها</th>
                    <th className="px-4 py-3 text-right">تاریخ عضویت</th>
                    <th className="px-4 py-3 text-right">اقدامات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-black/20">
                  {users.map((user) => {
                    const isSelf = sessionUserId === user.id;
                    return (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-white">
                          <div className="flex items-center gap-2">
                            <span>{user.name ?? "بدون نام"}</span>
                            {isSelf ? (
                              <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] text-white/60">
                                شما
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/60">{user.email}</td>
                        <td className="px-4 py-3 text-xs text-white/60">
                          {roleLabels[user.role]}
                        </td>
                        <td className="px-4 py-3">
                          {numberFormatter.format(user._count.orders)}
                        </td>
                        <td className="px-4 py-3 text-xs text-white/50">
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
                                "rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/80",
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
                                  ? "cursor-not-allowed border-white/10 text-white/30"
                                  : "border-purple-400/40 text-purple-100 hover:border-purple-300 hover:text-white",
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
                      <td colSpan={6} className="px-4 py-6 text-center text-xs text-white/50">
                        هنوز کاربری ثبت نشده است.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
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
        <h1 className="text-3xl font-semibold text-white">پنل مدیریت ZenLube</h1>
        <p className="text-sm leading-7 text-white/70">
          تغییرات موجودی، برندها، دسته‌بندی‌ها و کاربران را در یک نگاه مدیریت کنید. تمام
          به‌روزرسانی‌ها بلافاصله در وب‌سایت اعمال می‌شود.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-white/60">
          <span className="rounded-full border border-white/15 px-4 py-2">
            {numberFormatter.format(totalProducts)} محصول فعال
          </span>
          <span className="rounded-full border border-white/15 px-4 py-2">
            {numberFormatter.format(totalBrands)} برند
          </span>
          <span className="rounded-full border border-white/15 px-4 py-2">
            {numberFormatter.format(totalCategories)} دسته‌بندی
          </span>
          <span className="rounded-full border border-white/15 px-4 py-2">
            {numberFormatter.format(totalCars)} خودرو ثبت‌شده
          </span>
          <span className="rounded-full border border-white/15 px-4 py-2">
            {numberFormatter.format(totalOrders)} سفارش
          </span>
          <span className="rounded-full border border-white/15 px-4 py-2">
            {formatPrice(totalRevenue)} درآمد ثبت‌شده
          </span>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-black/30 p-2">
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
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
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
