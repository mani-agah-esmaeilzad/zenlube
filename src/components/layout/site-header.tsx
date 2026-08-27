import Link from "next/link";
import type { SVGProps } from "react";

import { SignInButton } from "@/components/auth/sign-in-button";
import { CartIndicator } from "@/components/layout/cart-indicator";
import { CategoryDropdown } from "@/components/layout/category-dropdown";
import { LogoMark } from "@/components/layout/logo-mark";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileSearch } from "@/components/layout/mobile-search";
import { SearchAutocompleteForm } from "@/components/layout/search-autocomplete-form";
import { getAllCategoriesLite } from "@/lib/data";
import { getAppSession } from "@/lib/session";

type NavLink = {
  href: string;
  label: string;
  highlight?: boolean;
};

export async function SiteHeader() {
  const categories = await getAllCategoriesLite().catch(() => []);
  const rawSession = await getAppSession();
  const isAuthenticated = Boolean((rawSession as { user?: { id?: string } } | null)?.user?.id);
  const accountHref = isAuthenticated ? "/account" : "/sign-in";

  const links: NavLink[] = [
    { href: "/products", label: "محصولات" },
    { href: "/brands", label: "برندها" },
    { href: "/cars", label: "براساس خودرو" },
    { href: "/blog", label: "راهنما" },
  ];

  const searchSuggestions = categories.slice(0, 4).map((category) => category.name);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/96 backdrop-blur-xl">
      <div className="hidden border-b border-white/8 bg-primary text-white lg:block">
        <div className="container-zen flex items-center justify-between py-2 text-[11px]">
          <div className="flex items-center gap-3 text-white/88">
            <ShieldIcon className="h-3.5 w-3.5 text-primary-accent" />
            <span>ضمانت اصالت کالا</span>
            <span className="h-3 w-px bg-white/15" />
            <span>ارسال به سراسر کشور</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <HeadsetIcon className="h-3.5 w-3.5 text-primary-accent" />
            <span>پشتیبانی: ۰۹۱۹۰۸۱۰۹۱۰</span>
          </div>
        </div>
      </div>

      <div className="container-zen py-2 lg:py-3">
        <div
          className="grid min-h-11 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 lg:hidden"
          dir="rtl"
        >
          <MobileNav accountHref={accountHref} categories={categories} isAuthenticated={isAuthenticated} links={links} />
          <Link
            aria-label="صفحه اصلی Oilbar"
            className="min-w-0 justify-self-center overflow-hidden rounded-lg"
            href="/"
          >
            <LogoMark
              className="h-8 w-auto max-w-[112px] object-contain"
              priority
              sizes="82px"
            />
          </Link>
          <div className="flex items-center gap-1.5 justify-self-end">
            <MobileSearch quickSuggestions={searchSuggestions} />
            <CartIndicator className="!h-10 !w-10 !min-h-10 rounded-xl" compact />
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="flex items-center gap-4">
            <Link aria-label="صفحه اصلی Oilbar" className="shrink-0" href="/">
              <LogoMark className="h-10 w-auto" priority sizes="104px" />
            </Link>
            <div className="min-w-0 flex-1">
              <SearchAutocompleteForm quickSuggestions={searchSuggestions} />
            </div>
            {isAuthenticated ? (
              <Link className="btn-outline inline-flex h-10 min-h-10 shrink-0 rounded-xl px-3.5 text-[13px] font-bold" href="/account">
                حساب کاربری
              </Link>
            ) : (
              <SignInButton className="shrink-0" />
            )}
            <CartIndicator />
          </div>
          <nav className="relative mt-2 flex flex-wrap items-center gap-1 text-[13px] font-bold text-text">
            <CategoryDropdown categories={categories} />
            {links.map((link) => (
              <Link
                key={link.href}
                className={`shrink-0 rounded-full px-3 py-2 transition hover:bg-surface-tint hover:text-primary-accent-strong ${
                  link.highlight ? "bg-surface-tint text-primary-accent-strong" : ""
                }`}
                href={link.href}
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

function HeadsetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M4 13a8 8 0 1 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
      <path d="M9 21h6" />
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M12 3 5 6v6c0 4.5 2.8 7.9 7 9 4.2-1.1 7-4.5 7-9V6l-7-3Z" />
      <path d="m9.5 12.5 1.8 1.8 3.7-4.3" />
    </svg>
  );
}
