import Link from "next/link";

import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";

export default function SupportPage() {
  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <StorefrontPageIntro
        actions={(
          <>
            <a className="btn-primary w-fit px-4" href="tel:09190810910">تماس با پشتیبانی</a>
            <a className="inline-flex min-h-11 items-center text-sm font-extrabold text-white/75 transition hover:text-white" href="mailto:support@oilbar.ir">ارسال ایمیل</a>
          </>
        )}
        description="برای پیگیری سفارش، سؤال فنی دربارهٔ محصولات یا مشاورهٔ انتخاب روغن با تیم پشتیبانی در ارتباط باشید."
        meta="پاسخ‌گویی هر روز از ساعت ۹ تا ۱۸"
        title="پشتیبانی Oilbar"
        tone="dark"
      />

      <section className="divide-y divide-border border-y border-border">
        <ContactRow href="tel:09190810910" label="شماره تماس" value="09190810910" helper="پاسخ‌گویی تلفنی و مشاورهٔ خرید" />
        <ContactRow href="mailto:support@oilbar.ir" label="ایمیل" value="support@oilbar.ir" helper="درخواست فنی و پیگیری سفارش" ltr />
        <ContactRow label="آدرس" value="البرز، کرج، عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی، اتوسرویس مانی" helper="مراجعهٔ حضوری در ساعات پاسخ‌گویی" />
      </section>

      <section className="grid gap-4 border-t border-border pt-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-extrabold text-text-strong">پیگیری سفارش</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">وضعیت سفارش، پرداخت و ارسال را از حساب کاربری ببینید.</p>
          <Link className="mt-2 inline-flex min-h-11 items-center px-1 text-sm font-extrabold text-primary-accent-strong md:min-h-8" href="/account">رفتن به حساب کاربری</Link>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-strong">مشاورهٔ فنی</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">نام خودرو، سال ساخت و نوع موتور را آماده کنید تا انتخاب دقیق‌تری دریافت کنید.</p>
          <Link className="mt-2 inline-flex min-h-11 items-center px-1 text-sm font-extrabold text-primary-accent-strong md:min-h-8" href="/cars">مشاهده دفترچه خودروها</Link>
        </div>
      </section>
    </div>
  );
}

function ContactRow({
  label,
  value,
  helper,
  href,
  ltr = false,
}: {
  label: string;
  value: string;
  helper: string;
  href?: string;
  ltr?: boolean;
}) {
  const valueNode = (
    <span className="break-words text-sm font-extrabold leading-7 text-text-strong sm:text-base" dir={ltr ? "ltr" : undefined}>
      {value}
    </span>
  );

  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-5 sm:py-5">
      <p className="text-xs font-bold text-text-muted">{label}</p>
      <div className="min-w-0">
        {href ? <a className="inline-flex min-h-11 max-w-full items-center transition hover:text-primary-accent-strong md:min-h-8" href={href}>{valueNode}</a> : valueNode}
        <p className="mt-1 text-xs leading-6 text-text-muted">{helper}</p>
      </div>
    </div>
  );
}
