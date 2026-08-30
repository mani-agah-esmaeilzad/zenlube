import Link from "next/link";

import prisma from "@/lib/prisma";
import { StatusPill } from "@/components/ui/status-pill";

type FailurePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const reasons: Record<string, string> = {
  cancelled: "پرداخت توسط کاربر لغو شد.",
  verify: "تایید تراکنش با مشکل مواجه شد. لطفا دوباره تلاش کنید.",
  missing: "اطلاعات لازم برای تایید پرداخت ارسال نشد.",
  "not-found": "سفارش مربوطه پیدا نشد.",
};

export default async function CheckoutFailurePage({ searchParams }: FailurePageProps) {
  const params = await searchParams;
  const reasonKey = typeof params?.reason === "string" ? params.reason : "cancelled";
  const orderId = typeof params?.orderId === "string" ? params.orderId : null;
  const message = reasons[reasonKey] ?? "پرداخت کامل نشد.";
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { paymentTransactions: { orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : null;
  const latestTransaction = order?.paymentTransactions[0] ?? null;

  return (
    <div className="container-zen py-8 sm:py-10">
      <div className="mx-auto max-w-2xl bg-white py-6 text-center sm:py-8">
        <div className="mx-auto grid size-11 place-items-center text-2xl font-black text-[#D97706]">!</div>
        <h1 className="mt-4 text-xl font-extrabold text-text-strong sm:text-2xl">پرداخت ناموفق بود</h1>
        <p className="mt-3 text-sm leading-7 text-text-muted">{message}</p>
        {orderId ? <p className="mt-2 font-mono text-xs text-text-muted">#{orderId.slice(0, 10).toUpperCase()}</p> : null}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <StatusPill tone="warning">پرداخت کامل نشد</StatusPill>
          {latestTransaction?.status ? <StatusPill tone="neutral">{latestTransaction.status}</StatusPill> : null}
        </div>
        {latestTransaction?.errorMessage ? (
          <p className="mx-auto mt-4 max-w-lg border-r-2 border-amber-400 px-3 py-2 text-right text-xs leading-6 text-text-muted">
            {latestTransaction.errorMessage}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8">
          <Link href="/cart/checkout" className="btn-primary !min-h-11 px-4 text-xs">
            تلاش دوباره برای پرداخت
          </Link>
          <Link href={orderId ? `/account?orderId=${orderId}` : "/cart"} className="btn-ghost !min-h-11 px-3 text-xs">
            {orderId ? "مشاهده سفارش" : "بازگشت به سبد خرید"}
          </Link>
        </div>
      </div>
    </div>
  );
}
