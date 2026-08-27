export default function SupportPage() {
  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <section>
        <h1 className="t-h1">پشتیبانی Oilbar</h1>
        <p className="mt-3 max-w-4xl text-sm leading-8 text-text-muted">
          برای پیگیری سفارش، سوالات فنی درباره محصولات یا دریافت مشاوره انتخاب روغن، با تیم پشتیبانی در ارتباط باشید.
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
          <p className="text-sm font-bold text-text-muted">شماره تماس</p>
          <p className="mt-3 text-xl font-black text-text-strong">09190810910</p>
          <p className="mt-2 text-sm leading-7 text-text-muted">پاسخ‌گویی هر روز از ساعت ۹ تا ۱۸</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
          <p className="text-sm font-bold text-text-muted">ایمیل</p>
          <p dir="ltr" className="mt-3 break-all text-left text-lg font-black text-text-strong sm:text-xl">support@oilbar.ir</p>
          <p className="mt-2 text-sm leading-7 text-text-muted">برای درخواست‌های فنی و پیگیری سفارش</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 sm:col-span-2 sm:p-6 lg:col-span-1">
          <p className="text-sm font-bold text-text-muted">آدرس</p>
          <p className="mt-3 text-sm font-bold leading-8 text-text-strong">البرز، کرج، عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی، اتوسرویس مانی</p>
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-surface-secondary p-4 text-sm leading-8 text-text-muted sm:p-6">
        <p>
          تیم پشتیبانی ما هر روز از ساعت ۹ الی ۱۸ پاسخ‌گو است. همچنین می‌توانید از طریق حساب کاربری، وضعیت سفارش‌ها را بررسی کنید و برای نیازهای تخصصی روغن موتور و فیلتر مشاوره بگیرید.
        </p>
      </section>
    </div>
  );
}
