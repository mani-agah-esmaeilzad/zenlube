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
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={clsx(
          "inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-[13px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE7B0]",
          open
            ? "border-[#F5C56B] bg-[#FFF8E8] text-[#D97706]"
            : "border-transparent bg-[#171B23] text-white hover:bg-[#252C39]",
        )}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MenuIcon className="h-4 w-4" />
        دسته‌بندی‌ها
        <ChevronIcon className={clsx("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
      </button>

      <div
        className={clsx(
          "absolute right-0 top-full z-50 mt-2.5 w-[min(92vw,920px)] rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_24px_64px_rgba(17,24,39,0.14)] transition",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none",
        )}
        role="menu"
        tabIndex={-1}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div>
            <p className="mb-3 border-b border-[#E5E7EB] pb-2 text-sm font-bold text-[#111827]">
              دسته‌بندی‌های فروشگاه
            </p>
            {categories.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block rounded-xl border border-[#E5E7EB] px-3 py-3 text-sm font-semibold text-[#374151] transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706]"
                    onClick={() => setOpen(false)}
                    role="menuitem"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5 text-center text-sm font-semibold text-[#6B7280]">
                هنوز دسته‌بندی‌ای ثبت نشده است.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#FDE7B0] bg-[#FFF8E8] p-4">
            <p className="text-sm font-bold text-[#111827]">ماشینت رو انتخاب کن</p>
            <p className="mt-2 text-xs leading-6 text-[#6B7280]">
              با انتخاب خودرو، روغن و فیلترهای سازگار را سریع‌تر پیدا کن.
            </p>
            <Link href="/cars" className="btn-primary mt-4 w-full !min-h-10 !py-2 text-xs" onClick={() => setOpen(false)}>
              انتخاب خودرو
            </Link>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-5 border-t border-[#E5E7EB] pt-4">
            <Link href="/categories" className="rounded-full px-3 py-1.5 text-xs font-bold text-[#D97706]" onClick={() => setOpen(false)}>
              مشاهده همه دسته‌بندی‌ها
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
