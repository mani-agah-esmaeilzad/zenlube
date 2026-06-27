"use client";

import type { ReactNode, SVGProps } from "react";
import { useState } from "react";
import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";

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
  { href: "/account", label: "سفارش‌ها" },
  { href: "/products/compare", label: "مقایسه محصولات" },
  { href: "/support", label: "پشتیبانی" },
  { href: "/support", label: "تماس با ما" },
];

export function MobileNav({ links, isAuthenticated, categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  return (
    <>
      <div className="flex items-center lg:hidden">
        <button
          type="button"
          aria-label="باز کردن منوی موبایل"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#111827] shadow-sm transition hover:border-red-200 hover:text-red-600"
          onClick={() => setOpen(true)}
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-[#111827]/45" aria-label="بستن منو" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col overflow-hidden rounded-l-3xl bg-white shadow-2xl">
            <div className="border-b border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-[#111827] text-base font-black text-white">Z</span>
                  <span>
                    <span className="block text-lg font-extrabold text-[#111827]">ZenLube</span>
                    <span className="block text-xs text-[#6B7280]">فروشگاه تخصصی خودرو</span>
                  </span>
                </Link>
                <button type="button" aria-label="بستن منو" className="rounded-xl border border-[#E5E7EB] p-2 text-[#6B7280]" onClick={() => setOpen(false)}>
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <form action="/products" className="relative mt-4">
                <SearchIcon className="absolute right-3 top-3.5 h-4 w-4 text-[#6B7280]" />
                <input name="search" className="input-zen pr-10" placeholder="جستجو در روغن، فیلتر یا خودرو" />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <button
                type="button"
                onClick={() => setCategoriesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-2xl bg-[#F7F7F8] px-4 py-3 text-sm font-bold text-[#111827]"
              >
                دسته‌بندی‌ها
                <ChevronIcon className={`h-4 w-4 transition ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>
              {categoriesOpen && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {categories.slice(0, 8).map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="rounded-2xl border border-[#E5E7EB] px-3 py-3 text-xs font-semibold text-[#374151]"
                      onClick={() => setOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              <nav className="mt-5 space-y-2 text-sm font-semibold text-[#374151]">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-2xl border border-[#E5E7EB] px-4 py-3 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 ${
                      link.highlight ? "border-red-200 bg-red-50 text-red-600" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {drawerLinks.map((link) => (
                  <Link key={link.label} href={link.href} className="block rounded-2xl px-4 py-3 text-[#6B7280]" onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-[#E5E7EB] p-5">
              {isAuthenticated ? <SignOutButton /> : <SignInButton />}
            </div>
          </aside>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#E5E7EB] bg-white px-1 pb-2 pt-1 text-[11px] font-bold text-[#6B7280] shadow-[0_-10px_30px_rgba(17,24,39,0.08)] lg:hidden">
        <BottomLink href="/" label="خانه" icon={<HomeIcon className="h-5 w-5" />} />
        <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 rounded-xl px-1 py-1.5">
          <MenuIcon className="h-5 w-5" />
          دسته‌بندی
        </button>
        <BottomLink href="/products" label="جستجو" icon={<SearchIcon className="h-5 w-5" />} />
        <BottomLink href="/cart" label="سبد خرید" icon={<CartIcon className="h-5 w-5" />} />
        <BottomLink href={isAuthenticated ? "/account" : "/sign-in"} label="حساب" icon={<UserIcon className="h-5 w-5" />} />
      </nav>
    </>
  );
}

function BottomLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition hover:text-red-600">
      {icon}
      {label}
    </Link>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}
function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>;
}
function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m6 9 6 6 6-6" /></svg>;
}
function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><circle cx={11} cy={11} r={7} /><path d="m20 20-3.5-3.5" /></svg>;
}
function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10.5V20h14v-9.5" /></svg>;
}
function CartIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><circle cx={9} cy={20} r={1} /><circle cx={17} cy={20} r={1} /><path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 8H7" /></svg>;
}
function UserIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><circle cx={12} cy={8} r={4} /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}
