# Shared UI Components

Framework primitives are custom React/Next.js components styled with Tailwind utility classes and global design tokens.

### `src/components/ui/section-header.tsx`

```tsx
import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
};

export function SectionHeader({ title, subtitle, href, actionLabel = "مشاهده همه" }: SectionHeaderProps) {
  return (
    <div className="section-heading">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link className="text-sm font-bold text-primary-accent-strong" href={href}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

```
### `src/components/ui/mobile-sheet.tsx`

```tsx
"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type MobileSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "bottom" | "right";
  className?: string;
  contentClassName?: string;
};

export function MobileSheet({
  open,
  onClose,
  title,
  children,
  footer,
  side = "bottom",
  className,
  contentClassName,
}: MobileSheetProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    const focusTimer = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      previousFocusedElementRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));

      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn("fixed inset-0 z-[160] lg:hidden", open ? "pointer-events-auto visible" : "pointer-events-none invisible")}
    >
      <button
        aria-label="بستن پنل"
        className={cn(
          "absolute inset-0 bg-[#171B23]/58 transition backdrop-blur-[2px]",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "absolute flex max-w-full flex-col overflow-hidden border border-border bg-white shadow-[0_24px_64px_rgba(17,24,39,0.18)] transition duration-200 ease-out",
          side === "right"
            ? "inset-y-0 right-0 h-full w-[min(92vw,390px)] rounded-l-2xl"
            : "inset-x-0 bottom-0 max-h-[min(88dvh,calc(100dvh-12px))] rounded-t-2xl",
          open
            ? "visible translate-x-0 translate-y-0 opacity-100"
            : side === "right"
              ? "invisible translate-x-full opacity-0"
              : "invisible translate-y-full opacity-0",
          className,
        )}
        ref={dialogRef}
        role="dialog"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-base font-extrabold text-text-strong">
              {title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            aria-label="بستن"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-text-muted transition hover:border-[rgba(217,119,6,0.26)] hover:bg-surface-tint hover:text-primary-accent-strong"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5", contentClassName)}>{children}</div>

        {footer ? (
          <div className="border-t border-border bg-white px-4 py-4 mobile-bottom-safe sm:px-5">{footer}</div>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

```
### `src/components/ui/empty-state.tsx`

```tsx
import Link from "next/link";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "panel-zen-muted rounded-2xl border-dashed text-center",
        compact ? "p-6 sm:p-7" : "p-8 sm:p-10",
        className,
      )}
    >
      <div className="icon-shell mx-auto flex size-14 items-center justify-center rounded-full">
        <EmptySparkIcon className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-extrabold text-text-strong sm:text-xl">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-text-muted">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary mt-5 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function EmptySparkIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m5.8 5.8 2.8 2.8" />
      <path d="m15.4 15.4 2.8 2.8" />
      <path d="m18.2 5.8-2.8 2.8" />
      <path d="m8.6 15.4-2.8 2.8" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

```
### `src/components/ui/price-block.tsx`

```tsx
import { cn, formatPrice } from "@/lib/utils";

type PriceBlockProps = {
  amount: number | string | { toString(): string };
  label?: string;
  showLabel?: boolean;
  align?: "start" | "end";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: {
    amount: "text-sm sm:text-[15px]",
    label: "text-[11px]",
  },
  md: {
    amount: "text-lg sm:text-xl",
    label: "text-xs",
  },
  lg: {
    amount: "text-2xl sm:text-[1.75rem]",
    label: "text-sm",
  },
} as const;

export function PriceBlock({
  amount,
  label = "قیمت",
  showLabel = true,
  align = "end",
  size = "md",
  className,
}: PriceBlockProps) {
  return (
    <div className={cn(align === "end" ? "text-left" : "text-right", className)}>
      {showLabel ? <p className={cn("font-medium text-text-muted", sizeMap[size].label)}>{label}</p> : null}
      <p className={cn("t-price", showLabel ? "mt-1" : null, sizeMap[size].amount)}>{formatPrice(amount)}</p>
    </div>
  );
}

```
### `src/components/ui/status-pill.tsx`

```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusPillTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "dark";

const toneMap: Record<StatusPillTone, string> = {
  success: "chip-zen-success",
  warning: "chip-zen-warning",
  danger: "border border-[rgba(217,45,32,0.14)] bg-[#FEF3F2] text-[#D92D20]",
  neutral: "chip-zen-muted",
  dark: "chip-zen-dark",
};

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
  className?: string;
};

export function StatusPill({ children, tone = "neutral", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

```
### `src/components/ui/breadcrumb.tsx`

```tsx
import Link from "next/link";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="مسیر صفحه" className="overflow-x-auto pb-1 text-xs font-medium text-text-muted scrollbar-none">
      <ol className="flex min-w-max items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link className="transition hover:text-primary-accent-strong" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-text-strong" : undefined}>{item.label}</span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-text-soft">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

```
### `src/components/ui/pagination.tsx`

```tsx
import Link from "next/link";
import type { PageInfo } from "@/lib/pagination";

type PaginationProps = {
  pageInfo: PageInfo;
  pathname: string;
  searchParams?: Record<string, string | string[] | undefined>;
  className?: string;
};

export function Pagination({ pageInfo, pathname, searchParams = {}, className = "" }: PaginationProps) {
  if (pageInfo.totalPages <= 1) return null;

  const pages = getVisiblePages(pageInfo.page, pageInfo.totalPages);
  const hrefFor = (page: number) => ({
    pathname,
    query: normalizeQuery({ ...searchParams, page: String(page), pageSize: String(pageInfo.pageSize) }),
  });

  return (
    <nav className={`mt-8 flex flex-wrap items-center justify-center gap-2 text-sm ${className}`} aria-label="صفحه‌بندی">
      <Link
        className={pageInfo.hasPreviousPage ? "btn-outline" : "pointer-events-none opacity-40 btn-outline"}
        href={hrefFor(Math.max(1, pageInfo.page - 1))}
        aria-disabled={!pageInfo.hasPreviousPage}
      >
        قبلی
      </Link>

      {pages.map((page, index) =>
        page === "gap" ? (
          <span key={`gap-${index}`} className="px-2 font-bold text-text-soft">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={hrefFor(page)}
            aria-current={page === pageInfo.page ? "page" : undefined}
            className={
              page === pageInfo.page
                ? "inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 font-black text-white"
                : "inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border bg-white px-3 font-bold text-text transition hover:border-[rgba(217,119,6,0.26)] hover:bg-surface-tint hover:text-primary-accent-strong"
            }
          >
            {page.toLocaleString("fa-IR")}
          </Link>
        ),
      )}

      <Link
        className={pageInfo.hasNextPage ? "btn-outline" : "pointer-events-none opacity-40 btn-outline"}
        href={hrefFor(Math.min(pageInfo.totalPages, pageInfo.page + 1))}
        aria-disabled={!pageInfo.hasNextPage}
      >
        بعدی
      </Link>
    </nav>
  );
}

function normalizeQuery(params: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === "string" && value.length > 0;
    }),
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "gap"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("gap");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("gap");
  pages.push(totalPages);

  return pages;
}

```
