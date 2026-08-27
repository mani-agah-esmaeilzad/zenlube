import Link from "next/link";

import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";

export default function PolicyPage() {
  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <StorefrontPageIntro
        compact
        description="نحوهٔ نگهداری و استفاده از اطلاعاتی که برای ثبت حساب و پردازش سفارش وارد می‌کنید."
        title="سیاست حریم خصوصی Oilbar"
      />
      <article className="mx-auto max-w-4xl border-r-2 border-primary-accent-strong pr-4 text-sm leading-8 text-text-muted sm:pr-6 sm:text-base sm:leading-9">
        <h2 className="text-lg font-extrabold text-text-strong">اطلاعات مورد استفاده</h2>
        <p className="mt-3">
          داده‌های کاربران صرفاً برای پردازش سفارش و پیشنهاد محصولات نگهداری می‌شود. اطلاعات حساس مانند رمز عبور با الگوریتم‌های امن رمزنگاری ذخیره می‌شود و هیچ‌گاه در اختیار اشخاص ثالث قرار نمی‌گیرد.
        </p>
        <h2 className="mt-7 text-lg font-extrabold text-text-strong">درخواست دربارهٔ داده‌ها</h2>
        <p className="mt-3">
          در صورت تمایل به حذف حساب کاربری یا مشاهدهٔ سوابق ذخیره‌شده، از طریق صفحهٔ پشتیبانی با ما در ارتباط باشید.
        </p>
        <Link className="mt-5 inline-flex text-sm font-extrabold text-primary-accent-strong" href="/support">ارتباط با پشتیبانی</Link>
      </article>
    </div>
  );
}
