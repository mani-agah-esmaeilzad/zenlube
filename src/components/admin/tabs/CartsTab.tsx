"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { sendAbandonedCartRemindersAction } from "@/actions/admin/carts";
import { faDateTimeFormatter, faNumberFormatter } from "@/lib/formatters";
import { formatPrice } from "@/lib/utils";
import type { AdminCartSnapshot, CartActivityFilter, CartsTabData } from "@/services/admin/types";

const statusMeta: Record<AdminCartSnapshot["status"], { label: string; className: string; helper: string }> = {
  CHECKOUT_ACTIVE: {
    label: "در حال تکمیل خرید",
    className: "bg-[#ECFDF3] text-[#027A48]",
    helper: "کاربر در ۱۵ دقیقه اخیر در مرحله پرداخت بوده است.",
  },
  CHECKOUT_ABANDONED: {
    label: "پرداخت نیمه‌کاره",
    className: "bg-[#FFF1F3] text-[#C01048]",
    helper: "کاربر وارد پرداخت شده اما بیش از ۱۵ دقیقه است ادامه نداده.",
  },
  CART_ACTIVE: {
    label: "سبد فعال",
    className: "bg-[#EFF8FF] text-[#175CD3]",
    helper: "سبد در ۳۰ دقیقه اخیر مشاهده یا ویرایش شده است.",
  },
  CART_ABANDONED: {
    label: "سبد رهاشده",
    className: "bg-[#FFF7E8] text-[#B54708]",
    helper: "بیش از ۳۰ دقیقه از آخرین فعالیت سبد گذشته است.",
  },
};

const filterOptions: Array<{ key: CartActivityFilter; label: string }> = [
  { key: "all", label: "همه سبدها" },
  { key: "checkout_active", label: "در حال پرداخت" },
  { key: "checkout_abandoned", label: "پرداخت نیمه‌کاره" },
  { key: "cart_active", label: "سبد فعال" },
  { key: "cart_abandoned", label: "سبد رهاشده" },
];

const orderStatusLabels: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  PREPARING: "در حال آماده‌سازی",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغوشده",
};

export function CartsTab({ data }: { data: CartsTabData }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const eligibleCarts = data.carts.filter((cart) => cart.smsReminderEligible);
  const eligibleCartsForBulk = eligibleCarts.slice(0, 50);
  const allEligibleSelected = eligibleCartsForBulk.length > 0 && eligibleCartsForBulk.every((cart) => selectedIds.includes(cart.id));

  function toggleCart(cartId: string) {
    if (!selectedIds.includes(cartId) && selectedIds.length >= 50) {
      setNotice("در هر نوبت حداکثر ۵۰ سبد را می‌توان انتخاب کرد.");
      return;
    }
    setSelectedIds((current) => current.includes(cartId)
      ? current.filter((id) => id !== cartId)
      : [...current, cartId]);
    setNotice(null);
  }

  function toggleAllEligible() {
    setSelectedIds((current) => allEligibleSelected
      ? current.filter((id) => !eligibleCartsForBulk.some((cart) => cart.id === id))
      : [...new Set([...current, ...eligibleCartsForBulk.map((cart) => cart.id)])].slice(0, 20));
    setNotice(null);
  }

  function sendReminders() {
    if (selectedIds.length === 0 || isPending) return;
    if (!window.confirm(`برای ${selectedIds.length} سبد پیامک یادآوری ارسال شود؟`)) return;

    startTransition(async () => {
      const result = await sendAbandonedCartRemindersAction(selectedIds);
      setNotice(result.message);
      if (result.success) {
        setSelectedIds([]);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-5">
        <Metric label="کل سبدهای دارای کالا" value={data.metrics.total} helper="همه سبدهای ثبت‌شده" />
        <Metric label="در حال پرداخت" value={data.metrics.checkoutActive} helper="فعال در ۱۵ دقیقه اخیر" tone="green" />
        <Metric label="پرداخت نیمه‌کاره" value={data.metrics.checkoutAbandoned} helper="پرداخت ادامه پیدا نکرده" tone="red" />
        <Metric label="سبد فعال" value={data.metrics.cartActive} helper="فعال در ۳۰ دقیقه اخیر" tone="blue" />
        <Metric label="سبد رهاشده" value={data.metrics.cartAbandoned} helper="بدون فعالیت اخیر" tone="amber" />
      </section>

      <section className="admin-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#111827]">سبدهای خرید کاربران</h2>
            <p className="mt-1 max-w-3xl text-sm leading-7 text-[#667085]">
              محتویات سبد، ارزش فعلی و مرحله‌ای که مشتری در آن قرار دارد به‌صورت خودکار نمایش داده می‌شود.
            </p>
          </div>
          <p className="rounded-[18px] border border-[#E6EAF2] bg-[#FBFCFE] px-4 py-2 text-xs font-bold text-[#475467]">
            اطلاعات این صفحه هر ۲۰ ثانیه تازه می‌شود
          </p>
        </div>

        <CartFilters filters={data.filters} />
      </section>

      <section className="space-y-4">
        {eligibleCarts.length > 0 ? (
          <section className="admin-panel space-y-4 border border-[#F2D7A1] bg-[#FFFCF5] p-4 md:p-5" aria-label="یادآوری سبد خرید">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex items-center gap-3 text-sm font-black text-[#344054]">
                <input
                  type="checkbox"
                  checked={allEligibleSelected}
                  onChange={toggleAllEligible}
                  className="h-4 w-4 accent-[#B54708]"
                  aria-label="انتخاب همه سبدهای واجد شرایط در این صفحه"
                />
                انتخاب سبدهای واجد شرایط این صفحه
                <span className="text-xs font-semibold text-[#667085]">({faNumberFormatter.format(eligibleCarts.length)} مورد)</span>
              </label>
              <button
                type="button"
                onClick={sendReminders}
                disabled={selectedIds.length === 0 || selectedIds.length > 50 || isPending}
                className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "در حال ارسال…" : `ارسال یادآوری برای ${faNumberFormatter.format(selectedIds.length)} سبد`}
              </button>
            </div>
            <p className="text-xs leading-6 text-[#667085]">
              زمان انتظار شرط نیست؛ سبدهای فعال و رهاشده با شماره معتبر و کالای موجود انتخاب‌پذیرند. اگر مشتری بعد از فعالیت سبد سفارش داده باشد، پیامک نمی‌گیرد. در هر نوبت تا ۵۰ موردِ همین صفحه را می‌توان انتخاب کرد.
            </p>
            <div className="rounded-2xl border border-[#F2D7A1] bg-white/80 p-3 text-xs leading-6 text-[#475467]">
              <span className="font-black">پیش‌نمایش:</span> نام عزیز، سبد خریدت در اویل‌بار هنوز منتظرته. اگر هنوز قصد خرید داری، از اینجا ادامه بده: oilbar.ir/cart
            </div>
            {notice ? <p role="status" className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#344054]">{notice}</p> : null}
          </section>
        ) : null}

        {notice && eligibleCarts.length === 0 ? <p role="status" className="admin-panel p-4 text-sm font-bold text-[#344054]">{notice}</p> : null}

        {data.carts.length ? data.carts.map((cart) => (
          <CartCard
            key={cart.id}
            cart={cart}
            selected={selectedIds.includes(cart.id)}
            onToggle={() => toggleCart(cart.id)}
          />
        )) : (
          <div className="admin-panel p-10 text-center">
            <p className="text-base font-black text-[#111827]">سبدی مطابق این فیلتر پیدا نشد</p>
            <p className="mt-2 text-sm text-[#667085]">فیلتر را تغییر دهید یا عبارت جستجو را پاک کنید.</p>
          </div>
        )}
      </section>

      {data.pagination.totalPages > 1 ? (
        <nav className="flex items-center justify-between gap-3 text-xs text-[#667085]">
          {paginationLink(data.filters, data.pagination.page - 1, data.pagination.totalPages, "قبلی")}
          <span>
            صفحه {faNumberFormatter.format(data.pagination.page)} از {faNumberFormatter.format(data.pagination.totalPages)}
          </span>
          {paginationLink(data.filters, data.pagination.page + 1, data.pagination.totalPages, "بعدی")}
        </nav>
      ) : null}
    </div>
  );
}

function CartCard({ cart, selected, onToggle }: { cart: AdminCartSnapshot; selected: boolean; onToggle: () => void }) {
  const meta = statusMeta[cart.status];
  const lastActivity = formatRelativeTime(cart.lastActivityAt);

  return (
    <article className="admin-panel overflow-hidden">
      <div className="flex flex-col gap-5 p-5 md:p-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {cart.smsReminderEligible ? (
              <label className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#E6EAF2] bg-white px-3 text-[11px] font-bold text-[#344054]">
                <input type="checkbox" checked={selected} onChange={onToggle} className="h-4 w-4 accent-[#B54708]" />
                انتخاب برای پیامک
              </label>
            ) : null}
            <span className={`rounded-full px-3 py-1 text-[11px] font-black ${meta.className}`}>{meta.label}</span>
            <span className="rounded-full bg-[#F2F4F7] px-3 py-1 text-[11px] font-bold text-[#475467]">
              {faNumberFormatter.format(cart.quantity)} کالا در {faNumberFormatter.format(cart.itemCount)} ردیف
            </span>
            <span className="text-[11px] font-bold text-[#98A2B3]">آخرین فعالیت: {lastActivity}</span>
          </div>

          <div className="mt-5 grid gap-4 border-b border-[#E6EAF2] pb-5 md:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-xs font-bold text-[#98A2B3]">مشتری</p>
              <p className="mt-1 text-base font-black text-[#111827]">{cart.user.name?.trim() || "کاربر بدون نام"}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#667085]">
                <span dir="ltr">{cart.user.phone || "شماره ثبت نشده"}</span>
                <span className="break-all">{cart.user.email}</span>
              </div>
            </div>
            <div className="md:text-left">
              <p className="text-xs font-bold text-[#98A2B3]">ارزش فعلی سبد</p>
              <p className="mt-1 text-xl font-black text-[#111827]">{formatPrice(cart.total)}</p>
              <p className="mt-2 text-[11px] leading-5 text-[#667085]">{meta.helper}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {cart.items.map((item) => {
              const localImage = item.imageUrl?.startsWith("/") && !item.imageUrl.startsWith("//") ? item.imageUrl : null;
              return (
                <div key={item.id} className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 rounded-[18px] bg-[#F8FAFC] p-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-[#E6EAF2]">
                    {localImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-contain p-1.5" src={localImage} />
                    ) : (
                      <BoxIcon className="h-6 w-6 text-[#98A2B3]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link className="text-sm font-black leading-6 text-[#111827] hover:text-[#B54708]" href={`/products/${item.slug}`}>
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-[#667085]">
                      {item.brandName} · تعداد {faNumberFormatter.format(item.quantity)} · موجودی {faNumberFormatter.format(item.stock)}
                    </p>
                  </div>
                  <div className="col-start-2 text-xs font-black text-[#344054] sm:col-start-auto sm:text-left">
                    {formatPrice(item.lineTotal)}
                    <p className="mt-1 text-[10px] font-medium text-[#98A2B3]">واحد: {formatPrice(item.unitPrice)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="w-full shrink-0 rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-4 xl:w-64">
          <p className="text-xs font-bold text-[#98A2B3]">جزئیات فعالیت</p>
          <dl className="mt-3 space-y-3 text-xs">
            <InfoRow label="ساخت سبد" value={faDateTimeFormatter.format(cart.createdAt)} />
            <InfoRow label="آخرین فعالیت" value={faDateTimeFormatter.format(cart.lastActivityAt)} />
            {cart.checkoutStartedAt ? <InfoRow label="شروع پرداخت" value={faDateTimeFormatter.format(cart.checkoutStartedAt)} /> : null}
          </dl>
          {cart.latestOrder ? (
            <div className="mt-4 border-t border-[#E6EAF2] pt-4">
              <p className="text-[11px] font-bold text-[#98A2B3]">آخرین سفارش این کاربر</p>
              <Link className="mt-1 block font-mono text-xs font-black text-[#111827] hover:text-[#B54708]" href={`/admin?tab=orders&query=${encodeURIComponent(cart.latestOrder.id)}`}>
                #{cart.latestOrder.id.slice(0, 10).toUpperCase()}
              </Link>
              <p className="mt-1 text-[11px] text-[#667085]">{orderStatusLabels[cart.latestOrder.status] ?? cart.latestOrder.status}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function Metric({ label, value, helper, tone = "default" }: { label: string; value: number; helper: string; tone?: "default" | "green" | "red" | "blue" | "amber" }) {
  const colors = {
    default: "text-[#111827]",
    green: "text-[#027A48]",
    red: "text-[#C01048]",
    blue: "text-[#175CD3]",
    amber: "text-[#B54708]",
  };
  return (
    <div className="admin-kpi">
      <p className="admin-kpi-label">{label}</p>
      <p className={`admin-kpi-value ${colors[tone]}`}>{faNumberFormatter.format(value)}</p>
      <p className="admin-kpi-helper">{helper}</p>
    </div>
  );
}

function CartFilters({ filters }: { filters: CartsTabData["filters"] }) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const params = new URLSearchParams({ tab: "carts", cartStatus: option.key });
          if (filters.query) params.set("query", filters.query);
          return (
            <Link key={option.key} href={`/admin?${params}`} className={`rounded-full px-4 py-2 text-xs font-bold ${filters.status === option.key ? "bg-[#111827] text-white" : "border border-[#E6EAF2] bg-white text-[#475467]"}`}>
              {option.label}
            </Link>
          );
        })}
      </div>
      <form action="/admin" method="get" className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input type="hidden" name="tab" value="carts" />
        {filters.status !== "all" ? <input type="hidden" name="cartStatus" value={filters.status} /> : null}
        <input name="query" type="search" defaultValue={filters.query ?? ""} placeholder="جستجو با نام، موبایل یا ایمیل مشتری" />
        <button className="btn-outline" type="submit">جستجو</button>
      </form>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[#667085]">{label}</dt>
      <dd className="text-left font-bold text-[#344054]">{value}</dd>
    </div>
  );
}

function formatRelativeTime(date: Date) {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (elapsedMinutes < 1) return "همین حالا";
  if (elapsedMinutes < 60) return `${faNumberFormatter.format(elapsedMinutes)} دقیقه پیش`;
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${faNumberFormatter.format(hours)} ساعت پیش`;
  return `${faNumberFormatter.format(Math.floor(hours / 24))} روز پیش`;
}

function paginationLink(filters: CartsTabData["filters"], page: number, totalPages: number, label: string) {
  if (page < 1 || page > totalPages) return <span className="opacity-40">{label}</span>;
  const params = new URLSearchParams({ tab: "carts", page: String(page) });
  if (filters.status !== "all") params.set("cartStatus", filters.status);
  if (filters.query) params.set("query", filters.query);
  return <Link href={`/admin?${params}`} className="btn-outline min-h-9 px-4 py-2 text-xs">{label}</Link>;
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" />
    </svg>
  );
}
