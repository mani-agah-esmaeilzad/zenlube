import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { LOGO_SRC } from "@/components/layout/logo-mark";
import { getAllCategoriesLite } from "@/lib/data";

const trustItems = ["ضمانت اصالت کالا", "ارسال سریع", "پرداخت امن", "پشتیبانی تخصصی", "مشاوره واقعی"];

const baseFooterGroups = [
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
];

export async function SiteFooter() {
  const categories = await getAllCategoriesLite().catch(() => []);
  const footerGroups = [
    ...baseFooterGroups,
    ...(categories.length
      ? [
          {
            title: "دسته‌بندی‌ها",
            links: categories.slice(0, 6).map((category) => [category.name, `/categories/${category.slug}`] as [string, string]),
          },
        ]
      : []),
  ];

  return (
    <footer className="mt-14 border-t border-[#E7E8EE] bg-white">
      <div className="container-zen grid grid-cols-2 gap-3 py-5 md:grid-cols-5">
        {trustItems.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-[22px] border border-[#E7E8EE] bg-[#F7F8FA] p-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#16A34A]">
              <CheckIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold text-[#344054] md:text-sm">{item}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E7E8EE]">
        <div className="container-zen grid gap-8 py-10 lg:grid-cols-[1.15fr_2fr_1fr]">
          <div>
            <Link className="inline-flex items-center" href="/">
              <Image alt="لوگوی Oilbar" className="h-auto w-[148px]" height={50} src={LOGO_SRC} unoptimized width={210} />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-8 text-[#667085]">
              Oilbar برای خرید مطمئن روغن موتور، فیلتر و روانکار خودرو ساخته شده است؛ با تمرکز روی اصالت کالا، انتخاب فنی
              دقیق و تجربه خرید سریع.
            </p>
            <div className="mt-5 space-y-2 text-sm font-medium text-[#344054]">
              <p>پشتیبانی: 09190810910</p>
              <p>ایمیل: support@oilbar.ir</p>
              <p>البرز، کرج، عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی، اتوسرویس مانی</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-bold text-[#171B23]">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-[#667085]">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link className="transition hover:text-[#D97706]" href={href}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#171B23]">خبرنامه و اعتماد</h3>
            <p className="mt-3 text-sm leading-7 text-[#667085]">پیشنهادهای ویژه و راهنماهای انتخاب روغن را دریافت کنید.</p>
            <form className="mt-4 flex overflow-hidden rounded-[18px] border border-[#E7E8EE] bg-white p-1">
              <input aria-label="ایمیل خبرنامه" className="min-w-0 flex-1 px-3 text-sm text-[#1F2937] outline-none" placeholder="ایمیل شما" />
              <button className="rounded-[14px] bg-[#F59E0B] px-4 text-xs font-bold text-white">عضویت</button>
            </form>
            <div className="mt-5 flex gap-3">
              <Link
                aria-label="نماد اعتماد الکترونیکی"
                className="flex h-24 w-24 items-center justify-center rounded-[20px] border border-[#E7E8EE] bg-[#F7F8FA] p-3"
                href="#"
              >
                <Image alt="محل قرارگیری نماد اعتماد" className="h-full w-full object-contain" height={80} src="/enamad-placeholder.svg" width={80} />
              </Link>
              <div className="flex h-24 w-24 items-center justify-center rounded-[20px] border border-[#E7E8EE] bg-[#F7F8FA] text-center text-xs font-bold text-[#667085]">
                نشان ملی ثبت
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E7E8EE] py-4 text-center text-xs text-[#667085]">© {new Date().getFullYear()} Oilbar - همه حقوق محفوظ است.</div>
    </footer>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
