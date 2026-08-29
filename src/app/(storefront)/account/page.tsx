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
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
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
    <div className="container-zen py-5 sm:py-6 md:py-8">
      <StorefrontPageIntro
        compact
        description="سفارش‌ها، آدرس‌ها، خودروهای ذخیره‌شده و اطلاعات حساب را از یک مسیر مدیریت کنید."
        meta={dbUser?.phone ?? dbUser?.email ?? undefined}
        title={dbUser?.name ?? "حساب کاربری Oilbar"}
        tone="dark"
      />
      <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <nav className="-mx-4 flex overflow-x-auto border-y border-border bg-white px-4 text-xs font-bold text-text-muted scrollbar-none sm:mx-0 lg:grid lg:grid-cols-1 lg:overflow-visible lg:px-0">
            {[
              ["داشبورد", "#overview"],
              ["سفارش‌ها", "#orders"],
              ["آدرس‌ها", "#addresses"],
              ["خودروها", "#garage"],
              ["اطلاعات حساب", "#profile"],
              ["پشتیبانی", "/support"],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="flex min-h-11 shrink-0 items-center border-b-2 border-transparent px-4 py-2 text-center transition hover:border-primary-accent-strong hover:text-primary-accent-strong lg:px-2 lg:text-right">
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <section id="overview" className="scroll-mt-28 border-b border-border pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-text-strong">نمای کلی حساب</h2>
                <p className="mt-2 text-sm leading-7 text-text-muted">سفارش‌ها، آدرس پیش‌فرض، اطلاعات حساب و خودروهای مناسب روغن را از اینجا مدیریت کنید.</p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Link href="#orders" className="btn-ghost min-h-11 px-3 text-xs text-primary-accent-strong">مشاهده سفارش‌ها</Link>
                <Link href="#addresses" className="btn-ghost min-h-11 px-3 text-xs">افزودن آدرس</Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-5 md:mt-6 md:grid-cols-4 md:gap-x-6">
              <Metric label="کل سفارش‌ها" value={totalOrders} />
              <Metric label="در انتظار پرداخت" value={pendingOrders} tone="amber" />
              <Metric label="سفارش موفق" value={paidOrders} tone="blue" />
              <Metric label="تحویل‌شده" value={deliveredOrders} tone="green" />
            </div>
          </section>

          {selectedOrder ? <OrderDetail order={selectedOrder} /> : null}

          <section id="orders" className="scroll-mt-28 border-b border-border py-6">
            <SectionHeader title="سفارش‌های من" subtitle="تاریخچه سفارش‌ها و وضعیت پرداخت و ارسال" />
            {orders.length ? (
              <>
              <div className="mt-5 divide-y divide-border border-y border-border">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account?orderId=${order.id}#order-detail`}
                    className={`block min-h-11 py-4 transition hover:bg-surface-secondary ${
                      selectedOrder?.id === order.id ? "border-r-2 border-primary-accent-strong bg-surface-tint px-3" : "bg-white"
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

          <section id="addresses" className="scroll-mt-28 border-b border-border py-6">
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

          <section className="border-b border-border py-6">
            <SectionHeader title="دفترچه آدرس‌ها" subtitle="چند آدرس مختلف ذخیره کنید و آدرس پیش‌فرض را هر زمان تغییر دهید." />
            <div className="mt-5">
              <AddressBookForm addresses={dbUser?.addresses ?? []} />
            </div>
          </section>

          <section id="garage" className="scroll-mt-28 grid gap-6 border-b border-border py-6 md:grid-cols-2">
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

          <section className="grid gap-6 border-b border-border py-6 md:grid-cols-2">
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
            <div className="border-y border-border py-5">
              <p className="text-sm font-black text-text-strong">سفارش مجدد سریع</p>
              <p className="mt-2 text-xs leading-6 text-text-muted">
                از بین محصولات علاقه‌مندی و اخیراً دیده‌شده می‌توانید سریع‌تر به خرید بعدی برگردید.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {wishlistItems.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/products/${item.product.slug}`} className="btn-ghost min-h-11 px-3 text-xs text-primary-accent-strong">
                    {item.product.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section id="profile" className="scroll-mt-28 py-6">
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
    <section id="order-detail" className="scroll-mt-28 border-b border-border py-6">
      <SectionHeader title={`جزئیات سفارش #${order.id.slice(0, 10).toUpperCase()}`} subtitle={new Date(order.createdAt).toLocaleString("fa-IR")} />
      <div className="mt-5 grid grid-cols-5 divide-x divide-border border-y border-border">
        {timeline.map((step, index) => (
          <div key={`${step.label}-${index}`} className={`flex min-h-11 items-center justify-center px-1 py-3 text-center text-[9px] font-bold min-[390px]:text-[10px] sm:text-[11px] ${index <= activeIndex ? "bg-green-50 text-[#16A34A]" : "text-text-muted"}`}>
            {step.label}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="divide-y divide-border border-y border-border">
          {order.items.map((item) => (
            <Link key={item.id} href={`/products/${item.product.slug}`} className="flex min-h-11 flex-col gap-2 py-3 text-sm transition hover:text-primary-accent-strong sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold text-text-strong">{item.product.name}</span>
              <span className="text-text-muted">{item.quantity.toLocaleString("fa-IR")} × {formatPrice(Number(item.price))}</span>
            </Link>
          ))}
        </div>
        <div className="space-y-3 border-y border-border py-4 text-xs">
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
          <div className="flex flex-wrap gap-1 pt-2">
            <Link href="/support" className="btn-ghost min-h-11 px-3 text-xs">درخواست پشتیبانی</Link>
          <form action={reorderOrderAction} className="inline-flex">
            <input type="hidden" name="orderId" value={order.id} />
            <button type="submit" className="btn-ghost min-h-11 px-3 text-xs text-primary-accent-strong">خرید مجدد همین سفارش</button>
          </form>
          </div>
        </div>
      </div>

      {order.statusEvents?.length ? (
        <div className="mt-6 border-t border-[#E5E7EB] pt-5">
          <p className="text-sm font-black text-[#111827]">تایم‌لاین سفارش</p>
          <div className="mt-4 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
            {order.statusEvents.map((event) => (
              <div key={event.id} className="py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <p className="text-sm font-bold text-[#111827]">{event.title}</p>
                  <span className="text-[11px] text-[#98A2B3]">{new Date(event.createdAt).toLocaleString("fa-IR")}</span>
                </div>
                {event.detail ? <p className="mt-2 text-xs leading-6 text-[#667085]">{event.detail}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 border-t border-border pt-6 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-text-strong">سابقه مرجوعی سفارش</p>
              <p className="mt-1 text-xs leading-6 text-text-muted">تمام درخواست‌های ثبت‌شده برای این سفارش و وضعیت بررسی تیم پشتیبانی.</p>
            </div>
          </div>
          {order.returnRequests?.length ? (
            <div className="mt-4 divide-y divide-border border-y border-border">
              {order.returnRequests.map((request) => (
                <div key={request.id} className="py-4 text-xs">
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

        <div className="border-t border-border pt-5 xl:border-r xl:border-t-0 xl:pr-5 xl:pt-0">
          <p className="text-sm font-black text-text-strong">ثبت درخواست مرجوعی</p>
          <p className="mt-2 text-xs leading-6 text-text-muted">
            اگر کالا مشکل دارد یا با سفارش مطابقت ندارد، درخواست را ثبت کنید تا تیم پشتیبانی آن را بررسی کند.
          </p>
          {canRequestReturn ? (
            <ReturnRequestForm orderId={order.id} />
          ) : (
            <p className="mt-4 border-r-2 border-border px-3 py-2 text-xs leading-6 text-text-muted">
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
    <div className="metric-zen">
      <p className="text-xs font-bold text-text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-black sm:text-3xl ${toneClass}`}>{value.toLocaleString("fa-IR")}</p>
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
    <div className="flex justify-between gap-3 border-b border-border/70 pb-2 last:border-b-0">
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
    <div className="border-y border-border py-5">
      <p className="text-sm font-black text-text-strong">{title}</p>
      {items.length ? (
        <div className="mt-4 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="flex min-h-11 flex-col gap-3 py-3 text-sm transition hover:text-primary-accent-strong sm:flex-row sm:items-center sm:justify-between"
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
