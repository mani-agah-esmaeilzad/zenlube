"use client";

import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-zen py-12 md:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 text-center md:p-8">
        <div className="icon-shell mx-auto grid size-16 place-items-center rounded-full text-3xl font-black text-[#D97706]">
          !
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-text-strong md:text-3xl">نمایش این صفحه با خطا مواجه شد</h1>
        <p className="mt-3 text-sm leading-7 text-text-muted">
          لطفاً یک بار دیگر تلاش کنید. اگر مشکل ادامه داشت از مسیرهای اصلی فروشگاه استفاده کنید.
        </p>
        {error.message ? (
          <p className="mt-3 rounded-2xl bg-[linear-gradient(180deg,#FFFFFF_0%,#F7F8FA_100%)] px-4 py-3 text-xs leading-6 text-text-muted">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button className="btn-primary" onClick={() => reset()} type="button">
            تلاش دوباره
          </button>
          <Link className="btn-outline" href="/products">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}
