import Link from "next/link";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getAppSession } from "@/lib/session";
import { ProfileForm } from "@/components/account/profile-form";
import { AddressForm } from "@/components/account/address-form";
import { LocalFavorites } from "@/components/account/local-favorites";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusLabels: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
};

const timeline = [
  { key: "PENDING", label: "ثبت سفارش" },
  { key: "PAID", label: "پرداخت" },
  { key: "PAID", label: "پردازش" },
  { key: "SHIPPED", label: "ارسال‌شده" },
  { key: "DELIVERED", label: "تحویل‌شده" },
];

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const selectedOrderId = typeof params?.orderId === "string" ? params.orderId : null;
  const rawSession = await getAppSession();
  const user = (rawSession as { user?: { id?: string; name?: string | null; email?: string | null } } | null)?.user;

  if (!user?.id) redirect("/sign-in?callbackUrl=/account");

  const [dbUser, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: { addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] } },
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { name: true, slug: true } } } } },
    }),
  ]);

  const defaultAddress = dbUser?.addresses?.find((address) => address.isDefault) ?? dbUser?.addresses?.[0] ?? null;
  const selectedOrder = selectedOrderId ? orders.find((order) => order.id === selectedOrderId) ?? null : orders[0] ?? null;
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;
  const paidOrders = orders.filter((order) => ["PAID", "SHIPPED", "DELIVERED"].includes(order.status)).length;

  return (
    <div className="container-zen py-6 md:py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <section className="rounded-3xl border border-[#E5E7EB] bg-[#111827] p-5 text-white">
            <p className="text-xs font-bold text-[#F5C56B]">حساب کاربری Oilbar</p>
            <h1 className="mt-2 text-xl font-black">{dbUser?.name ?? "کاربر اویل‌بار"}</h1>
            <p className="mt-2 text-xs text-slate-300">{dbUser?.phone ?? dbUser?.email}</p>
          </section>
          <nav className="grid grid-cols-2 gap-2 rounded-3xl border border-[#E5E7EB] bg-white p-3 text-xs font-bold text-[#6B7280] lg:grid-cols-1">
            {[
              ["داشبورد", "#overview"],
              ["سفارش‌ها", "#orders"],
              ["آدرس‌ها", "#addresses"],
              ["خودروها", "#garage"],
              ["اطلاعات حساب", "#profile"],
              ["پشتیبانی", "/support"],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="rounded-2xl px-3 py-3 transition hover:bg-[#FFF8E8] hover:text-[#D97706]">
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <section id="overview" className="rounded-3xl border border-[#E5E7EB] bg-white p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-[#D97706]">خوش آمدید</p>
                <h2 className="mt-2 text-2xl font-black text-[#111827]">داشبورد خرید شما</h2>
                <p className="mt-2 text-sm leading-7 text-[#6B7280]">سفارش‌ها، آدرس پیش‌فرض، اطلاعات حساب و خودروهای مناسب روغن را از اینجا مدیریت کنید.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="#orders" className="btn-primary">مشاهده سفارش‌ها</Link>
                <Link href="#addresses" className="btn-outline">افزودن آدرس</Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <Metric label="کل سفارش‌ها" value={orders.length} />
              <Metric label="در انتظار پرداخت" value={pendingOrders} tone="amber" />
              <Metric label="سفارش موفق" value={paidOrders} tone="blue" />
              <Metric label="تحویل‌شده" value={deliveredOrders} tone="green" />
            </div>
          </section>

          {selectedOrder ? <OrderDetail order={selectedOrder} /> : null}

          <section id="orders" className="rounded-3xl border border-[#E5E7EB] bg-white p-5 md:p-6">
            <SectionHeader title="سفارش‌های من" subtitle="تاریخچه سفارش‌ها و وضعیت پرداخت و ارسال" />
            {orders.length ? (
              <div className="mt-5 grid gap-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account?orderId=${order.id}#order-detail`}
                    className={`rounded-2xl border p-4 transition hover:border-[#F5C56B] ${
                      selectedOrder?.id === order.id ? "border-[#F5C56B] bg-[#FFF8E8]" : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                      <div>
                        <p className="font-mono text-sm font-black text-[#111827]">#{order.id.slice(0, 10).toUpperCase()}</p>
                        <p className="mt-1 text-xs text-[#6B7280]">{new Date(order.createdAt).toLocaleString("fa-IR")}</p>
                      </div>
                      <Badge status={order.status} />
                      <p className="text-sm font-black text-[#111827]">{formatPrice(order.total)}</p>
                      <span className="text-xs font-bold text-[#D97706]">مشاهده جزئیات</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="هنوز سفارشی ثبت نکرده‌اید" actionHref="/products" actionLabel="شروع خرید" />
            )}
          </section>

          <section id="addresses" className="rounded-3xl border border-[#E5E7EB] bg-white p-5 md:p-6">
            <SectionHeader title="آدرس پیش‌فرض" subtitle="این آدرس در checkout به صورت خودکار پیشنهاد می‌شود." />
            <div className="mt-5">
              <AddressForm
                fullName={defaultAddress?.fullName ?? dbUser?.name}
                phone={defaultAddress?.phone ?? dbUser?.phone}
                address1={defaultAddress?.address1}
                address2={defaultAddress?.address2}
                city={defaultAddress?.city}
                province={defaultAddress?.province}
                postalCode={defaultAddress?.postalCode}
              />
            </div>
          </section>

          <section id="garage" className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5">
              <p className="text-sm font-black text-[#111827]">گاراژ خودرو</p>
              <p className="mt-2 text-xs leading-6 text-[#6B7280]">
                ذخیره خودرو در دیتامدل فعلی وجود ندارد، اما می‌توانید از دفترچه خودروها، روغن و فیلتر مناسب را پیدا کنید.
              </p>
              <Link href="/cars" className="btn-outline mt-5 inline-flex">افزودن خودرو / مشاهده دفترچه</Link>
            </div>
            <LocalFavorites />
          </section>

          <section id="profile" className="rounded-3xl border border-[#E5E7EB] bg-white p-5 md:p-6">
            <SectionHeader title="اطلاعات حساب" subtitle="اطلاعات تماس و هویت حساب کاربری" />
            <div className="mt-5">
              <ProfileForm name={dbUser?.name} email={dbUser?.email} phone={dbUser?.phone} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: Awaited<ReturnType<typeof prisma.order.findMany>>[number] & { items: Array<{ id: string; quantity: number; price: unknown; product: { name: string; slug: string } }> } }) {
  const shippingCost = Number(order.shippingCost ?? 0);
  const itemsTotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const activeIndex = order.status === "CANCELLED" ? 0 : Math.max(0, timeline.findLastIndex((item) => item.key === order.status));

  return (
    <section id="order-detail" className="rounded-3xl border border-[#E5E7EB] bg-white p-5 md:p-6">
      <SectionHeader title={`جزئیات سفارش #${order.id.slice(0, 10).toUpperCase()}`} subtitle={new Date(order.createdAt).toLocaleString("fa-IR")} />
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {timeline.map((step, index) => (
          <div key={`${step.label}-${index}`} className={`rounded-2xl border px-3 py-3 text-center text-[11px] font-bold ${index <= activeIndex ? "border-green-200 bg-green-50 text-[#16A34A]" : "border-[#E5E7EB] bg-[#F7F7F8] text-[#6B7280]"}`}>
            {step.label}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {order.items.map((item) => (
            <Link key={item.id} href={`/products/${item.product.slug}`} className="flex justify-between rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm">
              <span className="font-bold text-[#111827]">{item.product.name}</span>
              <span className="text-[#6B7280]">{item.quantity.toLocaleString("fa-IR")} × {formatPrice(Number(item.price))}</span>
            </Link>
          ))}
        </div>
        <div className="space-y-3 rounded-3xl border border-[#E5E7EB] bg-[#F7F7F8] p-4 text-xs">
          <Summary label="جمع کالاها" value={formatPrice(itemsTotal)} />
          <Summary label="هزینه ارسال" value={formatPrice(shippingCost)} />
          <Summary label="مبلغ نهایی" value={formatPrice(order.total)} strong />
          <Summary label="وضعیت" value={statusLabels[order.status] ?? order.status} />
          <Summary label="کد پیگیری ارسال" value={order.shippingTrackingCode ?? "ثبت نشده"} />
          <Summary label="کد پرداخت" value={order.paymentRefId ?? "ثبت نشده"} />
          <div className="border-t border-[#E5E7EB] pt-3 leading-6 text-[#6B7280]">
            <p className="font-bold text-[#111827]">آدرس گیرنده</p>
            <p>{order.fullName}، {order.phone}</p>
            <p>{order.province}، {order.city}، {order.address1}</p>
          </div>
          <Link href="/support" className="btn-outline mt-3 w-full justify-center">درخواست پشتیبانی</Link>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "amber" | "blue" | "green" }) {
  const toneClass = tone === "amber" ? "text-amber-600" : tone === "blue" ? "text-blue-600" : tone === "green" ? "text-green-600" : "text-[#111827]";
  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
      <p className="text-xs font-bold text-[#6B7280]">{label}</p>
      <p className={`mt-2 text-3xl font-black ${toneClass}`}>{value.toLocaleString("fa-IR")}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-xl font-black text-[#111827]">{title}</h2>
      <p className="mt-1 text-sm leading-7 text-[#6B7280]">{subtitle}</p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const style = status === "CANCELLED" ? "bg-red-50 text-[#DC2626]" : status === "DELIVERED" ? "bg-green-50 text-[#16A34A]" : "bg-[#FFF8E8] text-[#D97706]";
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${style}`}>{statusLabels[status] ?? status}</span>;
}

function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#6B7280]">{label}</span>
      <span className={strong ? "font-black text-[#111827]" : "font-bold text-[#374151]"}>{value}</span>
    </div>
  );
}

function EmptyState({ title, actionHref, actionLabel }: { title: string; actionHref: string; actionLabel: string }) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-[#E5E7EB] bg-[#F7F7F8] p-10 text-center">
      <p className="text-sm font-bold text-[#6B7280]">{title}</p>
      <Link href={actionHref} className="btn-primary mt-5 inline-flex">{actionLabel}</Link>
    </div>
  );
}
