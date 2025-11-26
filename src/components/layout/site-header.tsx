import type { SVGProps } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/layout/logo-mark";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CartIndicator } from "@/components/layout/cart-indicator";
import { CategoryDropdown } from "@/components/layout/category-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getAllCategoriesLite } from "@/lib/data";
import { getAppSession } from "@/lib/session";

export async function SiteHeader() {
  const [rawSession, categories] = await Promise.all([getAppSession(), getAllCategoriesLite()]);
  const sessionUser = (rawSession as { user?: { id?: string; role?: string | null } } | null)?.user;
  const isAuthenticated = Boolean(sessionUser?.id);
  type NavLink = { href: string; label: string; highlight?: boolean };
  const links: NavLink[] = [
    { href: "/products", label: "فروشگاه" },
    { href: "/products/compare", label: "مقایسه روغن‌ها" },
    { href: "/brands", label: "برندها" },
    { href: "/cars", label: "خودروها" },
    { href: "/blog", label: "وبلاگ" },
    { href: "/account", label: "حساب کاربری" },
  ];

  if (sessionUser?.role === "ADMIN") {
    links.push({ href: "/admin", label: "پنل ادمین", highlight: true });
  }

  const quickCategories = categories.slice(0, 5);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/95 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="hidden border-b border-white/5 bg-slate-900 text-[11px] text-white/80 sm:block">
        <div className="layout-shell flex flex-wrap items-center justify-between gap-3 py-1.5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <SparkIcon className="h-3.5 w-3.5" />
              ارسال رایگان بالای ۳ میلیون تومان در سراسر کشور
            </span>
            <a href="tel:02632515631" className="inline-flex items-center gap-1 font-semibold text-emerald-300 transition hover:text-white">
              <PhoneIcon className="h-3.5 w-3.5" />
              ۰۲۶-۳۲۵۱۵۶۳۱
            </a>
            <a href="tel:09352490619" className="inline-flex items-center gap-1 text-sky-200 transition hover:text-white">
              <HeadsetIcon className="h-3.5 w-3.5" />
              مشاوره فوری واتساپ
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/support" className="inline-flex items-center gap-1 transition hover:text-white">
              <SupportIcon className="h-3.5 w-3.5" />
              پشتیبانی آنلاین
            </Link>
            <Link href="/cart" className="inline-flex items-center gap-1 transition hover:text-white">
              پیگیری سفارش
            </Link>
          </div>
        </div>
      </div>

      <div className="layout-shell flex flex-col gap-2 py-3 text-slate-700">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MobileNav links={links} isAuthenticated={isAuthenticated} categories={categories} />
            <Link href="/" className="inline-flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm transition hover:border-slate-200" aria-label="بازگشت به صفحه اصلی">
              <LogoMark priority size={60} />
              <div className="hidden text-right leading-tight lg:block">
                <p className="text-xs text-slate-400">فروشگاه آنلاین لوازم و روغن موتور</p>
                <p className="text-lg font-semibold text-slate-900">OILBAR</p>
              </div>
            </Link>
          </div>
          <form
            action="/products"
            method="get"
            className="hidden flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm focus-within:border-sky-300 md:flex"
          >
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              name="search"
              placeholder="جستجوی روغن، برند، خودرو یا کد محصول..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="rounded-full bg-gradient-to-l from-sky-500 to-indigo-500 px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              جستجو
            </button>
          </form>
          <div className="flex items-center gap-2">
            <div className="hidden text-xs text-slate-500 lg:flex lg:flex-col lg:items-end">
              <span className="font-semibold text-slate-900">مرکز تماس</span>
              <a href="tel:09352490619" className="text-sky-600 transition hover:text-sky-800">
                ۰۹۳۵۲۴۹۰۶۱۹
              </a>
            </div>
            <CartIndicator />
            {isAuthenticated ? <SignOutButton /> : <SignInButton />}
          </div>
        </div>

        <form
          action="/products"
          method="get"
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm md:hidden"
        >
          <SearchIcon className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            name="search"
            placeholder="نام محصول یا برند"
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
          />
        </form>

        <div className="hidden flex-wrap items-center justify-between gap-3 text-sm text-slate-600 lg:flex">
          <div className="flex items-center gap-3">
            <CategoryDropdown categories={categories} />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {quickCategories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-sky-200 hover:text-slate-900">
                  {category.name}
                </Link>
              ))}
              <Link href="/categories" className="text-sky-600 transition hover:text-sky-700">
                همه دسته‌ها
              </Link>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-slate-900 ${link.highlight ? "rounded-full border border-sky-200 px-3 py-1 text-sky-700" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.86 19.86 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function SupportIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={12} cy={12} r={8} />
      <path d="M9 10a2 2 0 114 0c0 2-2 2-2 4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={11} cy={11} r={7} />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function HeadsetIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 15v-3a9 9 0 0118 0v3" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3" />
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3" />
    </svg>
  );
}

function SparkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2l1.8 5.4L19 9l-4 3.2 1.5 5.3L12 14.8 7.5 17.5 9 12 5 9l5.2-1.6L12 2z" />
    </svg>
  );
}
