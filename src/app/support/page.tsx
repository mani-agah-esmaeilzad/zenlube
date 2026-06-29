export default function SupportPage() {
  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <section className="rounded-[32px] bg-[#171B23] p-6 text-white shadow-[0_20px_50px_rgba(17,24,39,0.16)] md:p-8">
        <p className="text-sm font-bold text-[#F5C56B]">همراه شما در خرید</p>
        <h1 className="mt-3 text-3xl font-black">پشتیبانی Oilbar</h1>
        <p className="mt-3 max-w-4xl text-sm leading-8 text-white/72">
          برای پیگیری سفارش، سوالات فنی درباره محصولات یا دریافت مشاوره مناسب‌ترین روغن موتور برای خودرو، با تیم پشتیبانی در ارتباط باشید.
        </p>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[28px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
          <p className="text-sm font-bold text-[#667085]">شماره تماس</p>
          <p className="mt-3 text-xl font-black text-[#171B23]">09190810910</p>
          <p className="mt-2 text-sm leading-7 text-[#667085]">پاسخ‌گویی هر روز از ساعت ۹ تا ۱۸</p>
        </div>
        <div className="rounded-[28px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
          <p className="text-sm font-bold text-[#667085]">ایمیل</p>
          <p className="mt-3 text-xl font-black text-[#171B23]">support@oilbar.ir</p>
          <p className="mt-2 text-sm leading-7 text-[#667085]">برای درخواست‌های فنی و پیگیری سفارش</p>
        </div>
        <div className="rounded-[28px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
          <p className="text-sm font-bold text-[#667085]">آدرس</p>
          <p className="mt-3 text-sm font-bold leading-8 text-[#171B23]">البرز، کرج، عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی، اتوسرویس مانی</p>
        </div>
      </section>
      <section className="rounded-[28px] border border-[#E7E8EE] bg-white p-6 text-sm leading-8 text-[#667085] shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
        <p>
          تیم پشتیبانی ما هر روز از ساعت ۹ الی ۱۸ پاسخ‌گو است. همچنین می‌توانید از طریق حساب کاربری، وضعیت سفارش‌ها را بررسی کنید و برای نیازهای تخصصی روغن موتور و فیلتر مشاوره بگیرید.
        </p>
      </section>
    </div>
  );
}
