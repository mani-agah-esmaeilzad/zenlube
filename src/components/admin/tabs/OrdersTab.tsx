import Link from "next/link";

import { updateOrderStatusAction, updateOrderTrackingAction } from "@/actions/admin";
import { faNumberFormatter } from "@/lib/formatters";
import { formatPrice } from "@/lib/utils";
import type { OrdersTabData } from "@/services/admin/types";

const statusLabels: Record<string, string> = {
  all: "همه",
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

type OrdersTabProps = {
  data: OrdersTabData;
};

export function OrdersTab({ data }: OrdersTabProps) {
  const { orders, filters, pagination, statusCounts, revenueLast30 } = data;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">مدیریت سفارش‌ها</h2>
            <p className="mt-1 text-sm leading-7 text-[#6B7280]">
              وضعیت سفارش، پرداخت، کد پیگیری و پیامک اطلاع‌رسانی مشتری را از همین بخش مدیریت کنید.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
            فروش ۳۰ روز اخیر: {formatPrice(revenueLast30)}
          </div>
        </header>

        <OrdersFilterForm filters={filters} statusCounts={statusCounts} />
        <div className="mt-4 text-xs text-[#6B7280]">
          {faNumberFormatter.format(pagination.total)} سفارش، صفحه {faNumberFormatter.format(pagination.page)} از{" "}
          {faNumberFormatter.format(pagination.totalPages)}
        </div>
      </section>

      <section className="space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <article key={order.id} className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#111827]">#{order.id.slice(0, 10)}</span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${statusStyles[order.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#6B7280]">{new Date(order.createdAt).toLocaleString("fa-IR")}</p>
                  <div className="mt-4 rounded-2xl bg-[#F7F7F8] p-4 text-xs leading-6 text-[#374151]">
                    <p className="font-bold text-[#111827]">{order.fullName}</p>
                    <p>{order.phone}</p>
                    <p>{order.email}</p>
                    <p className="mt-2 text-[#6B7280]">
                      {order.province}، {order.city}، {order.address1}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <InfoRow label="مبلغ سفارش" value={formatPrice(order.total)} strong />
                  <InfoRow label="درگاه" value={order.paymentGateway ?? "-"} />
                  <InfoRow label="Authority" value={order.paymentAuthority ?? "-"} mono />
                  <InfoRow label="Ref ID" value={order.paymentRefId ?? "-"} mono />
                  <InfoRow label="تاریخ پرداخت" value={order.paidAt ? new Date(order.paidAt).toLocaleString("fa-IR") : "-"} />
                  {order.paymentEvents[0] ? (
                    <p className="rounded-2xl border border-[#E5E7EB] px-3 py-2 text-[#6B7280]">
                      آخرین رویداد پرداخت: <span className="font-bold text-[#111827]">{order.paymentEvents[0].status}</span>
                    </p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <StatusForm orderId={order.id} currentStatus={order.status} trackingCode={order.shippingTrackingCode} />
                  <TrackingForm orderId={order.id} trackingCode={order.shippingTrackingCode} />
                </div>
              </div>

              <div className="mt-5 border-t border-[#E5E7EB] pt-4">
                <p className="text-xs font-bold text-[#111827]">اقلام سفارش</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[#E5E7EB] px-3 py-2 text-xs text-[#6B7280]">
                      <span className="font-bold text-[#111827]">{item.quantity.toLocaleString("fa-IR")}×</span> {item.name}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#6B7280]">
            سفارشی برای نمایش وجود ندارد.
          </div>
        )}
      </section>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-3xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs text-[#6B7280]">
          {renderPaginationLink(filters, pagination.page - 1, pagination.totalPages, "قبلی")}
          <span>
            صفحه {faNumberFormatter.format(pagination.page)} از {faNumberFormatter.format(pagination.totalPages)}
          </span>
          {renderPaginationLink(filters, pagination.page + 1, pagination.totalPages, "بعدی")}
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value, strong, mono }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] px-3 py-2">
      <span className="text-[#6B7280]">{label}</span>
      <span className={`${strong ? "font-black text-[#111827]" : "font-bold text-[#374151]"} ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
    </div>
  );
}

type FilterFormProps = {
  filters: OrdersTabData["filters"];
  statusCounts: OrdersTabData["statusCounts"];
};

function OrdersFilterForm({ filters, statusCounts }: FilterFormProps) {
  const currentStatus = filters.status;
  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(statusLabels).map(([key, label]) => {
          const count = statusCounts[key] ?? 0;
          const params = new URLSearchParams();
          params.set("tab", "orders");
          params.set("status", key);
          if (filters.query) params.set("query", filters.query);
          return (
            <Link
              key={key}
              href={`/admin?${params.toString()}`}
              className={`rounded-full px-3 py-1 font-bold ${
                currentStatus === key ? "bg-[#111827] text-white" : "bg-[#F7F7F8] text-[#6B7280] hover:bg-slate-200"
              }`}
            >
              {label}
              <span className="mr-1 text-[10px] opacity-70">{faNumberFormatter.format(count)}</span>
            </Link>
          );
        })}
      </div>
      <form method="get" action="/admin" className="flex flex-col gap-2 text-xs text-[#6B7280] sm:flex-row">
        <input type="hidden" name="tab" value="orders" />
        {currentStatus && currentStatus !== "all" ? <input type="hidden" name="status" value={currentStatus} /> : null}
        <input
          type="search"
          name="query"
          defaultValue={filters.query ?? ""}
          placeholder="جستجو با شناسه، نام، موبایل یا ایمیل"
          className="input-zen flex-1 text-xs"
        />
        <button type="submit" className="btn-outline">
          جستجو
        </button>
      </form>
    </div>
  );
}

function StatusForm({ orderId, currentStatus, trackingCode }: { orderId: string; currentStatus: string; trackingCode?: string | null }) {
  const nextText = currentStatus === "SHIPPED" ? `سفارش آماده ارسال پیامک با کد ${trackingCode ?? "ثبت نشده"}` : "پیامک وضعیت برای مشتری ارسال شود";

  return (
    <form action={updateOrderStatusAction} className="space-y-2 rounded-2xl border border-[#E5E7EB] p-3 text-xs text-[#6B7280]">
      <label className="font-bold text-[#374151]">
        تغییر وضعیت
        <select name="status" defaultValue={currentStatus} className="input-zen mt-2 text-xs">
          <option value="PENDING">در انتظار پرداخت</option>
          <option value="PAID">پرداخت شده / در حال پردازش</option>
          <option value="SHIPPED">ارسال شده</option>
          <option value="DELIVERED">تحویل شده</option>
          <option value="CANCELLED">لغو شده</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-[11px]">
        <input type="checkbox" name="sendSms" value="true" className="size-4 accent-[#DC2626]" />
        {nextText}
      </label>
      <input type="hidden" name="orderId" value={orderId} />
      <button type="submit" className="btn-primary min-h-10 w-full text-xs">
        ذخیره وضعیت
      </button>
    </form>
  );
}

function TrackingForm({ orderId, trackingCode }: { orderId: string; trackingCode?: string | null }) {
  return (
    <form action={updateOrderTrackingAction} className="space-y-2 rounded-2xl border border-[#E5E7EB] p-3 text-xs text-[#6B7280]">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="font-bold text-[#374151]">
        کد پیگیری
        <input name="shippingTrackingCode" defaultValue={trackingCode ?? ""} placeholder="مثلا POST-123456" className="input-zen mt-2 text-xs" />
      </label>
      <label className="flex items-center gap-2 text-[11px]">
        <input type="checkbox" name="sendSms" value="true" className="size-4 accent-[#DC2626]" />
        ارسال پیامک کد پیگیری به مشتری
      </label>
      <button type="submit" className="btn-outline min-h-10 w-full text-xs">
        ذخیره کد پیگیری
      </button>
    </form>
  );
}

function renderPaginationLink(filters: OrdersTabData["filters"], targetPage: number, totalPages: number, label: string) {
  const isDisabled = targetPage < 1 || targetPage > totalPages;
  if (isDisabled) return <span className="opacity-50">{label}</span>;

  const params = new URLSearchParams();
  params.set("tab", "orders");
  params.set("page", targetPage.toString());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.query) params.set("query", filters.query);

  return (
    <Link href={`/admin?${params.toString()}`} className="btn-outline min-h-9 px-4 py-2 text-xs">
      {label}
    </Link>
  );
}
