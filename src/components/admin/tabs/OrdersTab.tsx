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

type OrdersTabProps = {
  data: OrdersTabData;
};

export function OrdersTab({ data }: OrdersTabProps) {
  const { orders, filters, pagination, statusCounts, revenueLast30 } = data;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">سفارش‌های فروشگاه</h2>
            <p className="mt-1 text-xs text-slate-500">
              وضعیت سفارش‌ها را کنترل کنید، پرداخت‌ها را بررسی کنید و اطلاعات ارسال را بروزرسانی کنید.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            فروش ۳۰ روز اخیر: {formatPrice(revenueLast30)}
          </div>
        </header>

        <OrdersFilterForm filters={filters} statusCounts={statusCounts} />
        <div className="mt-4 text-xs text-slate-500">
          {faNumberFormatter.format(pagination.total)} سفارش — صفحه {faNumberFormatter.format(pagination.page)} از {" "}
          {faNumberFormatter.format(pagination.totalPages)}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
          <thead className="bg-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3 text-right">شناسه</th>
              <th className="px-4 py-3 text-right">مشتری</th>
              <th className="px-4 py-3 text-right">مبلغ</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">روش ارسال</th>
              <th className="px-4 py-3 text-right">اقلام</th>
              <th className="px-4 py-3 text-right">اقدامات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-slate-50">
            {orders.length ? (
              orders.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="text-xs font-semibold text-slate-900">{order.id.slice(0, 10)}</div>
                    <div className="mt-1 text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleString("fa-IR")}</div>
                    <div className="mt-2 text-[11px] text-slate-400">{order.paymentRefId ? `Ref: ${order.paymentRefId}` : "-"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs font-semibold text-slate-900">{order.fullName}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{order.email}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{order.phone}</div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      {order.province}، {order.city}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-4">
                    <StatusForm orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <div className="font-semibold text-slate-900">{translateShipping(order.shippingMethod)}</div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {order.shippingTrackingCode ? `کد پیگیری: ${order.shippingTrackingCode}` : "بدون کد پیگیری"}
                    </div>
                    <TrackingForm orderId={order.id} trackingCode={order.shippingTrackingCode} />
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1 text-xs text-slate-500">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}× {item.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <Link
                      href={`/account?orderId=${order.id}`}
                      className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
                    >
                      مشاهده در حساب کاربری
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  سفارشی برای نمایش وجود ندارد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-100 px-4 py-3 text-xs text-slate-600">
            {renderPaginationLink(filters, pagination.page - 1, pagination.totalPages, "قبلی")}
            <span>
              صفحه {faNumberFormatter.format(pagination.page)} از {faNumberFormatter.format(pagination.totalPages)}
            </span>
            {renderPaginationLink(filters, pagination.page + 1, pagination.totalPages, "بعدی")}
          </div>
        ) : null}
      </section>
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
          if (filters.query) {
            params.set("query", filters.query);
          }
          return (
            <Link
              key={key}
              href={`/admin?${params.toString()}`}
              className={`rounded-full px-3 py-1 ${
                currentStatus === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
              <span className="mr-1 text-[10px] text-slate-400">{faNumberFormatter.format(count)}</span>
            </Link>
          );
        })}
      </div>
      <form method="get" action="/admin" className="flex gap-2 text-xs text-slate-500">
        <input type="hidden" name="tab" value="orders" />
        {currentStatus && currentStatus !== "all" ? (
          <input type="hidden" name="status" value={currentStatus} />
        ) : null}
        <input
          type="search"
          name="query"
          defaultValue={filters.query ?? ""}
          placeholder="شناسه، نام یا ایمیل"
          className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-sky-300 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full border border-slate-300 px-4 py-2 text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
        >
          جستجو
        </button>
      </form>
    </div>
  );
}

type StatusFormProps = {
  orderId: string;
  currentStatus: string;
};

function StatusForm({ orderId, currentStatus }: StatusFormProps) {
  return (
    <form action={updateOrderStatusAction} className="space-y-2 text-xs text-slate-600">
      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full rounded-full border border-slate-300 bg-white px-3 py-1 text-xs focus:border-sky-300 focus:outline-none"
      >
        <option value="PENDING">در انتظار پرداخت</option>
        <option value="PAID">پرداخت شده</option>
        <option value="SHIPPED">ارسال شده</option>
        <option value="DELIVERED">تحویل شده</option>
        <option value="CANCELLED">لغو شده</option>
      </select>
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        className="w-full rounded-full border border-sky-200 px-3 py-1 text-sky-600 transition hover:bg-sky-50"
      >
        ذخیره وضعیت
      </button>
    </form>
  );
}

type TrackingFormProps = {
  orderId: string;
  trackingCode?: string | null;
};

function TrackingForm({ orderId, trackingCode }: TrackingFormProps) {
  return (
    <form action={updateOrderTrackingAction} className="mt-3 flex gap-2 text-xs">
      <input type="hidden" name="orderId" value={orderId} />
      <input
        name="shippingTrackingCode"
        defaultValue={trackingCode ?? ""}
        placeholder="کد پیگیری"
        className="flex-1 rounded-full border border-slate-300 px-3 py-1 text-xs focus:border-sky-300 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-full border border-sky-200 px-3 py-1 text-sky-600 transition hover:bg-sky-50"
      >
        ذخیره
      </button>
    </form>
  );
}

function translateShipping(value: string) {
  switch (value) {
    case "STANDARD":
      return "ارسال استاندارد";
    case "EXPRESS":
      return "ارسال سریع";
    case "PICKUP":
      return "تحویل حضوری";
    default:
      return value;
  }
}

function renderPaginationLink(
  filters: OrdersTabData["filters"],
  targetPage: number,
  totalPages: number,
  label: string,
) {
  const isDisabled = targetPage < 1 || targetPage > totalPages;
  if (isDisabled) {
    return <span className="opacity-50">{label}</span>;
  }

  const params = new URLSearchParams();
  params.set("tab", "orders");
  params.set("page", targetPage.toString());
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.query) {
    params.set("query", filters.query);
  }

  return (
    <Link
      href={`/admin?${params.toString()}`}
      className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
    >
      {label}
    </Link>
  );
}
