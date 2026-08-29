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
    <div className="container-zen py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-2xl border-y border-border py-7 text-center sm:py-9">
        <div className="mx-auto grid size-12 place-items-center text-2xl font-black text-[#D97706] sm:text-3xl">
          !
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-text-strong md:text-3xl">نمایش این صفحه با خطا مواجه شد</h1>
        <p className="mt-3 text-sm leading-7 text-text-muted">
          لطفاً یک بار دیگر تلاش کنید. اگر مشکل ادامه داشت از مسیرهای اصلی فروشگاه استفاده کنید.
        </p>
        {error.message ? (
          <p className="mt-4 border-t border-border bg-surface-secondary px-4 py-3 text-xs leading-6 text-text-muted">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button className="btn-primary" onClick={() => reset()} type="button">
            تلاش دوباره
          </button>
          <Link className="text-link-zen inline-flex min-h-11 items-center px-2 text-xs font-bold" href="/products">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}
