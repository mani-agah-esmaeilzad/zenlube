import Link from "next/link";

import prisma from "@/lib/prisma";
import { StatusPill } from "@/components/ui/status-pill";
import { retryOrderPaymentAction } from "@/actions/orders";
import { getAppSession } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

type FailurePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const reasons: Record<string, string> = {
  cancelled: "پرداخت توسط کاربر لغو شد.",
  verify: "تایید تراکنش با مشکل مواجه شد. لطفا دوباره تلاش کنید.",
  missing: "اطلاعات لازم برای تایید پرداخت ارسال نشد.",
  "not-found": "سفارش مربوطه پیدا نشد.",
  request: "اتصال به درگاه انجام نشد؛ سفارش و روش ارسال شما محفوظ مانده است.",
  "shipping-refreshed": "اعتبار نرخ قبلی تمام شده بود. هزینه ارسال دوباره استعلام شد؛ مبلغ به‌روز را بررسی و سپس پرداخت را تأیید کنید.",
  "shipping-unavailable": "روش ارسال قبلی دیگر برای این آدرس در دسترس نیست. برای انتخاب روش جدید به تسویه‌حساب برگردید.",
  "cart-changed": "محتوا یا قیمت سبد خرید تغییر کرده است. برای بررسی مبلغ و روش ارسال جدید به تسویه‌حساب برگردید.",
  "payment-active": "یک درخواست پرداخت برای این سفارش هنوز فعال است. برای جلوگیری از پرداخت دوباره، هزینه سفارش تا پایان آن درخواست تغییر نکرد.",
  amount: "مبلغ درخواست پرداخت با مبلغ فعلی سفارش یکسان نیست؛ برای جلوگیری از برداشت اشتباه، پرداخت تأیید نشد.",
};

export default async function CheckoutFailurePage({ searchParams }: FailurePageProps) {
  const params = await searchParams;
  const reasonKey = typeof params?.reason === "string" ? params.reason : "cancelled";
  const orderId = typeof params?.orderId === "string" ? params.orderId : null;
  const session = await getAppSession();
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;
  const message = reasons[reasonKey] ?? "پرداخت کامل نشد.";
  const order = orderId && userId
    ? await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { paymentTransactions: { orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : null;
  const latestTransaction = order?.paymentTransactions[0] ?? null;
  const needsCheckout = ["shipping-unavailable", "cart-changed"].includes(reasonKey);
  const paymentIsActive = reasonKey === "payment-active";

  return (
    <div className="container-zen py-8 sm:py-10">
      <div className="mx-auto max-w-2xl bg-white py-6 text-center sm:py-8">
        <div className="mx-auto grid size-11 place-items-center text-2xl font-black text-[#D97706]">!</div>
        <h1 className="mt-4 text-xl font-extrabold text-text-strong sm:text-2xl">پرداخت ناموفق بود</h1>
        <p className="mt-3 text-sm leading-7 text-text-muted">{message}</p>
        {order ? <p className="mt-2 font-mono text-xs text-text-muted">#{order.id.slice(0, 10).toUpperCase()}</p> : null}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <StatusPill tone="warning">پرداخت کامل نشد</StatusPill>
          {latestTransaction?.status ? <StatusPill tone="neutral">{latestTransaction.status}</StatusPill> : null}
        </div>
        {latestTransaction?.errorMessage ? (
          <p className="mx-auto mt-4 max-w-lg border-r-2 border-amber-400 px-3 py-2 text-right text-xs leading-6 text-text-muted">
            {latestTransaction.errorMessage}
          </p>
        ) : null}
        {order?.status === "PENDING" ? (
          <div className="mx-auto mt-5 max-w-md divide-y divide-border border-y border-border text-xs">
            <div className="flex items-center justify-between gap-4 py-3 text-right">
              <span className="text-text-muted">روش ارسال</span>
              <span className="font-bold text-text-strong">{order.shippingServiceLabel ?? order.shippingCarrierLabel ?? "ثبت نشده"}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3 text-right">
              <span className="text-text-muted">هزینه ارسال</span>
              <span className="font-bold text-text-strong">{formatPrice(Number(order.shippingCost))}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3 text-right">
              <span className="text-text-muted">مبلغ قابل پرداخت</span>
              <span className="font-black text-text-strong">{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8">
          {order?.status === "PENDING" && !needsCheckout && !paymentIsActive ? (
            <form action={retryOrderPaymentAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className="btn-primary !min-h-11 px-4 text-xs">
                {reasonKey === "shipping-refreshed" ? "تأیید مبلغ و پرداخت" : "تلاش دوباره برای پرداخت"}
              </button>
            </form>
          ) : (
            <Link
              href={paymentIsActive && order ? `/account?orderId=${order.id}#order-detail` : "/cart/checkout"}
              className="btn-primary !min-h-11 px-4 text-xs"
            >
              {paymentIsActive ? "مشاهده سفارش" : "بازگشت به تسویه‌حساب"}
            </Link>
          )}
          <Link href={order ? `/account?orderId=${order.id}` : "/cart"} className="btn-ghost !min-h-11 px-3 text-xs">
            {order ? "مشاهده سفارش" : "بازگشت به سبد خرید"}
          </Link>
        </div>
      </div>
    </div>
  );
}
