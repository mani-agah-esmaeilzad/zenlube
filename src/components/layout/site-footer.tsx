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
    <footer className="mt-16">
      <div className="container-zen section-band">
        <div className="grid grid-cols-1 gap-3 rounded-[32px] border border-border bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFCFE_100%)] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {trustItems.map((item) => (
            <div key={item} className="panel-zen-muted flex items-center gap-3 rounded-[22px] p-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#16A34A] shadow-[0_10px_20px_rgba(22,163,74,0.08)]">
              <CheckIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold text-[#344054] md:text-sm">{item}</span>
          </div>
        ))}
        </div>
      </div>

      <div className="border-t border-white/8 bg-[linear-gradient(180deg,#171B23_0%,#202734_100%)] text-white">
        <div className="container-zen grid gap-8 py-8 lg:grid-cols-[1.15fr_2fr_1fr] lg:py-10">
          <div>
            <Link className="inline-flex items-center" href="/">
              <Image alt="لوگوی Oilbar" className="h-auto w-[148px]" height={50} src={LOGO_SRC} unoptimized width={210} />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-8 text-white/72">
              Oilbar برای خرید مطمئن روغن موتور، فیلتر و روانکار خودرو ساخته شده است؛ با تمرکز روی اصالت کالا، انتخاب فنی
              دقیق و تجربه خرید سریع.
            </p>
            <div className="mt-5 space-y-2 text-sm font-medium text-white/82">
              <p>پشتیبانی: 09190810910</p>
              <p>ایمیل: support@oilbar.ir</p>
              <p>البرز، کرج، عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی، اتوسرویس مانی</p>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {footerGroups.map((group) => (
              <details key={group.title} className="group rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-white">
                  {group.title}
                  <ChevronIcon className="h-4 w-4 text-white/55 transition group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-3 text-sm text-white/70">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link className="transition hover:text-[#F5C56B]" href={href}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="hidden gap-6 sm:grid-cols-2 lg:grid lg:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-bold text-white">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link className="transition hover:text-[#F5C56B]" href={href}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">خبرنامه و اعتماد</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">پیشنهادهای ویژه و راهنماهای انتخاب روغن را دریافت کنید.</p>
            <form className="mt-4 flex flex-col gap-2 rounded-[20px] border border-white/10 bg-white/6 p-2 sm:flex-row sm:items-center">
              <input aria-label="ایمیل خبرنامه" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/38" placeholder="ایمیل شما" />
              <button className="btn-primary !min-h-[44px] rounded-[14px] px-4 py-3 text-xs font-bold text-white">عضویت</button>
            </form>
            <div className="mt-5 flex gap-3">
              <Link
                aria-label="نماد اعتماد الکترونیکی"
                className="flex h-20 w-20 items-center justify-center rounded-[20px] border border-white/10 bg-white/6 p-3 sm:h-24 sm:w-24"
                href="#"
              >
                <Image alt="محل قرارگیری نماد اعتماد" className="h-full w-full object-contain" height={80} src="/enamad-placeholder.svg" width={80} />
              </Link>
              <div className="flex h-20 w-20 items-center justify-center rounded-[20px] border border-white/10 bg-white/6 text-center text-xs font-bold text-white/72 sm:h-24 sm:w-24">
                نشان ملی ثبت
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 bg-[#171B23] py-4 text-center text-xs text-white/48">© {new Date().getFullYear()} Oilbar - همه حقوق محفوظ است.</div>
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

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
