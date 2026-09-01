import type { SVGProps } from "react";
import Link from "next/link";

import { LogoMark } from "@/components/layout/logo-mark";
import { getAllCategoriesLite } from "@/lib/data";

const ENAMAD_ID = "676134";
const ENAMAD_CODE = "CIEFXVKystVwcAFxMw9PAkoXuIW996ra";
const ENAMAD_HREF = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const ENAMAD_LOGO = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;

const trustItems = ["ضمانت اصالت کالا", "ارسال سریع", "پرداخت امن", "پشتیبانی تخصصی"];

const mobileFooterLinks = [
  ["تماس و پشتیبانی", "/support"],
  ["حساب کاربری", "/account"],
  ["انتخاب براساس خودرو", "/cars"],
  ["برندها", "/brands"],
  ["قوانین خرید", "/terms"],
  ["حریم خصوصی", "/policy"],
] as const;

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
    <footer className="mt-10 md:mt-14 lg:mt-16">
      <div className="hidden border-y border-border bg-surface-secondary md:block">
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
        <div className="container-zen py-7 lg:hidden">
          <div className="flex items-start justify-between gap-5">
            <Link className="inline-flex items-center rounded-lg bg-white px-2 py-1" href="/">
              <LogoMark className="h-9 w-auto" sizes="92px" />
            </Link>
            <Link
              className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-white/14 bg-white/7 px-3 text-[11px] font-bold text-white transition hover:border-primary-accent/50 hover:text-[#F5C56B]"
              href="tel:+989190810910"
            >
              ۰۹۱۹۰۸۱۰۹۱۰
            </Link>
          </div>
          <p className="mt-3 max-w-lg text-xs leading-6 text-white/66">
            محصولات مصرفی خودرو با تضمین اصالت و انتخاب فنی دقیق.
          </p>
          <nav className="mt-5 grid grid-cols-2 border-t border-white/10 text-xs font-semibold text-white/72">
            {mobileFooterLinks.map(([label, href]) => (
              <Link
                className="border-b border-white/10 py-3 transition odd:border-l odd:border-white/10 odd:pl-3 even:pr-3 hover:text-[#F5C56B]"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-5">
            <EnamadSeal />
          </div>
        </div>

        <div className="container-zen hidden gap-8 py-12 lg:grid lg:grid-cols-[1.15fr_2fr_0.9fr]">
          <div>
            <Link className="inline-flex items-center rounded-xl bg-white px-2.5 py-1.5" href="/">
              <LogoMark className="h-[52px] w-auto" sizes="134px" />
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

          <div className="grid grid-cols-4 gap-6">
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
              <EnamadSeal />
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-center text-xs font-bold text-white/72 sm:h-24 sm:w-24">
                نشان ملی ثبت
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 bg-[#11151c] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+4.25rem)] text-center text-[11px] text-white/48 lg:py-4 lg:text-xs">
        © {new Date().getFullYear()} Oilbar - همه حقوق محفوظ است.
      </div>
    </footer>
  );
}

function EnamadSeal() {
  return (
    <a
      aria-label="نماد اعتماد الکترونیکی"
      className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 sm:h-24 sm:w-24"
      href={ENAMAD_HREF}
      referrerPolicy="origin"
      rel="noopener"
      target="_blank"
    >
      {/* Enamad requires a native img with origin referrer and the official logo URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="نماد اعتماد الکترونیکی"
        className="h-full w-full cursor-pointer object-contain"
        referrerPolicy="origin"
        src={ENAMAD_LOGO}
        {...{ code: ENAMAD_CODE }}
      />
    </a>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
