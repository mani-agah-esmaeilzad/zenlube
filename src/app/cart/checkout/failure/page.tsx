import Link from "next/link";

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

  return (
    <div className="container-zen py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#FDE7B0] bg-white p-6 text-center shadow-sm md:p-8">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#FFF8E8] text-3xl font-black text-[#D97706]">!</div>
        <h1 className="mt-5 text-2xl font-extrabold text-[#111827] md:text-3xl">پرداخت ناموفق بود</h1>
        <p className="mt-3 text-sm leading-7 text-[#6B7280]">{message}</p>
        {orderId ? <p className="mt-2 font-mono text-xs text-[#6B7280]">#{orderId.slice(0, 10).toUpperCase()}</p> : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/cart/checkout" className="btn-primary">
            تلاش دوباره برای پرداخت
          </Link>
          <Link href="/support" className="btn-outline">
            تماس با پشتیبانی
          </Link>
        </div>
      </div>
    </div>
  );
}
