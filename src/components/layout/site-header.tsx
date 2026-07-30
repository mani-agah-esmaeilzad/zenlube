import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { CartIndicator } from "@/components/layout/cart-indicator";
import { CategoryDropdown } from "@/components/layout/category-dropdown";
import { LOGO_SRC } from "@/components/layout/logo-mark";
import { MobileNav } from "@/components/layout/mobile-nav";
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
    { href: "/categories", label: "دسته‌بندی‌ها" },
    { href: "/blog", label: "راهنمای انتخاب روغن" },
    { href: "/support", label: "پشتیبانی" },
  ];

  const searchSuggestions = categories.slice(0, 4).map((category) => category.name);

  return (
    <header className="z-50 border-b border-border/80 bg-white/88 shadow-[0_8px_26px_rgba(17,24,39,0.04)] backdrop-blur-xl lg:sticky lg:top-0">
      <div className="hidden bg-[linear-gradient(90deg,#171B23_0%,#202734_58%,#171B23_100%)] text-white lg:block">
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

      <div className="container-zen py-3 lg:py-3.5">
        <div className="space-y-3 lg:hidden">
          <div className="flex items-center gap-2">
            <MobileNav accountHref={accountHref} categories={categories} isAuthenticated={isAuthenticated} links={links} />
            <div className="min-w-0 flex-1">
              <SearchAutocompleteForm placeholder="جستجو در روغن، فیلتر، برند یا خودرو..." quickSuggestions={searchSuggestions} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Link aria-label="صفحه اصلی Oilbar" href="/" className="flex shrink-0 items-center">
              <Image alt="لوگوی Oilbar" className="h-auto w-[102px] sm:w-[108px]" height={44} priority src={LOGO_SRC} unoptimized width={166} />
            </Link>

            <div className="flex items-center gap-2">
              <span className="chip-zen-muted px-3 py-2 text-[11px] text-[#344054]">
                <ShieldIcon className="h-4 w-4 text-[#D97706]" />
                ضمانت اصالت
              </span>
              <Link
                className="chip-zen px-3 py-2 text-[11px]"
                href="/products"
              >
                همه محصولات
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex min-w-0 items-center gap-5">
            <Link aria-label="صفحه اصلی Oilbar" href="/" className="shrink-0">
              <Image alt="لوگوی Oilbar" className="h-auto w-[136px]" height={52} priority src={LOGO_SRC} unoptimized width={224} />
            </Link>

            <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 text-[13px] font-bold text-[#344054]">
              <CategoryDropdown categories={categories} />
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 transition hover:bg-surface-tint hover:text-primary-accent-strong ${
                    link.highlight ? "bg-surface-tint text-primary-accent-strong" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="min-w-0">
            <SearchAutocompleteForm quickSuggestions={searchSuggestions} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <SignInButton />
            <CartIndicator />
          </div>
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
