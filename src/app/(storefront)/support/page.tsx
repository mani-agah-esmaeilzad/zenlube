import Link from "next/link";

import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";

export default function SupportPage() {
  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <StorefrontPageIntro
        actions={(
          <>
            <a className="btn-primary w-full lg:w-auto" href="tel:09190810910">تماس با پشتیبانی</a>
            <a className="btn-outline w-full !border-white/20 !bg-white/10 !text-white lg:w-auto" href="mailto:support@oilbar.ir">ارسال ایمیل</a>
          </>
        )}
        description="برای پیگیری سفارش، سؤال فنی دربارهٔ محصولات یا مشاورهٔ انتخاب روغن با تیم پشتیبانی در ارتباط باشید."
        meta="پاسخ‌گویی هر روز از ساعت ۹ تا ۱۸"
        title="پشتیبانی Oilbar"
        tone="dark"
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-white">
        <ContactRow href="tel:09190810910" label="شماره تماس" value="09190810910" helper="پاسخ‌گویی تلفنی و مشاورهٔ خرید" />
        <ContactRow href="mailto:support@oilbar.ir" label="ایمیل" value="support@oilbar.ir" helper="درخواست فنی و پیگیری سفارش" ltr />
        <ContactRow label="آدرس" value="البرز، کرج، عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی، اتوسرویس مانی" helper="مراجعهٔ حضوری در ساعات پاسخ‌گویی" />
      </section>

      <section className="grid gap-4 border-t border-border pt-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-extrabold text-text-strong">پیگیری سفارش</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">وضعیت سفارش، پرداخت و ارسال را از حساب کاربری ببینید.</p>
          <Link className="mt-3 inline-flex text-sm font-extrabold text-primary-accent-strong" href="/account">رفتن به حساب کاربری</Link>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-strong">مشاورهٔ فنی</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">نام خودرو، سال ساخت و نوع موتور را آماده کنید تا انتخاب دقیق‌تری دریافت کنید.</p>
          <Link className="mt-3 inline-flex text-sm font-extrabold text-primary-accent-strong" href="/cars">مشاهده دفترچه خودروها</Link>
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
    <div className="grid gap-2 border-b border-border p-4 last:border-b-0 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-5 sm:p-5">
      <p className="text-xs font-bold text-text-muted">{label}</p>
      <div className="min-w-0">
        {href ? <a className="transition hover:text-primary-accent-strong" href={href}>{valueNode}</a> : valueNode}
        <p className="mt-1 text-xs leading-6 text-text-muted">{helper}</p>
      </div>
    </div>
  );
}
