import Link from "next/link";

import { FeedbackInviteForm } from "@/components/admin/feedback-invite-form";
import { faDateTimeFormatter, faNumberFormatter } from "@/lib/formatters";
import { formatPrice } from "@/lib/utils";
import type { FeedbackTabData } from "@/services/admin/types";

const feedbackStatusLabels = {
  PENDING: "ارسال‌نشده",
  SENT: "در انتظار پاسخ",
  SUBMITTED: "پاسخ ثبت‌شده",
} as const;

const orderStatusLabels: Record<string, string> = {
  PAID: "پرداخت‌شده",
  PREPARING: "در حال آماده‌سازی",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
};

export function FeedbackTab({ data }: { data: FeedbackTabData }) {
  const { metrics, orders, filters, pagination } = data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Metric label="سفارش قابل نظرسنجی" value={metrics.eligible} helper="پرداخت‌شده تا تحویل‌شده" />
        <Metric label="در انتظار پاسخ" value={metrics.sent} helper="لینک پیامک شده است" />
        <Metric label="بازخورد ثبت‌شده" value={metrics.submitted} helper="پاسخ‌های کامل مشتریان" />
        <Metric
          label="میانگین رضایت"
          value={metrics.averageRating == null ? "—" : `${metrics.averageRating.toFixed(1)} از ۵`}
          helper="براساس امتیاز کلی"
        />
      </section>

      <section className="admin-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#111827]">نظرسنجی پس از خرید</h2>
            <p className="mt-1 max-w-3xl text-sm leading-7 text-[#667085]">
              مشتری و سفارش را انتخاب کنید؛ لینک اختصاصی و زمان‌دار با پیامک ارسال می‌شود و نتیجه همین‌جا نمایش داده خواهد شد.
            </p>
          </div>
          <div className="rounded-[18px] border border-[#D1FADF] bg-[#ECFDF3] px-4 py-2 text-xs font-bold text-[#027A48]">
            هر لینک فقط یک پاسخ می‌پذیرد
          </div>
        </div>

        <FeedbackFilters filters={filters} />
      </section>

      <section className="space-y-4">
        {orders.length ? orders.map((order) => {
          const feedback = order.feedback;
          return (
            <article key={order.id} className="admin-panel p-5 md:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#111827]">#{order.id.slice(0, 10).toUpperCase()}</span>
                    <span className="rounded-full bg-[#F2F4F7] px-3 py-1 text-[11px] font-bold text-[#475467]">
                      {orderStatusLabels[order.status] ?? order.status}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${feedback?.status === "SUBMITTED" ? "bg-[#ECFDF3] text-[#027A48]" : feedback?.status === "SENT" ? "bg-[#EFF8FF] text-[#175CD3]" : "bg-[#FFF7E8] text-[#B54708]"}`}>
                      {feedback ? feedbackStatusLabels[feedback.status] : "ارسال‌نشده"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1.2fr_0.7fr]">
                    <div>
                      <p className="text-xs font-bold text-[#98A2B3]">مشتری</p>
                      <p className="mt-1 font-black text-[#111827]">{order.fullName}</p>
                      <p className="mt-1 text-sm text-[#475467]" dir="ltr">{order.phone}</p>
                      <p className="mt-1 break-all text-xs text-[#667085]">{order.email || "بدون ایمیل"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#98A2B3]">محصولات سفارش</p>
                      <ul className="mt-1 space-y-1 text-sm leading-6 text-[#475467]">
                        {order.items.map((item) => (
                          <li key={`${item.name}-${item.quantity}`}>{item.name} × {faNumberFormatter.format(item.quantity)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#98A2B3]">سفارش</p>
                      <p className="mt-1 text-sm font-black text-[#111827]">{formatPrice(order.total)}</p>
                      <p className="mt-1 text-xs text-[#667085]">{faDateTimeFormatter.format(order.createdAt)}</p>
                    </div>
                  </div>

                  {feedback?.status === "SUBMITTED" ? (
                    <div className="mt-5 border-t border-[#E6EAF2] pt-5">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Score label="رضایت کلی" value={feedback.overallRating} />
                        <Score label="کیفیت محصولات" value={feedback.productQualityRating} />
                        <Score label="ارسال و تحویل" value={feedback.deliveryRating} />
                        <Score label="پیشنهاد به دیگران" value={feedback.recommend ? "بله" : "خیر"} />
                      </div>
                      {feedback.comment ? (
                        <blockquote className="mt-4 border-r-2 border-[#F5A623] pr-4 text-sm leading-7 text-[#475467]">
                          {feedback.comment}
                        </blockquote>
                      ) : null}
                      {feedback.submittedAt ? <p className="mt-3 text-[11px] text-[#98A2B3]">ثبت پاسخ: {faDateTimeFormatter.format(feedback.submittedAt)}</p> : null}
                    </div>
                  ) : null}
                </div>

                <div className="w-full shrink-0 rounded-[22px] border border-[#E6EAF2] bg-[#FBFCFE] p-4 xl:w-64">
                  {feedback?.status === "SUBMITTED" ? (
                    <p className="text-center text-xs font-bold leading-6 text-[#027A48]">این نظرسنجی تکمیل شده و ارسال دوباره غیرفعال است.</p>
                  ) : (
                    <>
                      <FeedbackInviteForm orderId={order.id} isResend={feedback?.status === "SENT"} />
                      {feedback ? (
                        <div className="mt-3 space-y-1 border-t border-[#E6EAF2] pt-3 text-[11px] leading-5 text-[#667085]">
                          <p>تعداد تلاش ارسال: {faNumberFormatter.format(feedback.sendCount)}</p>
                          {feedback.sentAt ? <p>آخرین ارسال: {faDateTimeFormatter.format(feedback.sentAt)}</p> : null}
                          <p>اعتبار لینک تا: {faDateTimeFormatter.format(feedback.expiresAt)}</p>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="admin-panel p-8 text-center text-sm text-[#667085]">سفارشی مطابق این فیلتر پیدا نشد.</div>
        )}
      </section>

      {pagination.totalPages > 1 ? (
        <nav className="flex items-center justify-between gap-3 text-xs text-[#667085]">
          {paginationLink(filters, pagination.page - 1, pagination.totalPages, "قبلی")}
          <span>صفحه {faNumberFormatter.format(pagination.page)} از {faNumberFormatter.format(pagination.totalPages)}</span>
          {paginationLink(filters, pagination.page + 1, pagination.totalPages, "بعدی")}
        </nav>
      ) : null}
    </div>
  );
}

function Metric({ label, value, helper }: { label: string; value: number | string; helper: string }) {
  return (
    <div className="admin-kpi">
      <p className="admin-kpi-label">{label}</p>
      <p className="admin-kpi-value">{typeof value === "number" ? faNumberFormatter.format(value) : value}</p>
      <p className="admin-kpi-helper">{helper}</p>
    </div>
  );
}

function Score({ label, value }: { label: string; value?: number | string | null }) {
  return (
    <div className="border-r border-[#E6EAF2] pr-3">
      <p className="text-[11px] font-bold text-[#98A2B3]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#111827]">{typeof value === "number" ? `${faNumberFormatter.format(value)} از ۵` : value ?? "—"}</p>
    </div>
  );
}

function FeedbackFilters({ filters }: { filters: FeedbackTabData["filters"] }) {
  const options = [
    ["all", "همه"],
    ["not_sent", "ارسال‌نشده"],
    ["sent", "در انتظار پاسخ"],
    ["submitted", "پاسخ‌داده‌شده"],
  ] as const;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {options.map(([key, label]) => {
          const params = new URLSearchParams({ tab: "feedback", feedbackStatus: key });
          if (filters.query) params.set("query", filters.query);
          return (
            <Link key={key} href={`/admin?${params}`} className={`rounded-full px-4 py-2 text-xs font-bold ${filters.status === key ? "bg-[#111827] text-white" : "border border-[#E6EAF2] bg-white text-[#475467]"}`}>
              {label}
            </Link>
          );
        })}
      </div>
      <form action="/admin" method="get" className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input type="hidden" name="tab" value="feedback" />
        {filters.status !== "all" ? <input type="hidden" name="feedbackStatus" value={filters.status} /> : null}
        <input name="query" type="search" defaultValue={filters.query ?? ""} placeholder="جستجو با نام، موبایل، ایمیل یا شماره سفارش" />
        <button className="btn-outline" type="submit">جستجو</button>
      </form>
    </div>
  );
}

function paginationLink(filters: FeedbackTabData["filters"], page: number, totalPages: number, label: string) {
  if (page < 1 || page > totalPages) return <span className="opacity-40">{label}</span>;
  const params = new URLSearchParams({ tab: "feedback", page: String(page) });
  if (filters.status !== "all") params.set("feedbackStatus", filters.status);
  if (filters.query) params.set("query", filters.query);
  return <Link href={`/admin?${params}`} className="btn-outline min-h-9 px-4 py-2 text-xs">{label}</Link>;
}
