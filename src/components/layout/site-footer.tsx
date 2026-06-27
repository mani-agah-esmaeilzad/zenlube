import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";

const trustItems = [
  "ضمانت اصالت کالا",
  "ارسال سریع",
  "پرداخت امن",
  "پشتیبانی تخصصی",
  "مشاوره واقعی",
];

const footerGroups = [
  {
    title: "درباره فروشگاه",
    links: [
      ["درباره Oilbar", "/support"],
      ["تماس با ما", "/support"],
      ["وبلاگ و راهنما", "/blog"],
      ["برندهای همکار", "/brands"],
    ],
  },
  {
    title: "خدمات مشتریان",
    links: [
      ["پیگیری سفارش", "/account"],
      ["حساب کاربری", "/account"],
      ["قوانین و مقررات", "/terms"],
      ["حریم خصوصی", "/policy"],
    ],
  },
  {
    title: "راهنمای خرید",
    links: [
      ["انتخاب روغن مناسب", "/cars"],
      ["مقایسه محصولات", "/products/compare"],
      ["سوالات متداول", "/support"],
      ["راهنمای تعویض روغن", "/blog"],
    ],
  },
  {
    title: "دسته‌بندی‌ها",
    links: [
      ["روغن موتور", "/products?category=engine-oil"],
      ["فیلتر روغن", "/products?search=فیلتر روغن"],
      ["فیلتر هوا", "/products?search=فیلتر هوا"],
      ["ضدیخ", "/products?search=ضدیخ"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[#E5E7EB] bg-white">
      <div className="container-zen grid grid-cols-2 gap-3 py-5 md:grid-cols-5">
        {trustItems.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] p-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#16A34A]">
              <CheckIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold text-[#374151] md:text-sm">{item}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E5E7EB]">
        <div className="container-zen grid gap-8 py-10 lg:grid-cols-[1.15fr_2fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#111827] text-lg font-black text-white">O</span>
              <span>
                <span className="block text-2xl font-extrabold text-[#111827]">Oilbar</span>
                <span className="block text-xs font-medium text-[#6B7280]">اویل‌بار، مرجع تخصصی روغن موتور و لوازم مصرفی خودرو</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-8 text-[#6B7280]">
              Oilbar برای خرید مطمئن روغن موتور، فیلتر و روانکار خودرو ساخته شده است؛ با تمرکز روی اصالت کالا، انتخاب فنی دقیق و تجربه خرید سریع.
            </p>
            <div className="mt-5 space-y-2 text-sm font-medium text-[#374151]">
              <p>پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</p>
              <p>ایمیل: support@oilbar.ir</p>
              <p>تهران، مرکز پردازش سفارش Oilbar</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-bold text-[#111827]">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-[#6B7280]">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="transition hover:text-red-600">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#111827]">خبرنامه و اعتماد</h3>
            <p className="mt-3 text-sm leading-7 text-[#6B7280]">پیشنهادهای ویژه و راهنماهای انتخاب روغن را دریافت کنید.</p>
            <form className="mt-4 flex overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-1">
              <input aria-label="ایمیل خبرنامه" placeholder="ایمیل شما" className="min-w-0 flex-1 px-3 text-sm text-[#1F2937] outline-none" />
              <button className="rounded-xl bg-[#EF394E] px-4 text-xs font-bold text-white">عضویت</button>
            </form>
            <div className="mt-5 flex gap-3">
              <Link href="#" className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] p-3" aria-label="نماد اعتماد الکترونیکی">
                <Image src="/enamad-placeholder.svg" alt="محل قرارگیری نماد اعتماد" width={80} height={80} className="h-full w-full object-contain" />
              </Link>
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] text-center text-xs font-bold text-[#6B7280]">
                نشان ملی ثبت
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] py-4 text-center text-xs text-[#6B7280]">
        © {new Date().getFullYear()} Oilbar - همه حقوق محفوظ است.
      </div>
    </footer>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
