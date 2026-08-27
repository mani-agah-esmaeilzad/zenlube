"use client";

import type { ReactNode, SVGProps } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LogoMark } from "@/components/layout/logo-mark";
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
  const drawerNavLinks = [...links, ...drawerLinks];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        aria-label="باز کردن منوی موبایل"
        aria-controls="mobile-site-drawer"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary-accent-strong bg-primary-accent-strong text-white shadow-[0_6px_16px_rgba(217,119,6,0.18)] transition hover:border-primary-accent hover:bg-primary-accent"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <MobileSheet
        className="w-[min(88vw,360px)]"
        contentClassName="px-0 py-0"
        footer={isAuthenticated ? <SignOutButton className="w-full" /> : <SignInButton className="w-full min-h-11 rounded-xl" />}
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        title="منوی فروشگاه"
      >
        <div id="mobile-site-drawer" className="flex min-h-0 flex-col">
          <div className="border-b border-border px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <Link className="flex items-center" href="/" onClick={() => setOpen(false)}>
                <LogoMark className="h-9 w-auto" sizes="92px" />
              </Link>
              {isAuthenticated ? (
                <Link
                  className="rounded-lg bg-surface-secondary px-3 py-2 text-[11px] font-bold text-text-muted transition hover:text-primary-accent-strong"
                  href={accountHref}
                  onClick={() => setOpen(false)}
                >
                  {accountLabel}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
            <button
              aria-expanded={categoriesOpen}
              className="flex w-full items-center justify-between border-b border-border px-1 py-3 text-sm font-extrabold text-text-strong transition hover:text-primary-accent-strong"
              onClick={() => setCategoriesOpen((value) => !value)}
              type="button"
            >
              دسته‌بندی‌ها
              <ChevronIcon className={`h-4 w-4 transition ${categoriesOpen ? "rotate-180" : ""}`} />
            </button>

            {categoriesOpen ? (
              <div className="mt-1 grid grid-cols-1 min-[360px]:grid-cols-2">
                {categories.length ? (
                  categories.slice(0, 10).map((category) => (
                    <Link
                      key={category.id}
                      className="border-b border-border/80 px-2 py-3 text-xs font-semibold text-text transition hover:text-primary-accent-strong odd:min-[360px]:border-l"
                      href={`/categories/${category.slug}`}
                      onClick={() => setOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="min-[360px]:col-span-2 py-4 text-center text-xs font-semibold text-text-muted">
                    هنوز دسته‌بندی‌ای ثبت نشده است.
                  </div>
                )}
              </div>
            ) : null}

            <nav className="mt-2 text-sm font-semibold text-text">
              {drawerNavLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));

                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    className={cn(
                      "block border-b border-border/80 px-1 py-3.5 transition",
                      isActive || link.highlight
                        ? "text-primary-accent-strong"
                        : "text-text hover:text-primary-accent-strong",
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
        </div>
      </MobileSheet>

      {mounted && !open
        ? createPortal(
            <nav
              className="fixed inset-x-0 bottom-0 z-[90] grid grid-cols-4 border-t border-border bg-white/95 px-1 pt-0.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] text-[10px] font-bold text-text-muted shadow-[0_-8px_24px_rgba(17,24,39,0.05)] backdrop-blur-xl lg:hidden"
              dir="rtl"
            >
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
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 py-1 transition before:absolute before:inset-x-[32%] before:top-0 before:h-0.5 before:rounded-full before:bg-transparent",
        active
          ? "text-primary-accent-strong before:bg-primary-accent-strong"
          : "hover:text-primary-accent-strong",
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
