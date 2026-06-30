"use client";

import type { ReactNode, SVGProps } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LOGO_SRC } from "@/components/layout/logo-mark";

type MobileNavLink = {
  href: string;
  label: string;
  highlight?: boolean;
};

type MobileNavProps = {
  links: MobileNavLink[];
  isAuthenticated: boolean;
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
};

const drawerLinks = [
  { href: "/account", label: "حساب کاربری" },
  { href: "/products/compare", label: "مقایسه محصولات" },
  { href: "/support", label: "تماس با ما" },
];

export function MobileNav({ links, isAuthenticated, categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  return (
    <>
      <button
        aria-label="باز کردن منوی موبایل"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E8EE] bg-white text-[#171B23] shadow-sm transition hover:border-[#F59E0B] hover:text-[#D97706]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div aria-modal="true" className="fixed inset-0 z-[80] lg:hidden" role="dialog">
          <button
            aria-label="بستن منو"
            className="absolute inset-0 bg-[#171B23]/45"
            onClick={() => setOpen(false)}
            type="button"
          />

          <aside className="absolute inset-y-0 right-0 flex w-[min(88vw,390px)] flex-col overflow-hidden rounded-l-[28px] bg-white shadow-[0_30px_80px_rgba(17,24,39,0.22)]">
            <div className="border-b border-[#E7E8EE] p-4">
              <div className="flex items-center justify-between gap-3">
                <Link className="flex items-center" href="/" onClick={() => setOpen(false)}>
                  <Image alt="لوگوی Oilbar" className="h-auto w-[112px]" height={44} src={LOGO_SRC} unoptimized width={176} />
                </Link>

                <button
                  aria-label="بستن منو"
                  className="rounded-xl border border-[#E7E8EE] p-2 text-[#667085]"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <form action="/products" className="relative mt-3">
                <SearchIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                <input className="input-zen pr-10" name="search" placeholder="جستجو در روغن، فیلتر یا خودرو" />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <button
                className="flex w-full items-center justify-between rounded-xl bg-[#F7F8FA] px-4 py-2.5 text-sm font-bold text-[#171B23]"
                onClick={() => setCategoriesOpen((value) => !value)}
                type="button"
              >
                دسته‌بندی‌ها
                <ChevronIcon className={`h-4 w-4 transition ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>

              {categoriesOpen ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {categories.length ? (
                    categories.slice(0, 8).map((category) => (
                      <Link
                        key={category.id}
                        className="rounded-xl border border-[#E7E8EE] px-3 py-2.5 text-xs font-semibold text-[#344054]"
                        href={`/categories/${category.slug}`}
                        onClick={() => setOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-2xl border border-dashed border-[#D0D5DD] bg-[#F9FAFB] p-4 text-center text-xs font-semibold text-[#667085]">
                      هنوز دسته‌بندی‌ای ثبت نشده است.
                    </div>
                  )}
                </div>
              ) : null}

              <nav className="mt-5 space-y-2 text-sm font-semibold text-[#344054]">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    className={`block rounded-xl border px-4 py-2.5 transition ${
                      link.highlight
                        ? "border-[#F5C56B] bg-[#FFF8E8] text-[#D97706]"
                        : "border-[#E7E8EE] hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706]"
                    }`}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {drawerLinks.map((link) => (
                  <Link
                    key={link.label}
                    className="block rounded-xl px-4 py-2.5 text-[#667085]"
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-[#E7E8EE] p-4">
              {isAuthenticated ? <SignOutButton /> : <SignInButton />}
            </div>
          </aside>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#E7E8EE] bg-white px-1 pb-2 pt-1 text-[11px] font-bold text-[#667085] shadow-[0_-10px_30px_rgba(17,24,39,0.08)] lg:hidden">
        <BottomLink href="/" icon={<HomeIcon className="h-5 w-5" />} label="خانه" />
        <button className="flex flex-col items-center gap-1 rounded-xl px-1 py-1.5" onClick={() => setOpen(true)} type="button">
          <MenuIcon className="h-5 w-5" />
          دسته‌بندی
        </button>
        <BottomLink href="/products" icon={<SearchIcon className="h-5 w-5" />} label="جستجو" />
        <BottomLink href="/cart" icon={<CartIcon className="h-5 w-5" />} label="سبد خرید" />
        <BottomLink href={isAuthenticated ? "/account" : "/sign-in"} icon={<UserIcon className="h-5 w-5" />} label="حساب" />
      </nav>
    </>
  );
}

function BottomLink({ href, icon, label }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link className="flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition hover:text-[#D97706]" href={href}>
      {icon}
      {label}
    </Link>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
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
