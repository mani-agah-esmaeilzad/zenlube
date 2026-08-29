import Link from "next/link";

import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";

export default function TermsPage() {
  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <StorefrontPageIntro
        compact
        description="خلاصهٔ قواعد استفاده از خدمات Oilbar برای خرید، پرداخت و پیگیری سفارش."
        title="قوانین و شرایط استفاده"
        tone="plain"
      />

      <article className="mx-auto max-w-4xl border-r-2 border-primary-accent-strong pr-4 text-sm leading-8 text-text-muted sm:pr-6 sm:text-base sm:leading-9">
        <h2 className="text-lg font-extrabold text-text-strong">استفاده از خدمات</h2>
        <p className="mt-3">
          استفاده از خدمات Oilbar به معنای پذیرش قوانین زیر است: صحت اطلاعات وارد شده، عدم استفاده از محتوای سایت بدون ذکر منبع و رعایت قوانین مرتبط با پرداخت و تحویل سفارش.
        </p>
        <h2 className="mt-7 text-lg font-extrabold text-text-strong">به‌روزرسانی شرایط</h2>
        <p className="mt-3">
          Oilbar حق ویرایش یا به‌روزرسانی این قوانین را دارد. تغییرات جدید از طریق صفحه اخبار و ایمیل به کاربران اطلاع‌رسانی خواهد شد.
        </p>
        <Link className="mt-4 inline-flex min-h-11 items-center text-sm font-extrabold text-primary-accent-strong transition hover:text-[#B45309]" href="/support">
          پرسش از پشتیبانی
        </Link>
      </article>
    </div>
  );
}
