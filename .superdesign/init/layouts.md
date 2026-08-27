# Shared Layouts

These files define the global RTL shell, sticky header, mobile drawer and bottom navigation, cart affordance, and footer.

### `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "Oilbar | مرجع تخصصی روغن موتور و لوازم مصرفی خودرو",
  description:
    "خرید آنلاین روغن موتور اصل، فیلتر خودرو، ضدیخ و روانکار با ضمانت اصالت، مشاوره تخصصی انتخاب روغن و ارسال سریع.",
  metadataBase: new URL("https://oilbar.ir"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html dir="rtl" lang="fa">
      <body className="bg-background text-foreground antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

```
### `src/app/(storefront)/layout.tsx`

```tsx
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="site-shell flex min-h-screen flex-col bg-background">
      <a
        href="#site-main-content"
        className="sr-only fixed right-4 top-4 z-[170] rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white focus:not-sr-only"
      >
        رفتن به محتوای اصلی
      </a>
      <div className="site-chrome">
        <SiteHeader />
      </div>
      <main className="site-main flex-1 pb-20 focus:outline-none lg:pb-0" id="site-main-content" tabIndex={-1}>
        {children}
      </main>
      <div className="site-chrome">
        <SiteFooter />
      </div>
    </div>
  );
}

```
### `src/components/layout/site-header.tsx`

```tsx
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

      <div className="container-zen py-2.5 lg:py-3">
        <div className="flex flex-col gap-2.5 lg:hidden">
          <div className="flex items-center gap-2">
            <MobileNav accountHref={accountHref} categories={categories} isAuthenticated={isAuthenticated} links={links} />
            <Link aria-label="صفحه اصلی Oilbar" className="shrink-0" href="/">
              <Image alt="لوگوی Oilbar" className="h-8 w-auto" height={32} priority src={LOGO_SRC} unoptimized width={128} />
            </Link>
            <div className="min-w-0 flex-1" />
            <CartIndicator compact />
          </div>
          <SearchAutocompleteForm placeholder="جستجو در روغن، فیلتر، برند یا خودرو..." quickSuggestions={searchSuggestions} />
        </div>

        <div className="hidden lg:block">
          <div className="flex items-center gap-4">
            <Link aria-label="صفحه اصلی Oilbar" className="shrink-0" href="/">
              <Image alt="لوگوی Oilbar" className="h-10 w-auto" height={40} priority src={LOGO_SRC} unoptimized width={164} />
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

```
### `src/components/layout/mobile-nav.tsx`

```tsx
"use client";

import type { ReactNode, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LOGO_SRC } from "@/components/layout/logo-mark";
import { MobileSheet } from "@/components/ui/mobile-sheet";
import { cn } from "@/lib/utils";

type MobileNavLink = {
  href: string;
  label: string;
  highlight?: boolean;
};

type MobileNavProps = {
  links: MobileNavLink[];
  isAuthenticated: boolean;
  accountHref: string;
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
};

const drawerLinks: MobileNavLink[] = [
  { href: "/products/compare", label: "مقایسه محصولات" },
  { href: "/support", label: "تماس با ما" },
];

export function MobileNav({ links, isAuthenticated, accountHref, categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const accountLabel = isAuthenticated ? "حساب کاربری" : "ورود / ثبت‌نام";
  const drawerNavLinks = useMemo(
    () => [...links, { href: accountHref, label: accountLabel }, ...drawerLinks],
    [accountHref, accountLabel, links],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        aria-label="باز کردن منوی موبایل"
        aria-controls="mobile-site-drawer"
        aria-expanded={open}
        className="btn-outline inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-strong"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <MobileSheet
        className="w-[min(92vw,390px)]"
        contentClassName="px-0 py-0"
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        title="منوی فروشگاه"
      >
        <div id="mobile-site-drawer" className="flex min-h-0 flex-col">
          <div className="border-b border-border px-4 pb-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <Link className="flex items-center" href="/" onClick={() => setOpen(false)}>
                <Image alt="لوگوی Oilbar" className="h-auto w-[112px]" height={44} src={LOGO_SRC} unoptimized width={176} />
              </Link>
              <Link
                className="chip-zen-muted rounded-xl px-3 py-2 text-xs font-bold text-text-muted"
                href={accountHref}
                onClick={() => setOpen(false)}
              >
                {accountLabel}
              </Link>
            </div>

            <form action="/products" className="relative mt-4">
              <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input className="input-zen pr-11" name="search" placeholder="جستجو در روغن، فیلتر یا خودرو" type="search" />
            </form>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <button
              aria-expanded={categoriesOpen}
              className="panel-zen-muted flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-text-strong"
              onClick={() => setCategoriesOpen((value) => !value)}
              type="button"
            >
              دسته‌بندی‌ها
              <ChevronIcon className={`h-4 w-4 transition ${categoriesOpen ? "rotate-180" : ""}`} />
            </button>

            {categoriesOpen ? (
              <div className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                {categories.length ? (
                  categories.slice(0, 10).map((category) => (
                    <Link
                      key={category.id}
                      className="interactive-lift rounded-xl border border-border bg-white px-3 py-3 text-xs font-semibold text-text"
                      href={`/categories/${category.slug}`}
                      onClick={() => setOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="panel-zen-muted min-[360px]:col-span-2 rounded-2xl border-dashed p-4 text-center text-xs font-semibold text-text-muted">
                    هنوز دسته‌بندی‌ای ثبت نشده است.
                  </div>
                )}
              </div>
            ) : null}

            <nav className="mt-5 space-y-2 text-sm font-semibold text-text">
              {drawerNavLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));

                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    className={cn(
                      "block rounded-xl border px-4 py-3 transition",
                      isActive || link.highlight
                        ? "border-[rgba(217,119,6,0.26)] bg-surface-tint text-primary-accent-strong"
                        : "border-border bg-white text-text hover:border-[rgba(217,119,6,0.28)] hover:bg-surface-tint hover:text-primary-accent-strong",
                    )}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border px-4 py-4 mobile-bottom-safe sm:px-5">
            {isAuthenticated ? <SignOutButton className="w-full" /> : <SignInButton className="w-full min-h-11 rounded-2xl" />}
          </div>
        </div>
      </MobileSheet>

      {mounted && !open
        ? createPortal(
            <nav className="fixed inset-x-0 bottom-0 z-[90] grid grid-cols-4 border-t border-border bg-white/96 px-1 pt-1 text-[11px] font-bold text-text-muted mobile-bottom-safe lg:hidden">
              <BottomLink active={pathname === "/"} href="/" icon={<HomeIcon className="h-5 w-5" />} label="خانه" />
              <BottomLink active={pathname?.startsWith("/products") ?? false} href="/products" icon={<StoreIcon className="h-5 w-5" />} label="فروشگاه" />
              <BottomLink active={pathname === "/cart"} href="/cart" icon={<CartIcon className="h-5 w-5" />} label="سبد خرید" />
              <BottomLink active={pathname?.startsWith("/account") || pathname?.startsWith("/sign-") || false} href={accountHref} icon={<UserIcon className="h-5 w-5" />} label="حساب" />
            </nav>,
            document.body,
          )
        : null}
    </>
  );
}

function BottomLink({ href, icon, label, active = false }: { href: string; label: string; icon: ReactNode; active?: boolean }) {
  return (
    <Link
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition",
        active ? "bg-surface-tint text-primary-accent-strong" : "hover:text-primary-accent-strong",
      )}
      href={href}
    >
      {icon}
      {label}
    </Link>
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

function SearchIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  );
}

function StoreIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M4 9.5 6 5h12l2 4.5" />
      <path d="M5 10h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8Z" />
      <path d="M9 14h6" />
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

function UserIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx={12} cy={8} r={4} />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

```
### `src/components/layout/site-footer.tsx`

```tsx
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

```
### `src/components/layout/logo-mark.tsx`

```tsx
import Image from "next/image";

export const LOGO_SRC = "/oilbar-logo-main.png";

type LogoMarkProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function LogoMark({
  className = "",
  size = 48,
  priority = false,
}: LogoMarkProps) {
  const containerClass = ["inline-flex items-center gap-3", className].filter(Boolean).join(" ");

  return (
    <span className={containerClass}>
      <Image
        src={LOGO_SRC}
        alt="لوگوی Oilbar"
        width={size}
        height={size}
        priority={priority}
        unoptimized
        className="h-auto w-auto"
      />
    </span>
  );
}

```
### `src/components/layout/cart-indicator.tsx`

```tsx
import type { SVGProps } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAppSession } from "@/lib/session";
import { cn } from "@/lib/utils";

type CartIndicatorProps = {
  compact?: boolean;
  className?: string;
};

export async function CartIndicator({ compact = false, className }: CartIndicatorProps) {
  const rawSession = await getAppSession();
  const userId = (rawSession as { user?: { id?: string } } | null)?.user?.id;

  let totalItems = 0;

  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { items: { select: { quantity: true } } },
    });
    totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  }

  return (
    <Link
      href="/cart"
      className={cn(
        "btn-outline relative inline-flex h-11 items-center rounded-xl text-sm font-bold text-text-strong",
        compact ? "w-11 justify-center px-0" : "gap-2 px-3",
        className,
      )}
      aria-label={`سبد خرید با ${totalItems.toLocaleString("fa-IR")} کالا`}
    >
      <CartIcon className="h-5 w-5" />
      {!compact ? <span className="hidden sm:inline">سبد خرید</span> : null}
      {totalItems > 0 ? (
        <span
          className={cn(
            "absolute inline-flex min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-bold text-white",
            compact ? "-left-1 -top-1 h-5" : "-left-2 -top-2 h-6",
          )}
        >
          {totalItems.toLocaleString("fa-IR")}
        </span>
      ) : null}
    </Link>
  );
}

function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={9} cy={20} r={1} />
      <circle cx={17} cy={20} r={1} />
      <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 8H7" />
    </svg>
  );
}

```
