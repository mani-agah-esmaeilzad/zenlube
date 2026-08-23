import Link from "next/link";
import { redirect } from "next/navigation";

import { reorderOrderAction } from "@/actions/account";
import { AddressBookForm } from "@/components/account/address-book-form";
import prisma from "@/lib/prisma";
import { AddressForm } from "@/components/account/address-form";
import { LocalGarage } from "@/components/account/local-garage";
import { ProfileForm } from "@/components/account/profile-form";
import { ReturnRequestForm } from "@/components/account/return-request-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { PriceBlock } from "@/components/ui/price-block";
import { StatusPill } from "@/components/ui/status-pill";
import { getCarHierarchy } from "@/lib/data/cars";
import { createPageInfo, getPaginationParams } from "@/lib/pagination";
import { getAppSession } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

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

const returnStatusLabels: Record<string, string> = {
  REQUESTED: "ثبت شده",
  APPROVED: "تایید شده",
  REJECTED: "رد شده",
  RECEIVED: "کالا دریافت شد",
  REFUNDED: "استرداد انجام شد",
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
  const { page, pageSize, skip } = getPaginationParams(params, { defaultPageSize: 8, maxPageSize: 30 });
  const rawSession = await getAppSession();
  const user = (rawSession as { user?: { id?: string; name?: string | null; email?: string | null } } | null)?.user;

  if (!user?.id) redirect("/sign-in?callbackUrl=/account");

  const [dbUser, orders, totalOrders, pendingOrders, deliveredOrders, paidOrders, selectedOrderFromQuery, wishlistItems, recentlyViewedProducts, carHierarchy] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: { addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] } },
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { name: true, slug: true } } } },
        statusEvents: { orderBy: { createdAt: "asc" } },
        returnRequests: { orderBy: { requestedAt: "desc" } },
      },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id, status: "PENDING" } }),
    prisma.order.count({ where: { userId: user.id, status: "DELIVERED" } }),
    prisma.order.count({ where: { userId: user.id, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
    selectedOrderId
      ? prisma.order.findFirst({
          where: { id: selectedOrderId, userId: user.id },
          include: {
            items: { include: { product: { select: { name: true, slug: true } } } },
            statusEvents: { orderBy: { createdAt: "asc" } },
            returnRequests: { orderBy: { requestedAt: "desc" } },
          },
        })
      : null,
    prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            imageUrl: true,
            price: true,
            brand: { select: { name: true } },
          },
        },
      },
    }),
    prisma.recentlyViewedProduct.findMany({
      where: { userId: user.id },
      orderBy: { viewedAt: "desc" },
      take: 6,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            imageUrl: true,
            price: true,
            brand: { select: { name: true } },
          },
        },
      },
    }),
    getCarHierarchy(),
  ]);

  const defaultAddress = dbUser?.addresses?.find((address) => address.isDefault) ?? dbUser?.addresses?.[0] ?? null;
  const selectedOrder = selectedOrderFromQuery ?? orders[0] ?? null;
  const ordersPageInfo = createPageInfo(page, pageSize, totalOrders);
  const garageCars = carHierarchy.flatMap((brandGroup) =>
    brandGroup.models.flatMap((modelGroup) =>
      modelGroup.options.map((option) => ({
        brand: brandGroup.brand,
        model: modelGroup.model,
        slug: option.slug,
        variant: option.label,
      })),
    ),
  );

  return (
    <div className="container-zen py-6 md:py-8">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <section className="rounded-2xl bg-primary p-5 text-white">
            <p className="text-xs font-bold text-[#F5C56B]">حساب کاربری Oilbar</p>
            <h1 className="mt-2 text-xl font-black">{dbUser?.name ?? "کاربر اویل‌بار"}</h1>
            <p className="mt-2 text-xs text-slate-300">{dbUser?.phone ?? dbUser?.email}</p>
          </section>
          <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-white p-3 text-xs font-bold text-text-muted lg:grid-cols-1">
            {[
              ["داشبورد", "#overview"],
              ["سفارش‌ها", "#orders"],
              ["آدرس‌ها", "#addresses"],
              ["خودروها", "#garage"],
              ["اطلاعات حساب", "#profile"],
              ["پشتیبانی", "/support"],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="rounded-2xl px-3 py-3 text-center transition hover:bg-surface-tint hover:text-primary-accent-strong">
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <section id="overview" className="rounded-2xl border border-border bg-white p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-primary-accent-strong">خوش آمدید</p>
                <h2 className="mt-2 text-2xl font-black text-text-strong">داشبورد خرید شما</h2>
                <p className="mt-2 text-sm leading-7 text-text-muted">سفارش‌ها، آدرس پیش‌فرض، اطلاعات حساب و خودروهای مناسب روغن را از اینجا مدیریت کنید.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link href="#orders" className="btn-primary w-full sm:w-auto">مشاهده سفارش‌ها</Link>
                <Link href="#addresses" className="btn-outline w-full sm:w-auto">افزودن آدرس</Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Metric label="کل سفارش‌ها" value={totalOrders} />
              <Metric label="در انتظار پرداخت" value={pendingOrders} tone="amber" />
              <Metric label="سفارش موفق" value={paidOrders} tone="blue" />
              <Metric label="تحویل‌شده" value={deliveredOrders} tone="green" />
            </div>
          </section>

          {selectedOrder ? <OrderDetail order={selectedOrder} /> : null}

          <section id="orders" className="rounded-2xl border border-border bg-white p-5 md:p-6">
            <SectionHeader title="سفارش‌های من" subtitle="تاریخچه سفارش‌ها و وضعیت پرداخت و ارسال" />
            {orders.length ? (
              <>
              <div className="mt-5 grid gap-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account?orderId=${order.id}#order-detail`}
                    className={`rounded-2xl border p-4 transition hover:border-[#F5C56B] ${
                      selectedOrder?.id === order.id ? "border-[rgba(245,158,11,0.26)] bg-surface-tint" : "border-border bg-white"
                    }`}
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                      <div>
                        <p className="font-mono text-sm font-black text-text-strong">#{order.id.slice(0, 10).toUpperCase()}</p>
                        <p className="mt-1 text-xs text-text-muted">{new Date(order.createdAt).toLocaleString("fa-IR")}</p>
                      </div>
                      <Badge status={order.status} />
                      <p className="text-sm font-black text-text-strong">{formatPrice(order.total)}</p>
                      <span className="text-xs font-bold text-primary-accent-strong">مشاهده جزئیات</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Pagination pathname="/account" searchParams={params} pageInfo={ordersPageInfo} />
              </>
            ) : (
              <EmptyState title="هنوز سفارشی ثبت نکرده‌اید" actionHref="/products" actionLabel="شروع خرید" />
            )}
          </section>

          <section id="addresses" className="rounded-2xl border border-border bg-white p-5 md:p-6">
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

          <section className="rounded-2xl border border-border bg-white p-5 md:p-6">
            <SectionHeader title="دفترچه آدرس‌ها" subtitle="چند آدرس مختلف ذخیره کنید و آدرس پیش‌فرض را هر زمان تغییر دهید." />
            <div className="mt-5">
              <AddressBookForm addresses={dbUser?.addresses ?? []} />
            </div>
          </section>

          <section id="garage" className="grid gap-4 md:grid-cols-2">
            <LocalGarage cars={garageCars} />
            <ProductShelf
              title="علاقه‌مندی‌ها"
              emptyMessage="هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید."
              items={wishlistItems.map((item) => ({
                id: item.product.id,
                slug: item.product.slug,
                name: item.product.name,
                brandName: item.product.brand.name,
                price: Number(item.product.price),
              }))}
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <ProductShelf
              title="اخیراً دیده‌شده"
              emptyMessage="هنوز محصولی را مشاهده نکرده‌اید."
              items={recentlyViewedProducts.map((item) => ({
                id: item.product.id,
                slug: item.product.slug,
                name: item.product.name,
                brandName: item.product.brand.name,
                price: Number(item.product.price),
              }))}
            />
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-sm font-black text-text-strong">سفارش مجدد سریع</p>
              <p className="mt-2 text-xs leading-6 text-text-muted">
                از بین محصولات علاقه‌مندی و اخیراً دیده‌شده می‌توانید سریع‌تر به خرید بعدی برگردید.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {wishlistItems.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/products/${item.product.slug}`} className="chip-zen px-3 py-2 text-xs font-bold">
                    {item.product.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section id="profile" className="rounded-2xl border border-border bg-white p-5 md:p-6">
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

type AccountOrder = Awaited<ReturnType<typeof prisma.order.findMany>>[number] & {
  items: Array<{ id: string; quantity: number; price: unknown; product: { name: string; slug: string } }>;
  statusEvents?: Array<{ id: string; status: string; title: string; detail: string | null; createdAt: Date }>;
  returnRequests?: Array<{
    id: string;
    status: string;
    reason: string;
    details: string | null;
    refundAmount: unknown;
    adminNotes: string | null;
    requestedAt: Date;
    reviewedAt: Date | null;
    refundedAt: Date | null;
  }>;
};

function OrderDetail({ order }: { order: AccountOrder }) {
  const shippingCost = Number(order.shippingCost ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);
  const itemsTotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const activeIndex = order.status === "CANCELLED" ? 0 : Math.max(0, timeline.findLastIndex((item) => item.key === order.status));
  const canRequestReturn = ["PAID", "SHIPPED", "DELIVERED"].includes(order.status);

  return (
    <section id="order-detail" className="rounded-2xl border border-border bg-white p-5 md:p-6">
      <SectionHeader title={`جزئیات سفارش #${order.id.slice(0, 10).toUpperCase()}`} subtitle={new Date(order.createdAt).toLocaleString("fa-IR")} />
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {timeline.map((step, index) => (
          <div key={`${step.label}-${index}`} className={`rounded-2xl border px-3 py-3 text-center text-[11px] font-bold ${index <= activeIndex ? "border-green-200 bg-green-50 text-[#16A34A]" : "border-border bg-[linear-gradient(180deg,#FFFFFF_0%,#F7F8FA_100%)] text-text-muted"}`}>
            {step.label}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {order.items.map((item) => (
            <Link key={item.id} href={`/products/${item.product.slug}`} className="flex flex-col gap-2 rounded-2xl border border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold text-text-strong">{item.product.name}</span>
              <span className="text-text-muted">{item.quantity.toLocaleString("fa-IR")} × {formatPrice(Number(item.price))}</span>
            </Link>
          ))}
        </div>
        <div className="panel-zen-muted space-y-3 rounded-3xl p-4 text-xs">
          <Summary label="جمع کالاها" value={formatPrice(itemsTotal)} />
          <Summary label="هزینه ارسال" value={formatPrice(shippingCost)} />
          {discountAmount > 0 ? <Summary label="تخفیف" value={formatPrice(discountAmount)} /> : null}
          <Summary label="مبلغ نهایی" value={formatPrice(order.total)} strong />
          <Summary label="وضعیت" value={statusLabels[order.status] ?? order.status} />
          <Summary label="کد پیگیری ارسال" value={order.shippingTrackingCode ?? "ثبت نشده"} />
          <Summary label="کد پرداخت" value={order.paymentRefId ?? "ثبت نشده"} />
          <Summary label="تحویل تقریبی" value={order.estimatedDeliveryLabel ?? "ثبت نشده"} />
          {order.couponCode ? <Summary label="کد تخفیف" value={order.couponCode} /> : null}
          <div className="border-t border-border pt-3 leading-6 text-text-muted">
            <p className="font-bold text-text-strong">آدرس گیرنده</p>
            <p>{order.fullName}، {order.phone}</p>
            <p>{order.province}، {order.city}، {order.address1}</p>
          </div>
          <Link href="/support" className="btn-outline mt-3 w-full justify-center">درخواست پشتیبانی</Link>
          <form action={reorderOrderAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <button type="submit" className="btn-primary mt-3 w-full justify-center">خرید مجدد همین سفارش</button>
          </form>
        </div>
      </div>

      {order.statusEvents?.length ? (
        <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
          <p className="text-sm font-black text-[#111827]">تایم‌لاین سفارش</p>
          <div className="mt-4 space-y-3">
            {order.statusEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#111827]">{event.title}</p>
                  <span className="text-[11px] text-[#98A2B3]">{new Date(event.createdAt).toLocaleString("fa-IR")}</span>
                </div>
                {event.detail ? <p className="mt-2 text-xs leading-6 text-[#667085]">{event.detail}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="panel-zen rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-text-strong">سابقه مرجوعی سفارش</p>
              <p className="mt-1 text-xs leading-6 text-text-muted">تمام درخواست‌های ثبت‌شده برای این سفارش و وضعیت بررسی تیم پشتیبانی.</p>
            </div>
          </div>
          {order.returnRequests?.length ? (
            <div className="mt-4 space-y-3">
              {order.returnRequests.map((request) => (
                <div key={request.id} className="panel-zen-muted rounded-2xl p-4 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-text-strong">{returnStatusLabels[request.status] ?? request.status}</p>
                    <span className="text-text-soft">{new Date(request.requestedAt).toLocaleString("fa-IR")}</span>
                  </div>
                  <p className="mt-2 leading-6 text-[#374151]">{request.reason}</p>
                  {request.details ? <p className="mt-2 leading-6 text-text-muted">{request.details}</p> : null}
                  {request.adminNotes ? <p className="mt-2 leading-6 text-primary-accent-strong">یادداشت پشتیبانی: {request.adminNotes}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-text-muted">
                    {request.reviewedAt ? <span>بررسی: {new Date(request.reviewedAt).toLocaleString("fa-IR")}</span> : null}
                    {request.refundedAt ? <span>استرداد: {new Date(request.refundedAt).toLocaleString("fa-IR")}</span> : null}
                    {request.refundAmount != null ? <span>مبلغ استرداد: {formatPrice(Number(request.refundAmount))}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-xs leading-6 text-text-muted">برای این سفارش هنوز درخواست مرجوعی ثبت نشده است.</p>
          )}
        </div>

        <div className="panel-zen rounded-3xl p-5">
          <p className="text-sm font-black text-text-strong">ثبت درخواست مرجوعی</p>
          <p className="mt-2 text-xs leading-6 text-text-muted">
            اگر کالا مشکل دارد یا با سفارش مطابقت ندارد، درخواست را ثبت کنید تا تیم پشتیبانی آن را بررسی کند.
          </p>
          {canRequestReturn ? (
            <ReturnRequestForm orderId={order.id} />
          ) : (
            <p className="mt-4 rounded-2xl bg-[linear-gradient(180deg,#FFFFFF_0%,#F7F8FA_100%)] px-4 py-3 text-xs leading-6 text-text-muted">
              برای سفارش‌های پرداخت‌شده، ارسال‌شده یا تحویل‌شده می‌توانید درخواست مرجوعی ثبت کنید.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "amber" | "blue" | "green" }) {
  const toneClass = tone === "amber" ? "text-amber-600" : tone === "blue" ? "text-blue-600" : tone === "green" ? "text-green-600" : "text-[#111827]";
  return (
    <div className="metric-zen rounded-3xl">
      <p className="text-xs font-bold text-text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-black ${toneClass}`}>{value.toLocaleString("fa-IR")}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-xl font-black text-text-strong">{title}</h2>
      <p className="mt-1 text-sm leading-7 text-text-muted">{subtitle}</p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const tone =
    status === "CANCELLED" ? "danger" : status === "DELIVERED" ? "success" : status === "PENDING" ? "neutral" : "warning";

  return <StatusPill tone={tone}>{statusLabels[status] ?? status}</StatusPill>;
}

function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className={strong ? "font-black text-text-strong" : "font-bold text-[#374151]"}>{value}</span>
    </div>
  );
}

function ProductShelf({
  title,
  emptyMessage,
  items,
}: {
  title: string;
  emptyMessage: string;
  items: Array<{ id: string; slug: string; name: string; brandName: string; price: number }>;
}) {
  return (
    <div className="panel-zen rounded-3xl p-5">
      <p className="text-sm font-black text-text-strong">{title}</p>
      {items.length ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="flex flex-col gap-3 rounded-2xl border border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold text-text-strong">{item.name}</p>
                <p className="mt-1 text-xs text-text-muted">{item.brandName}</p>
              </div>
              <PriceBlock amount={item.price} label="قیمت" size="sm" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState compact description={emptyMessage} title={`لیست ${title} خالی است`} />
        </div>
      )}
    </div>
  );
}
