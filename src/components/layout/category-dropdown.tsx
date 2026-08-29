"use client";

import type { SVGProps } from "react";
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

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={clsx(
          "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-[13px] font-bold transition",
          open ? "bg-surface-tint text-primary-accent-strong" : "text-text hover:bg-surface-secondary hover:text-text-strong",
        )}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        type="button"
      >
        دسته‌بندی‌ها
        <ChevronIcon className={clsx("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
      </button>

      <div
        className={clsx(
          "absolute right-0 top-full z-50 mt-2 w-[min(92vw,720px)] rounded-2xl border border-border bg-white p-4 shadow-[0_16px_40px_rgba(17,24,39,0.08)] transition",
          open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0",
        )}
        role="menu"
        tabIndex={-1}
      >
        <p className="mb-3 border-b border-border pb-2 text-sm font-bold text-text-strong">دسته‌بندی‌های فروشگاه</p>
        {categories.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                className="interactive-lift block rounded-xl border border-border bg-white px-3 py-3 text-sm font-semibold text-text"
                href={`/categories/${category.slug}`}
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : (
          <div className="border-y border-border py-5 text-center text-sm font-semibold text-text-muted">
            هنوز دسته‌بندی‌ای ثبت نشده است.
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
          <Link className="text-xs font-bold text-primary-accent-strong" href="/categories" onClick={() => setOpen(false)}>
            مشاهده همه دسته‌بندی‌ها
          </Link>
          <Link className="text-xs font-bold text-text-muted hover:text-primary-accent-strong" href="/cars" onClick={() => setOpen(false)}>
            انتخاب بر اساس خودرو
          </Link>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
