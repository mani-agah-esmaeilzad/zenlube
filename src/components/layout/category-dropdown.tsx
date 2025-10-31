"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

type CategoryNavItem = {
  id: string;
  name: string;
  slug: string;
};

type CategoryDropdownProps = {
  categories: CategoryNavItem[];
};

export function CategoryDropdown({ categories }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={clsx(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
          open
            ? "border-sky-200 bg-white text-slate-900 shadow-sm"
            : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:text-slate-900",
        )}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        دسته‌بندی‌ها
        <svg className={clsx("h-4 w-4 transition-transform", open ? "rotate-180" : "")} fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        className={clsx(
          "absolute right-0 top-full z-40 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-500/10 transition",
          open ? "visible translate-y-0 opacity-100 pointer-events-auto" : "invisible -translate-y-1 opacity-0 pointer-events-none",
        )}
        role="menu"
        tabIndex={-1}
      >
        <ul className="flex flex-col gap-2 text-sm text-slate-700">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="block rounded-2xl px-3 py-2 transition hover:bg-sky-50 hover:text-slate-900"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <Link href="/categories" className="transition hover:text-slate-900" onClick={() => setOpen(false)}>
            مشاهده همه دسته‌بندی‌ها
          </Link>
        </div>
      </div>
    </div>
  );
}
