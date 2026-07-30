export default function SupportPage() {
  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <section className="panel-zen-dark rounded-[32px] p-6 md:p-8">
        <p className="text-sm font-bold text-primary-accent">همراه شما در خرید</p>
        <h1 className="mt-3 text-3xl font-black">پشتیبانی Oilbar</h1>
        <p className="mt-3 max-w-4xl text-sm leading-8 text-white/72">
          برای پیگیری سفارش، سوالات فنی درباره محصولات یا دریافت مشاوره مناسب‌ترین روغن موتور برای خودرو، با تیم پشتیبانی در ارتباط باشید.
        </p>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="panel-zen rounded-[28px] p-6">
          <p className="text-sm font-bold text-text-muted">شماره تماس</p>
          <p className="mt-3 text-xl font-black text-text-strong">09190810910</p>
          <p className="mt-2 text-sm leading-7 text-text-muted">پاسخ‌گویی هر روز از ساعت ۹ تا ۱۸</p>
        </div>
        <div className="panel-zen rounded-[28px] p-6">
          <p className="text-sm font-bold text-text-muted">ایمیل</p>
          <p className="mt-3 text-xl font-black text-text-strong">support@oilbar.ir</p>
          <p className="mt-2 text-sm leading-7 text-text-muted">برای درخواست‌های فنی و پیگیری سفارش</p>
        </div>
        <div className="panel-zen rounded-[28px] p-6">
          <p className="text-sm font-bold text-text-muted">آدرس</p>
          <p className="mt-3 text-sm font-bold leading-8 text-text-strong">البرز، کرج، عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی، اتوسرویس مانی</p>
        </div>
      </section>
      <section className="panel-zen rounded-[28px] p-6 text-sm leading-8 text-text-muted">
        <p>
          تیم پشتیبانی ما هر روز از ساعت ۹ الی ۱۸ پاسخ‌گو است. همچنین می‌توانید از طریق حساب کاربری، وضعیت سفارش‌ها را بررسی کنید و برای نیازهای تخصصی روغن موتور و فیلتر مشاوره بگیرید.
        </p>
      </section>
    </div>
  );
}
