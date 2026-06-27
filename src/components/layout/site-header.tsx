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
    { href: "/products/compare", label: "مقایسه" },
    { href: "/brands", label: "برندها" },
    { href: "/cars", label: "انتخاب خودرو" },
    { href: "/blog", label: "راهنمای خرید" },
    { href: "/support", label: "مشاوره" },
  ];
  if (sessionUser?.role === "ADMIN") links.push({ href: "/admin", label: "پنل ادمین", highlight: true });

  const quickCategories = categories.slice(0, 5);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur">
      <div className="hidden border-b border-slate-100 bg-[#0f2747] text-white md:block">
        <div className="container-zen flex items-center justify-between py-2 text-xs">
          <span>ارسال سریع تهران و شهرستان • ضمانت اصالت روغن و فیلتر</span>
          <div className="flex items-center gap-5 text-white/85">
            <Link href="tel:02112345678" className="hover:text-white">مشاوره تخصصی: ۰۲۱-۱۲۳۴۵۶۷۸</Link>
            <Link href={isAuthenticated ? "/account" : "/sign-in"} className="hover:text-white">ورود / حساب کاربری</Link>
          </div>
        </div>
      </div>
      <div className="container-zen grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 lg:gap-6">
        <MobileNav links={links} isAuthenticated={isAuthenticated} categories={categories} />
        <Link href="/" className="flex items-center gap-2" aria-label="ZenLube خانه">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#0f2747] text-lg font-black text-orange-400">Z</span>
          <span className="hidden text-2xl font-black tracking-tight text-[#0f2747] sm:block">ZenLube</span>
        </Link>
        <form action="/products" className="relative order-4 col-span-3 lg:order-none lg:col-span-1">
          <input name="search" className="input-zen h-12 bg-slate-50 pr-12 text-sm" placeholder="جستجو در روغن موتور، فیلتر، برند، مدل خودرو…" aria-label="جستجوی محصول" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
          <button className="absolute left-1.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-orange-500 px-5 py-2 text-xs font-bold text-white md:block">جستجو</button>
        </form>
        <div className="flex items-center justify-end gap-2">
          <div className="hidden lg:block">{isAuthenticated ? <SignOutButton /> : <SignInButton />}</div>
          <CartIndicator />
        </div>
      </div>
      <nav className="hidden border-t border-slate-100 bg-white lg:block">
        <div className="container-zen flex items-center gap-7 py-2.5 text-sm text-slate-600">
          <CategoryDropdown categories={categories} />
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`transition hover:text-orange-600 ${link.highlight ? "font-bold text-orange-600" : ""}`}>{link.label}</Link>
          ))}
        </div>
      </nav>
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
