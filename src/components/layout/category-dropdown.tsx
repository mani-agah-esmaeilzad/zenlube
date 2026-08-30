"use client";

import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";

type CategoryNavItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count: {
    products: number;
  };
};

type CategoryDropdownProps = {
  categories: CategoryNavItem[];
};

export function CategoryDropdown({ categories }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstCategoryRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      className="relative"
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        aria-controls={panelId}
        aria-expanded={open}
        className={clsx(
          "relative inline-flex min-h-11 items-center gap-2 px-3 text-[13px] font-extrabold transition after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-right after:scale-x-0 after:bg-primary-accent-strong after:transition-transform focus-visible:text-primary-accent-strong focus-visible:after:scale-x-100",
          open
            ? "text-primary-accent-strong after:scale-x-100"
            : "text-text hover:text-primary-accent-strong hover:after:scale-x-100",
        )}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            window.requestAnimationFrame(() => firstCategoryRef.current?.focus());
          }
        }}
        style={{ outline: "none" }}
        type="button"
      >
        دسته‌بندی‌ها
        <ChevronIcon className={clsx("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
      </button>

      <div
        id={panelId}
        aria-hidden={!open}
        className={clsx(
          "absolute right-0 top-full z-50 w-[min(90vw,430px)] pt-2 transition duration-200 ease-out",
          open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="overflow-hidden rounded-b-xl border-t-2 border-primary-accent-strong bg-white shadow-[0_18px_45px_rgba(17,24,39,0.13)]">
          <div className="flex min-h-12 items-center justify-between gap-4 border-b border-border px-4">
            <div>
              <p className="text-sm font-extrabold text-text-strong">دسته‌بندی محصولات</p>
              <p className="mt-0.5 text-[11px] font-semibold text-text-muted">دسته‌های دارای محصول فعال</p>
            </div>
            <Link
              className="inline-flex min-h-11 shrink-0 items-center text-xs font-extrabold text-primary-accent-strong transition hover:text-[#B45309]"
              href="/categories"
              onClick={() => setOpen(false)}
            >
              همه دسته‌ها
            </Link>
          </div>

          <nav aria-label="دسته‌بندی محصولات" className="max-h-[min(62dvh,25rem)] overflow-y-auto px-4">
            {categories.length > 0 ? (
              <ul className="divide-y divide-border">
                {categories.map((category, index) => (
                  <li key={category.id}>
                    <Link
                      ref={index === 0 ? firstCategoryRef : undefined}
                      className="group flex min-h-16 items-center gap-3 py-2.5 text-right transition hover:text-primary-accent-strong focus-visible:text-primary-accent-strong"
                      href={`/products?category=${encodeURIComponent(category.slug)}`}
                      onClick={() => setOpen(false)}
                    >
                      {category.imageUrl ? (
                        <span className="relative h-11 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                          <Image alt="" className="object-cover" fill sizes="48px" src={category.imageUrl} />
                        </span>
                      ) : (
                        <span aria-hidden="true" className="h-8 w-0.5 shrink-0 bg-primary-accent" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-extrabold text-text-strong transition group-hover:text-primary-accent-strong">
                          {category.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-semibold text-text-muted">
                          {category._count.products.toLocaleString("fa-IR")} محصول
                        </span>
                      </span>
                      <ArrowLeftIcon className="h-4 w-4 shrink-0 text-text-muted transition group-hover:-translate-x-0.5 group-hover:text-primary-accent-strong" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-5 text-sm font-semibold leading-7 text-text-muted">
                هنوز محصول فعالی برای نمایش آماده نشده است؛ فهرست کامل را ببینید.
              </p>
            )}
          </nav>

          <Link
            className="group flex min-h-14 items-center gap-3 border-t border-border bg-surface-secondary/65 px-4 transition hover:bg-surface-tint"
            href="/cars"
            onClick={() => setOpen(false)}
          >
            <CarIcon className="h-5 w-5 shrink-0 text-primary-accent-strong" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-extrabold text-text-strong">انتخاب براساس خودرو</span>
              <span className="mt-0.5 block text-[11px] font-semibold text-text-muted">دفترچه، مشخصات فنی و محصولات سازگار</span>
            </span>
            <ArrowLeftIcon className="h-4 w-4 shrink-0 text-text-muted transition group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  );
}

function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m5 11 1.5-4h11l1.5 4" />
      <path d="M4 11h16v6H4z" />
      <path d="M7 17v2M17 17v2M7.5 14h.01M16.5 14h.01" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
