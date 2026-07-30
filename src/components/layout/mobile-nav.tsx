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
  { href: "/account", label: "حساب کاربری" },
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
        className="btn-outline inline-flex h-11 w-11 items-center justify-center rounded-2xl text-text-strong"
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
                className="chip-zen-muted rounded-2xl px-3 py-2 text-xs font-bold text-text-muted"
                href={accountHref}
                onClick={() => setOpen(false)}
              >
                {accountLabel}
              </Link>
            </div>

            <form action="/products" className="relative mt-4">
              <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input className="input-zen pr-11" name="search" placeholder="جستجو در روغن، فیلتر یا خودرو" type="search" />
            </form>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <button
              aria-expanded={categoriesOpen}
              className="panel-zen-muted flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-text-strong"
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
                      className="interactive-lift rounded-2xl border border-border bg-white px-3 py-3 text-xs font-semibold text-[#344054]"
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

            <nav className="mt-5 space-y-2 text-sm font-semibold text-[#344054]">
              {drawerNavLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    className={cn(
                      "block rounded-2xl border px-4 py-3 transition",
                      isActive || link.highlight
                        ? "border-[rgba(245,158,11,0.26)] bg-surface-tint text-primary-accent-strong"
                        : "border-border bg-white text-[#344054] hover:border-[rgba(245,158,11,0.28)] hover:bg-surface-tint hover:text-primary-accent-strong",
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
            <nav className="fixed inset-x-0 bottom-0 z-[90] grid grid-cols-4 border-t border-border bg-[rgba(255,255,255,0.96)] px-1 pt-1 text-[11px] font-bold text-text-muted shadow-[0_-10px_30px_rgba(17,24,39,0.08)] backdrop-blur mobile-bottom-safe lg:hidden">
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
