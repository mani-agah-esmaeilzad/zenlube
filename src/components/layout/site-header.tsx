import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { CategoryDropdown } from "@/components/layout/category-dropdown";
import { LOGO_SRC } from "@/components/layout/logo-mark";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getAllCategoriesLite } from "@/lib/data";

type NavLink = {
  href: string;
  label: string;
  highlight?: boolean;
};

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export async function SiteHeader() {
  const categories = await getAllCategoriesLite().catch(() => []);

  const links: NavLink[] = [
    { href: "/products", label: "محصولات" },
    { href: "/brands", label: "برندها" },
    { href: "/categories", label: "دسته‌بندی‌ها" },
    { href: "/blog", label: "راهنمای انتخاب روغن" },
    { href: "/support", label: "پشتیبانی" },
  ];

  const searchSuggestions = categories.slice(0, 4).map((category) => category.name);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7E8EE] bg-white/96 shadow-[0_6px_24px_rgba(17,24,39,0.04)] backdrop-blur">
      <div className="hidden bg-[#171B23] text-white lg:block">
        <div className="container-zen flex items-center justify-between py-2 text-[11px]">
          <div className="flex items-center gap-3 text-white/90">
            <ShieldIcon className="h-4 w-4 text-[#F59E0B]" />
            <span>ضمانت اصالت کالا</span>
            <span className="h-3 w-px bg-white/15" />
            <span>۷ روز ضمانت بازگشت وجه</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <HeadsetIcon className="h-4 w-4 text-[#F59E0B]" />
            <span>پشتیبانی: ۰۲۱-۹۱۰۰-۷۲۰۰</span>
          </div>
        </div>
      </div>

      <div className="container-zen grid grid-cols-[auto_1fr_auto] items-center gap-2 py-2.5 lg:grid-cols-[auto_minmax(360px,1fr)_auto] lg:gap-4">
        <div className="flex items-center gap-3 lg:hidden">
          <MobileNav categories={categories} isAuthenticated={false} links={links} />
          <Link aria-label="صفحه اصلی Oilbar" href="/" className="flex items-center">
            <Image alt="لوگوی Oilbar" className="h-auto w-[108px]" height={46} priority src={LOGO_SRC} unoptimized width={172} />
          </Link>
        </div>

        <div className="hidden min-w-0 items-center gap-5 lg:flex">
          <Link aria-label="صفحه اصلی Oilbar" href="/" className="shrink-0">
            <Image alt="لوگوی Oilbar" className="h-auto w-[136px]" height={52} priority src={LOGO_SRC} unoptimized width={224} />
          </Link>

          <nav className="flex min-w-0 flex-1 items-center justify-end gap-0.5 text-[13px] font-bold text-[#344054]">
            <CategoryDropdown categories={categories} />
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-2.5 py-1.5 transition hover:bg-[#FFF7E8] hover:text-[#D97706] ${
                  link.highlight ? "bg-[#FFF7E8] text-[#D97706]" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <form action="/products" className="group relative order-3 col-span-3 lg:order-none lg:col-span-1">
          <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input
            aria-label="جستجوی محصول"
            className="input-zen h-12 rounded-2xl border-[#E7E8EE] bg-white pr-11 text-sm font-medium shadow-[0_8px_24px_rgba(17,24,39,0.03)] lg:h-[52px]"
            name="search"
            placeholder="جستجو برای روغن، فیلتر، برند یا خودرو..."
          />
          <div className="invisible absolute inset-x-0 top-[calc(100%+8px)] z-50 rounded-[22px] border border-[#ECEEF2] bg-white p-4 opacity-0 shadow-[0_20px_60px_rgba(17,24,39,0.12)] transition group-focus-within:visible group-focus-within:opacity-100">
            <p className="mb-3 text-xs font-bold text-[#667085]">جستجوهای پیشنهادی</p>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((item) => (
                <Link
                  key={item}
                  className="rounded-full border border-[#E7E8EE] px-3 py-1.5 text-xs font-semibold text-[#344054] transition hover:border-[#F59E0B] hover:bg-[#FFF9EC] hover:text-[#D97706]"
                  href={`/products?search=${encodeURIComponent(item)}`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2">
          <div className="hidden lg:block">
            <SignInButton />
          </div>
          <Link
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-[#E7E8EE] bg-white px-3 text-sm font-bold text-[#171B23] shadow-sm transition hover:border-[#F5C56B] hover:text-[#D97706]"
            href="/cart"
          >
            <CartIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeadsetIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M4 13a8 8 0 1 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
      <path d="M9 21h6" />
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 3 5 6v6c0 4.5 2.8 7.9 7 9 4.2-1.1 7-4.5 7-9V6l-7-3Z" />
      <path d="m9.5 12.5 1.8 1.8 3.7-4.3" />
    </svg>
  );
}

function CartIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx={9} cy={20} r={1} />
      <circle cx={17} cy={20} r={1} />
      <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 8H7" />
    </svg>
  );
}
