export default function TermsPage() {
  return (
    <div className="container-zen space-y-5 py-5 sm:space-y-6 sm:py-6 md:py-8">
      <section className="rounded-2xl border border-border bg-white p-4 sm:p-6 md:p-8">
        <span className="chip-zen inline-flex">شفاف و کوتاه</span>
        <h1 className="mt-3 text-2xl font-black text-text-strong sm:text-3xl">قوانین و شرایط استفاده</h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-text-muted">
          این صفحه خلاصه قواعد استفاده از خدمات Oilbar را توضیح می‌دهد تا خرید، پرداخت و پیگیری سفارش بدون ابهام انجام شود.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface-secondary p-4 text-sm leading-8 text-text-muted sm:p-6 md:p-8">
        <p>
          استفاده از خدمات Oilbar به معنای پذیرش قوانین زیر است: صحت اطلاعات وارد شده، عدم استفاده از محتوای سایت بدون ذکر منبع و رعایت قوانین مرتبط با پرداخت و تحویل سفارش.
        </p>
        <p className="mt-4">
          Oilbar حق ویرایش یا به‌روزرسانی این قوانین را دارد. تغییرات جدید از طریق صفحه اخبار و ایمیل به کاربران اطلاع‌رسانی خواهد شد.
        </p>
      </section>
    </div>
  );
}
