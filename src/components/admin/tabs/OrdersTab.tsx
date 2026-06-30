import Link from "next/link";

import {
  deleteOrderFormAction,
  updateOrderStatusAction,
  updateOrderTrackingAction,
} from "@/actions/admin";
import { faDateTimeFormatter, faNumberFormatter } from "@/lib/formatters";
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
  PENDING: "bg-[#FFF7E8] text-[#D97706]",
  PAID: "bg-[#EFF8FF] text-[#175CD3]",
  SHIPPED: "bg-[#EEF4FF] text-[#3538CD]",
  DELIVERED: "bg-[#ECFDF3] text-[#027A48]",
  CANCELLED: "bg-[#FFF1F3] text-[#D92D20]",
};

type OrdersTabProps = {
  data: OrdersTabData;
};

export function OrdersTab({ data }: OrdersTabProps) {
  const { orders, filters, pagination, statusCounts, revenueLast30 } = data;

  const metrics = [
    {
      label: "کل سفارش‌های فیلترشده",
      value: faNumberFormatter.format(pagination.total),
      helper: `${faNumberFormatter.format(pagination.page)} از ${faNumberFormatter.format(pagination.totalPages)} صفحه`,
    },
    {
      label: "در انتظار پرداخت",
      value: faNumberFormatter.format(statusCounts.PENDING ?? 0),
      helper: "سفارش‌های نیازمند پیگیری",
    },
    {
      label: "ارسال شده",
      value: faNumberFormatter.format(statusCounts.SHIPPED ?? 0),
      helper: "مرسوله‌های دارای کد پیگیری",
    },
    {
      label: "فروش ۳۰ روز اخیر",
      value: formatPrice(revenueLast30),
      helper: `${faNumberFormatter.format(statusCounts.DELIVERED ?? 0)} سفارش تحویل شده`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="admin-kpi">
            <p className="admin-kpi-label">{metric.label}</p>
            <p className="admin-kpi-value">{metric.value}</p>
            <p className="admin-kpi-helper">{metric.helper}</p>
          </div>
        ))}
      </section>

      <section className="admin-panel p-5 md:p-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#111827]">مدیریت سفارش‌ها</h2>
            <p className="mt-1 text-sm leading-7 text-[#667085]">
              وضعیت سفارش، پرداخت، ارسال و پیامک مشتریان را از همین بخش و با سرعت بالاتر مدیریت کنید.
            </p>
          </div>
          <div className="rounded-[20px] border border-[#D1FADF] bg-[#ECFDF3] px-4 py-2 text-xs font-bold text-[#027A48]">
            فروش ۳۰ روز اخیر: {formatPrice(revenueLast30)}
          </div>
        </header>

        <OrdersFilterForm filters={filters} statusCounts={statusCounts} />
      </section>

      <section className="space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <article key={order.id} className="admin-panel p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E6EAF2] pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#111827]">#{order.id.slice(0, 10)}</span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusStyles[order.status] ?? "bg-[#F4F4F5] text-[#344054]"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#98A2B3]">{faDateTimeFormatter.format(order.createdAt)}</p>
                </div>

                <div className="text-left">
                  <p className="text-sm font-black text-[#111827]">{formatPrice(order.total)}</p>
                  <p className="mt-1 text-[11px] text-[#667085]">{order.paymentGateway ?? "بدون درگاه ثبت شده"}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.9fr_0.9fr]">
                <div className="rounded-[24px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                  <p className="text-xs font-bold text-[#667085]">مشخصات مشتری و آدرس</p>
                  <div className="mt-4 space-y-2 text-sm text-[#475467]">
                    <p className="font-black text-[#111827]">{order.fullName}</p>
                    <p>{order.phone}</p>
                    <p>{order.email ?? "ایمیل ثبت نشده"}</p>
                    <p className="leading-7 text-[#667085]">
                      {order.province}، {order.city}، {order.address1}
                    </p>
                    {order.notes ? <p className="rounded-[18px] bg-white px-3 py-2 text-xs text-[#667085]">{order.notes}</p> : null}
                  </div>
                </div>

                <div className="space-y-3 rounded-[24px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                  <p className="text-xs font-bold text-[#667085]">پرداخت و وضعیت</p>
                  <InfoRow label="مبلغ سفارش" value={formatPrice(order.total)} strong />
                  <InfoRow label="درگاه" value={order.paymentGateway ?? "-"} />
                  <InfoRow label="Authority" value={order.paymentAuthority ?? "-"} mono />
                  <InfoRow label="Ref ID" value={order.paymentRefId ?? "-"} mono />
                  <InfoRow label="کد پیگیری" value={order.shippingTrackingCode ?? "-"} />
                  <InfoRow
                    label="تاریخ پرداخت"
                    value={order.paidAt ? faDateTimeFormatter.format(order.paidAt) : "-"}
                  />
                </div>

                <div className="space-y-4">
                  <StatusForm
                    orderId={order.id}
                    currentStatus={order.status}
                    trackingCode={order.shippingTrackingCode}
                  />
                  <TrackingForm orderId={order.id} trackingCode={order.shippingTrackingCode} />
                  <form action={deleteOrderFormAction} className="rounded-[22px] border border-[#FECACA] bg-[#FFF1F3] p-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-[#D92D20] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#B42318]"
                    >
                      حذف / بایگانی سفارش
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-[#667085]">اقلام سفارش</p>
                  <span className="admin-chip">{faNumberFormatter.format(order.items.length)} قلم</span>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-[18px] border border-[#E6EAF2] bg-white px-3 py-3 text-sm text-[#475467]">
                      <span className="font-black text-[#111827]">{faNumberFormatter.format(item.quantity)}×</span>{" "}
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-panel px-6 py-12 text-center text-sm text-[#667085]">سفارشی برای نمایش وجود ندارد.</div>
        )}
      </section>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-[24px] border border-[#E6EAF2] bg-white px-4 py-3 text-xs text-[#667085]">
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

function InfoRow({
  label,
  value,
  strong,
  mono,
}: {
  label: string;
  value: string;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#E6EAF2] bg-white px-3 py-2.5">
      <span className="text-[#667085]">{label}</span>
      <span className={`${strong ? "font-black text-[#111827]" : "font-bold text-[#475467]"} ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </span>
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
              className={`rounded-full px-4 py-2 font-bold transition ${
                currentStatus === key ? "bg-[#111827] text-white" : "border border-[#E6EAF2] bg-white text-[#475467] hover:border-[#F5C56B]"
              }`}
            >
              {label}
              <span className="mr-1 text-[10px] opacity-70">{faNumberFormatter.format(count)}</span>
            </Link>
          );
        })}
      </div>

      <form method="get" action="/admin" className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input type="hidden" name="tab" value="orders" />
        {currentStatus && currentStatus !== "all" ? <input type="hidden" name="status" value={currentStatus} /> : null}
        <input
          type="search"
          name="query"
          defaultValue={filters.query ?? ""}
          placeholder="جستجو با شناسه، نام، موبایل یا ایمیل"
        />
        <button type="submit" className="btn-outline">
          جستجو
        </button>
      </form>
    </div>
  );
}

function StatusForm({
  orderId,
  currentStatus,
  trackingCode,
}: {
  orderId: string;
  currentStatus: string;
  trackingCode?: string | null;
}) {
  const nextText =
    currentStatus === "SHIPPED"
      ? `سفارش آماده ارسال پیامک با کد ${trackingCode ?? "ثبت نشده"}`
      : "پیامک وضعیت برای مشتری ارسال شود";

  return (
    <form action={updateOrderStatusAction} className="rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-3 text-xs text-[#667085]">
      <label className="font-bold text-[#475467]">
        تغییر وضعیت
        <select name="status" defaultValue={currentStatus} className="mt-2">
          <option value="PENDING">در انتظار پرداخت</option>
          <option value="PAID">پرداخت شده / در حال پردازش</option>
          <option value="SHIPPED">ارسال شده</option>
          <option value="DELIVERED">تحویل شده</option>
          <option value="CANCELLED">لغو شده</option>
        </select>
      </label>
      <label className="mt-3 flex items-center gap-2 text-[11px]">
        <input type="checkbox" name="sendSms" value="true" className="size-4 accent-[#F59E0B]" />
        {nextText}
      </label>
      <input type="hidden" name="orderId" value={orderId} />
      <button type="submit" className="btn-primary mt-3 min-h-10 w-full text-xs">
        ذخیره وضعیت
      </button>
    </form>
  );
}

function TrackingForm({ orderId, trackingCode }: { orderId: string; trackingCode?: string | null }) {
  return (
    <form action={updateOrderTrackingAction} className="rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-3 text-xs text-[#667085]">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="font-bold text-[#475467]">
        کد پیگیری
        <input
          name="shippingTrackingCode"
          defaultValue={trackingCode ?? ""}
          placeholder="مثلا POST-123456"
          className="mt-2"
        />
      </label>
      <label className="mt-3 flex items-center gap-2 text-[11px]">
        <input type="checkbox" name="sendSms" value="true" className="size-4 accent-[#F59E0B]" />
        ارسال پیامک کد پیگیری به مشتری
      </label>
      <button type="submit" className="btn-outline mt-3 min-h-10 w-full text-xs">
        ذخیره کد پیگیری
      </button>
    </form>
  );
}

function renderPaginationLink(
  filters: OrdersTabData["filters"],
  targetPage: number,
  totalPages: number,
  label: string,
) {
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
