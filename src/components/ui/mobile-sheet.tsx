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
