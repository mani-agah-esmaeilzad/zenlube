import type { SVGProps } from "react";
import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CartIndicator } from "@/components/layout/cart-indicator";
import { CategoryDropdown } from "@/components/layout/category-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getAllCategoriesLite } from "@/lib/data";
import { getAppSession } from "@/lib/session";

const searchSuggestions = ["روغن 5W-30", "روغن 10W-40", "فیلتر روغن هیوندای", "روغن مناسب پژو ۲۰۶"];

export async function SiteHeader() {
  const [rawSession, categories] = await Promise.all([getAppSession(), getAllCategoriesLite()]);
  const sessionUser = (rawSession as { user?: { id?: string; role?: string | null } } | null)?.user;
  const isAuthenticated = Boolean(sessionUser?.id);
  type NavLink = { href: string; label: string; highlight?: boolean };
  const links: NavLink[] = [
    { href: "/products", label: "روغن موتور" },
    { href: "/products?search=فیلتر روغن", label: "فیلتر روغن" },
    { href: "/products?search=فیلتر هوا", label: "فیلتر هوا" },
    { href: "/products?search=روغن گیربکس", label: "روغن گیربکس" },
    { href: "/brands", label: "برندها" },
    { href: "/blog", label: "راهنمای انتخاب روغن" },
    { href: "/support", label: "پشتیبانی" },
  ];
  if (sessionUser?.role === "ADMIN") links.push({ href: "/admin", label: "پنل ادمین", highlight: true });

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="hidden bg-[#111827] text-white md:block">
        <div className="container-zen flex items-center justify-between py-2 text-xs">
          <div className="flex items-center gap-5 text-white/85">
            <span>ارسال سریع تهران و شهرستان</span>
            <span className="h-3 w-px bg-white/20" />
            <span>ضمانت اصالت روغن و فیلتر</span>
          </div>
          <div className="flex items-center gap-5 text-white/85">
            <Link href="tel:02112345678" className="transition hover:text-white">
              پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸
            </Link>
            <Link href={isAuthenticated ? "/account" : "/sign-in"} className="transition hover:text-white">
              {isAuthenticated ? "حساب کاربری" : "ورود / ثبت‌نام"}
            </Link>
          </div>
        </div>
      </div>

      <div className="container-zen grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 lg:grid-cols-[220px_1fr_auto] lg:gap-6">
        <MobileNav links={links} isAuthenticated={isAuthenticated} categories={categories} />

        <Link href="/" className="flex items-center gap-3" aria-label="صفحه اصلی Oilbar">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#111827] text-lg font-black text-white shadow-sm">
            O
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-xl font-extrabold text-[#111827]">Oilbar</span>
            <span className="block text-[11px] font-medium text-[#6B7280]">مرجع تخصصی روغن موتور خودرو</span>
          </span>
        </Link>

        <form action="/products" className="group relative order-4 col-span-3 lg:order-none lg:col-span-1">
          <SearchIcon className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-[#6B7280]" />
          <input
            name="search"
            className="h-13 w-full rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] py-3 pl-28 pr-12 text-sm text-[#1F2937] outline-none transition focus:border-red-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(239,57,78,0.08)]"
            placeholder="جستجو در روغن موتور، فیلتر، برند یا مدل خودرو..."
            aria-label="جستجوی محصول"
          />
          <button className="absolute left-1.5 top-1.5 hidden h-10 rounded-xl bg-[#EF394E] px-5 text-xs font-bold text-white transition hover:bg-[#DC2626] md:block">
            جستجو
          </button>
          <div className="invisible absolute inset-x-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-[#E5E7EB] bg-white p-4 opacity-0 shadow-[0_20px_50px_rgba(17,24,39,0.12)] transition group-focus-within:visible group-focus-within:opacity-100">
            <p className="mb-3 text-xs font-bold text-[#6B7280]">جستجوهای پرطرفدار</p>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((item) => (
                <Link key={item} href={`/products?search=${encodeURIComponent(item)}`} className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#374151] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2">
          <div className="hidden lg:block">{isAuthenticated ? <SignOutButton /> : <SignInButton />}</div>
          <CartIndicator />
        </div>
      </div>

      <nav className="hidden border-t border-[#E5E7EB] bg-white lg:block">
        <div className="container-zen flex items-center gap-2 py-2">
          <CategoryDropdown categories={categories} />
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm font-semibold text-[#374151]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-xl px-3 py-2 transition hover:bg-red-50 hover:text-red-600 ${
                  link.highlight ? "bg-red-50 text-red-600" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
