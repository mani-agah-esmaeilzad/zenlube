import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";

import { LOGO_SRC } from "@/components/layout/logo-mark";
import { getAllCategoriesLite } from "@/lib/data";

const trustItems = ["ضمانت اصالت کالا", "ارسال سریع", "پرداخت امن", "پشتیبانی تخصصی"];

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
      ["راهنمای تخصصی", "/blog"],
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
      <div className="border-y border-border bg-surface-secondary">
        <div className="container-zen grid grid-cols-2 gap-x-4 gap-y-3 py-5 md:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-bold text-text">
              <CheckIcon className="h-4 w-4 text-success" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary text-white">
        <div className="container-zen grid gap-8 py-10 lg:grid-cols-[1.15fr_2fr_0.9fr] lg:py-12">
          <div>
            <Link className="inline-flex items-center" href="/">
              <Image alt="لوگوی Oilbar" className="h-auto w-[148px]" height={50} src={LOGO_SRC} unoptimized width={210} />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-8 text-white/72">
              فروشگاه تخصصی روغن موتور، فیلتر و لوازم مصرفی خودرو با تمرکز روی اصالت کالا، انتخاب فنی دقیق و ارسال سریع.
            </p>
            <div className="mt-5 space-y-2 text-sm font-medium text-white/82">
              <p>پشتیبانی: 09190810910</p>
              <p>ایمیل: support@oilbar.ir</p>
              <p>البرز، کرج، عظیمیه، پاسداران غربی، بین نیک‌نژادی و غلامی</p>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {footerGroups.map((group) => (
              <details key={group.title} className="group rounded-xl border border-white/10 bg-white/5 px-4 py-3">
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

          <div className="hidden gap-6 lg:grid lg:grid-cols-4">
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
            <h3 className="text-sm font-bold text-white">اعتماد و پشتیبانی</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">برای مشاوره انتخاب محصول یا پیگیری سفارش با پشتیبانی در ارتباط باشید.</p>
            <Link className="btn-primary mt-4 inline-flex" href="/support">
              تماس با پشتیبانی
            </Link>
            <div className="mt-5 flex gap-3">
              <Link
                aria-label="نماد اعتماد الکترونیکی"
                className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-white/6 p-3 sm:h-24 sm:w-24"
                href="#"
              >
                <Image alt="محل قرارگیری نماد اعتماد" className="h-full w-full object-contain" height={80} src="/enamad-placeholder.svg" width={80} />
              </Link>
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-center text-xs font-bold text-white/72 sm:h-24 sm:w-24">
                نشان ملی ثبت
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 bg-[#11151c] py-4 text-center text-xs text-white/48">
        © {new Date().getFullYear()} Oilbar - همه حقوق محفوظ است.
      </div>
    </footer>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
