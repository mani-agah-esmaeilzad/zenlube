"use client";

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

export function MobileNav({ links, isAuthenticated, categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <div className="flex items-center lg:hidden">
      <button
        type="button"
        aria-label="باز کردن منوی موبایل"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-slate-900"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-6 right-6 top-20 z-40 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-500/10">
          <nav className="flex flex-col gap-4 text-sm text-slate-700">
            <button
              type="button"
              onClick={() => setCategoriesOpen((prev) => !prev)}
              className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-sky-200 hover:text-slate-900"
            >
              <span>دسته‌بندی‌ها</span>
              <svg
                className={`h-4 w-4 transition ${categoriesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {categoriesOpen && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <ul className="flex flex-col gap-2 text-xs text-slate-600">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/categories/${category.slug}`}
                        className="block rounded-xl px-3 py-2 transition hover:bg-white hover:text-slate-900"
                        onClick={() => {
                          setOpen(false);
                          setCategoriesOpen(false);
                        }}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
                  <Link
                    href="/categories"
                    className="transition hover:text-slate-900"
                    onClick={() => {
                      setOpen(false);
                      setCategoriesOpen(false);
                    }}
                  >
                    مشاهده همه دسته‌بندی‌ها
                  </Link>
                </div>
              </div>
            )}
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-sky-200 hover:text-slate-900 ${
                  link.highlight ? "border-sky-200 bg-sky-50 text-sky-700" : ""
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex items-center justify-between">
            {isAuthenticated ? <SignOutButton /> : <SignInButton />}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
