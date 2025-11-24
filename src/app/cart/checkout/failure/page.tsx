import Link from "next/link";

type FailurePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const reasons: Record<string, string> = {
  cancelled: "پرداخت توسط کاربر لغو شد.",
  verify: "تایید تراکنش با مشکل مواجه شد. لطفاً دوباره تلاش کنید.",
  missing: "اطلاعات لازم برای تایید پرداخت ارسال نشد.",
  "not-found": "سفارش مربوطه پیدا نشد.",
};

export default async function CheckoutFailurePage({ searchParams }: FailurePageProps) {
  const params = await searchParams;
  const reasonKey = typeof params?.reason === "string" ? params.reason : "cancelled";
  const message = reasons[reasonKey] ?? "پرداخت کامل نشد.";

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="rounded-3xl border border-red-200 bg-white p-10 shadow-lg shadow-red-100/40">
          <h1 className="text-3xl font-semibold text-slate-900">پرداخت ناموفق بود</h1>
          <p className="mt-4 text-sm text-slate-600">{message}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
            <Link
              href="/cart/checkout"
              className="rounded-full bg-sky-500 px-5 py-2 text-white transition hover:bg-sky-600"
            >
              تلاش مجدد
            </Link>
            <Link
              href="/support"
              className="rounded-full border border-slate-300 px-5 py-2 text-slate-700 transition hover:border-slate-400"
            >
              تماس با پشتیبانی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
