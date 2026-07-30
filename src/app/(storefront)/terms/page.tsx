export default function TermsPage() {
  return (
    <div className="container-zen space-y-6 py-6 md:py-8">
      <section className="panel-zen rounded-[32px] p-6 md:p-8">
        <span className="chip-zen inline-flex">شفاف و کوتاه</span>
        <h1 className="mt-3 text-3xl font-black text-text-strong">قوانین و شرایط استفاده</h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-text-muted">
          این صفحه خلاصه قواعد استفاده از خدمات Oilbar را توضیح می‌دهد تا خرید، پرداخت و پیگیری سفارش بدون ابهام انجام شود.
        </p>
      </section>

      <section className="panel-zen rounded-[30px] p-6 text-sm leading-8 text-text-muted md:p-8">
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
