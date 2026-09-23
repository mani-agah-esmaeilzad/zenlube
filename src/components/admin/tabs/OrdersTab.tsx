import Link from "next/link";

import {
  deleteOrderFormAction,
  updateOrderStatusAction,
  updateOrderTrackingAction,
} from "@/actions/admin";
import { retryMerchantOrderSmsAction } from "@/actions/admin/orders";
import { faDateTimeFormatter, faNumberFormatter } from "@/lib/formatters";
import { manualShippingStatusLabel } from "@/lib/shipping/manual-fulfillment";
import { formatPrice } from "@/lib/utils";
import type { AdminOrderSmsFeedback, OrdersTabData } from "@/services/admin/types";

const statusLabels: Record<string, string> = {
  all: "همه",
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت تأیید شده",
  PREPARING: "در حال آماده‌سازی",
  SHIPPED: "تحویل شرکت حمل",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-[#FFF7E8] text-[#D97706]",
  PAID: "bg-[#EFF8FF] text-[#175CD3]",
  PREPARING: "bg-[#F5F3FF] text-[#6D28D9]",
  SHIPPED: "bg-[#EEF4FF] text-[#3538CD]",
  DELIVERED: "bg-[#ECFDF3] text-[#027A48]",
  CANCELLED: "bg-[#FFF1F3] text-[#D92D20]",
};

function orderStatusLabel(status: string, paymentMethod?: string | null) {
  if (status === "PENDING" && paymentMethod === "COD") return "ثبت شد؛ پرداخت در محل";
  return statusLabels[status] ?? status;
}

function shippingChargeLabel(order: { shippingCost: number; shippingServiceCode?: string | null; shippingServiceLabel?: string | null }) {
  if (order.shippingServiceCode === "PICKUP") return "بدون هزینه حمل";
  if (order.shippingServiceCode === "MAHEX_COD" && order.shippingCost === 0 && !order.shippingServiceLabel?.includes("رایگان")) {
    return "پس‌کرایه هنگام تحویل";
  }
  return formatPrice(order.shippingCost);
}

const shipmentStatusLabels: Record<string, string> = {
  PENDING: "در انتظار آماده‌سازی",
  READY_TO_SHIP: "آماده ثبت",
  SUBMITTING: "در حال ثبت",
  SUBMITTED: "ثبت‌شده در سرویس",
  PICKED_UP: "تحویل شرکت حمل",
  IN_TRANSIT: "در مسیر",
  DELIVERED: "تحویل‌شده",
  FAILED: "خطای ثبت",
  UNKNOWN: "نیازمند بررسی",
  CANCELLED: "لغوشده",
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
      label: "در حال آماده‌سازی",
      value: faNumberFormatter.format(statusCounts.PREPARING ?? 0),
      helper: "سفارش‌هایی که باید بسته‌بندی شوند",
    },
    {
      label: "فروش ۳۰ روز اخیر",
      value: formatPrice(revenueLast30),
      helper: `${faNumberFormatter.format(statusCounts.DELIVERED ?? 0)} سفارش تحویل شده`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
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
                      {orderStatusLabel(order.status, order.paymentMethod)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#98A2B3]">{faDateTimeFormatter.format(order.createdAt)}</p>
                  {order.smsNotifications ? (
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <SmsFeedbackLine label="پیامک سفارش جدید به مدیر" feedback={order.smsNotifications.merchant} />
                      {["absent", "failed", "disabled", "sandbox", "sent"].includes(order.smsNotifications.merchant.status) ? (
                        <form action={retryMerchantOrderSmsAction}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button type="submit" className="text-[11px] font-bold text-[#175CD3] underline underline-offset-4">
                            {order.smsNotifications.merchant.status === "sent" ? "ارسال دوباره به مدیر" : "ارسال به مدیر"}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="text-left">
                  <p className="text-sm font-black text-[#111827]">{formatPrice(order.total)}</p>
                  <p className="mt-1 text-[11px] text-[#667085]">{order.paymentMethod === "COD" ? "پرداخت در محل" : order.paymentGateway ?? "بدون درگاه ثبت شده"}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 2xl:grid-cols-[1fr_0.9fr_0.9fr]">
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
                  {order.paymentEvents.some((event) => ["RECONCILIATION_REQUIRED", "VERIFICATION_PENDING"].includes(event.status)) ? (
                    <div className="border-r-2 border-amber-500 bg-amber-50 px-3 py-2 text-[11px] font-bold leading-6 text-amber-800">
                      نتیجهٔ درگاه نیازمند بررسی است؛ تا تعیین تکلیف، برای این سفارش پرداخت تازه ایجاد نکنید.
                    </div>
                  ) : null}
                  <InfoRow label="مبلغ سفارش" value={formatPrice(order.total)} strong />
                  <InfoRow label="روش پرداخت" value={order.paymentMethod === "COD" ? "پرداخت در محل" : order.paymentGateway ?? "-"} />
                  <InfoRow label="Authority" value={order.paymentAuthority ?? "-"} mono />
                  <InfoRow label="Ref ID" value={order.paymentRefId ?? "-"} mono />
                  <InfoRow label="کد پیگیری" value={order.shippingTrackingCode ?? "-"} />
                  <InfoRow
                    label="تاریخ پرداخت"
                    value={order.paidAt ? faDateTimeFormatter.format(order.paidAt) : "-"}
                  />
                  {order.paymentEvents.slice(0, 3).map((event) => (
                    <InfoRow
                      key={event.id}
                      label="رویداد درگاه"
                      value={`${event.status} · ${faDateTimeFormatter.format(event.createdAt)}`}
                      mono
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <StatusForm
                    orderId={order.id}
                    currentStatus={order.status}
                    paymentMethod={order.paymentMethod}
                    smsFeedback={order.smsNotifications?.status}
                  />
                  <TrackingForm orderId={order.id} trackingCode={order.shippingTrackingCode} smsFeedback={order.smsNotifications?.tracking} />
                  <form action={deleteOrderFormAction} className="rounded-[22px] border border-[#FECACA] bg-[#FFF1F3] p-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <label className="mb-3 flex items-start gap-2 text-[11px] font-bold leading-5 text-[#B42318]">
                      <input className="mt-1 h-4 w-4" name="confirmDelete" required type="checkbox" value="DELETE" />
                      <span>تأیید می‌کنم سفارش و سوابق وابسته آن برای همیشه حذف شود. این کار موجودی یا وجه پرداختی را برنمی‌گرداند.</span>
                    </label>
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-[#D92D20] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#B42318]"
                    >
                      حذف دائمی سفارش
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#667085]">اطلاعات ارسال</p>
                    <p className="mt-2 text-base font-black text-[#111827]">{order.shippingServiceLabel ?? order.shippingCarrierLabel ?? "اطلاعات ارسال قدیمی"}</p>
                    <p className="mt-1 text-xs leading-6 text-[#667085]">{order.fullName} · {order.phone}</p>
                    <p className="text-xs leading-6 text-[#667085]">{order.province}، {order.city}، {order.address1}{order.address2 ? `، ${order.address2}` : ""}</p>
                    <p className="text-xs leading-6 text-[#667085]">کد پستی: {order.postalCode}</p>
                  </div>
                  <div className="grid min-w-0 gap-2 text-xs sm:grid-cols-2 xl:min-w-[420px]">
                    <InfoRow label="هزینه مشتری" value={shippingChargeLabel(order)} strong />
                    <InfoRow label="نرخ پایه" value={order.shippingBaseCost == null ? "-" : formatPrice(order.shippingBaseCost)} />
                    <InfoRow label="وزن مرسوله" value={order.shippingPackageWeightGrams ? `${faNumberFormatter.format(order.shippingPackageWeightGrams)} گرم` : "-"} />
                    <InfoRow label="ابعاد" value={order.shippingPackageLengthCm && order.shippingPackageWidthCm && order.shippingPackageHeightCm ? `${order.shippingPackageLengthCm}×${order.shippingPackageWidthCm}×${order.shippingPackageHeightCm} cm` : "-"} />
                    <InfoRow label="وضعیت ارسال" value={order.shipment ? shipmentStatusLabels[order.shipment.status] ?? order.shipment.status : manualShippingStatusLabel(order.status)} />
                    <InfoRow label="کد رهگیری" value={order.shippingTrackingCode ?? order.shipment?.trackingCode ?? "-"} mono />
                    <InfoRow label="زمان ثبت" value={order.shipment?.submittedAt ? faDateTimeFormatter.format(order.shipment.submittedAt) : "-"} />
                    <InfoRow label="وضعیت سرویس" value={order.shipment?.externalStatus ?? order.shippingExternalStatus ?? "-"} />
                  </div>
                </div>
                {order.shipment?.lastErrorMessage ? <p className="mt-3 border-r-2 border-red-400 px-3 py-2 text-xs leading-6 text-[#B42318]">{order.shipment.lastErrorMessage}</p> : null}
                {order.status === "PAID" || order.status === "PREPARING" ? (
                  <p className="mt-4 border-r-2 border-[#F59E0B] px-3 py-2 text-xs leading-6 text-[#92400E]">
                    {order.shippingServiceCode === "PICKUP"
                      ? "پس از هماهنگی و تحویل حضوری سفارش، وضعیت آن را در فرم سفارش به «ارسال شده» یا «تحویل شده» تغییر دهید."
                      : `پس از تحویل بسته به ${order.shippingCarrierLabel ?? "شرکت حمل منتخب مشتری"}، وضعیت سفارش را «ارسال شده» کنید و کد پیگیری را در فرم سفارش ذخیره کنید؛ پیامک آن برای مشتری ارسال می‌شود.`}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 rounded-[24px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-[#667085]">اقلام سفارش</p>
                  <span className="admin-chip">{faNumberFormatter.format(order.items.length)} قلم</span>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
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
    <div className="flex min-w-0 flex-col gap-1 rounded-[18px] border border-[#E6EAF2] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="text-[#667085]">{label}</span>
      <span className={`min-w-0 break-words text-left ${strong ? "font-black text-[#111827]" : "font-bold text-[#475467]"} ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function SmsFeedbackLine({ label, feedback }: { label: string; feedback?: AdminOrderSmsFeedback | null }) {
  if (!feedback) return null;
  const color = feedback.status === "sent"
    ? "text-[#027A48]"
    : ["failed", "uncertain", "unknown"].includes(feedback.status)
      ? "text-[#B42318]"
      : "text-[#667085]";

  return (
    <p className={`text-[11px] leading-5 ${color}`}>
      {label}: {feedback.label}
      {feedback.errorSummary ? <span className="block">{feedback.errorSummary}</span> : null}
    </p>
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
          if (filters.shipping !== "all") params.set("shipping", filters.shipping);
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
        {filters.shipping !== "all" ? <input type="hidden" name="shipping" value={filters.shipping} /> : null}
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
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          ["all", "همه ارسال‌ها"],
          ["POST", "پست"],
          ["TIPAX", "تیپاکس"],
          ["UNSHIPPED", "آماده تحویل"],
          ["SHIPPED", "تحویل شرکت حمل"],
          ["TRACKING", "دارای رهگیری"],
        ].map(([key, label]) => {
          const params = new URLSearchParams({ tab: "orders", shipping: key });
          if (currentStatus !== "all") params.set("status", currentStatus);
          if (filters.query) params.set("query", filters.query);
          return <Link key={key} href={`/admin?${params}`} className={`rounded-full px-3 py-2 font-bold ${filters.shipping === key ? "bg-[#111827] text-white" : "border border-[#E6EAF2] bg-white text-[#475467]"}`}>{label}</Link>;
        })}
      </div>
    </div>
  );
}

function StatusForm({
  orderId,
  currentStatus,
  paymentMethod,
  smsFeedback,
}: {
  orderId: string;
  currentStatus: string;
  paymentMethod?: string | null;
  smsFeedback?: AdminOrderSmsFeedback | null;
}) {
  return (
    <form action={updateOrderStatusAction} className="rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-3 text-xs text-[#667085]">
      <label className="font-bold text-[#475467]">
        تغییر وضعیت
        <select name="status" defaultValue={currentStatus} className="mt-2">
          <option value="PENDING">{paymentMethod === "COD" ? "ثبت شد؛ پرداخت در محل" : "در انتظار پرداخت"}</option>
          <option value="PAID">پرداخت تأیید شده</option>
          <option value="PREPARING">در حال آماده‌سازی</option>
          <option value="SHIPPED">تحویل شرکت حمل / ارسال شده</option>
          <option value="DELIVERED">تحویل شده</option>
          <option value="CANCELLED">لغو شده</option>
        </select>
      </label>
      <p className="mt-3 text-[11px] leading-5 text-[#667085]">
        پیامک وضعیت خودکار ارسال می‌شود. اگر ارسال ناموفق بود، دوباره ذخیره کنید؛ پیامک موفق تکرار نمی‌شود.
      </p>
      <SmsFeedbackLine label="پیامک وضعیت فعلی" feedback={smsFeedback} />
      <input type="hidden" name="orderId" value={orderId} />
      <button type="submit" className="btn-primary mt-3 min-h-10 w-full text-xs">
        ذخیره وضعیت
      </button>
    </form>
  );
}

function TrackingForm({ orderId, trackingCode, smsFeedback }: { orderId: string; trackingCode?: string | null; smsFeedback?: AdminOrderSmsFeedback | null }) {
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
      <p className="mt-3 text-[11px] leading-5 text-[#667085]">
        کد پیگیری خودکار پیامک می‌شود. اگر ارسال ناموفق بود، دوباره ذخیره کنید؛ پیامک موفق تکرار نمی‌شود.
      </p>
      <SmsFeedbackLine label="پیامک کد فعلی" feedback={smsFeedback} />
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
  if (filters.shipping && filters.shipping !== "all") params.set("shipping", filters.shipping);
  if (filters.query) params.set("query", filters.query);

  return (
    <Link href={`/admin?${params.toString()}`} className="btn-outline min-h-9 px-4 py-2 text-xs">
      {label}
    </Link>
  );
}
