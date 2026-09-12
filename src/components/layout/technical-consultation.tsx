"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SVGProps } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function TechnicalConsultation() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();
  const isOpen = openPath === pathname;
  const hasPurchaseBar = pathname.startsWith("/products/") && pathname !== "/products/compare";

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !widgetRef.current?.contains(event.target)) {
        setOpenPath(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenPath(null);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed left-3 z-[80] sm:left-4 lg:bottom-6 lg:left-6",
        hasPurchaseBar
          ? "bottom-[calc(env(safe-area-inset-bottom,0px)+10.5rem)]"
          : "bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)]",
      )}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpenPath(null);
      }}
      ref={widgetRef}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "بستن مشاوره رایگان فنی خودرو" : "مشاوره رایگان فنی خودرو"}
        className="group flex min-h-12 items-center gap-2.5 rounded-full border border-white/15 bg-surface-dark py-2 pr-3.5 pl-2 text-white shadow-[0_6px_24px_rgba(17,24,39,0.2)] transition-colors hover:bg-primary-hover focus-visible:outline-primary-accent lg:min-h-14 lg:pr-4 lg:pl-2.5"
        onClick={() => setOpenPath(isOpen ? null : pathname)}
        ref={triggerRef}
        type="button"
      >
        <span className="text-xs font-extrabold sm:text-[13px]">مشاوره رایگان</span>
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-primary-accent text-primary lg:size-9">
          {isOpen ? <CloseIcon className="size-4" /> : <PhoneIcon className="size-4 lg:size-[18px]" />}
        </span>
      </button>

      {isOpen ? (
        <section
          aria-labelledby={titleId}
          className={cn(
            "absolute bottom-full left-0 mb-3 w-[300px] max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-border bg-white p-5 text-text shadow-[0_12px_44px_rgba(17,24,39,0.16)] lg:max-h-[calc(100dvh-7rem)]",
            hasPurchaseBar ? "max-h-[calc(100dvh-15rem)]" : "max-h-[calc(100dvh-10rem)]",
          )}
          id={panelId}
          role="region"
        >
          <div className="flex items-start justify-between gap-2">
            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-surface-tint text-primary-accent-strong">
              <WrenchIcon className="size-5" />
            </span>
            <button
              aria-label="بستن پنل مشاوره"
              className="-mt-1 -ml-1 flex size-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-strong"
              onClick={() => {
                setOpenPath(null);
                triggerRef.current?.focus();
              }}
              type="button"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          <h2 className="mt-2 text-base font-extrabold leading-7 text-text-strong" id={titleId}>مشاوره رایگان فنی خودرو</h2>
          <p className="mt-2 text-[13px] leading-7 text-text-muted">
            سوال فنی درباره خودرو، روغن یا مکمل داری؟ با ما تماس بگیر؛ رایگان راهنمایی‌ات می‌کنیم.
          </p>
          <a
            aria-label="تماس برای مشاوره رایگان با شماره 09190810910"
            className="technical-consultation-call mt-4 flex min-h-12 items-center justify-between gap-3 rounded-lg bg-surface-dark px-3.5 py-3 transition-colors hover:bg-primary-hover"
            href="tel:+989190810910"
          >
            <span className="flex items-center gap-2 text-xs font-bold">
              <PhoneIcon className="size-4 shrink-0 text-primary-accent" />
              تماس مستقیم
            </span>
            <bdi className="text-sm font-extrabold tracking-wide" dir="ltr">09190810910</bdi>
          </a>
          <p className="mt-3 text-center text-[11px] font-medium text-text-muted">مشاوره رایگان، بدون نیاز به ثبت‌نام</p>
        </section>
      ) : null}
    </div>
  );
}

function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      <path d="m7 3-3 1c-2 1 0 8 5 13s12 7 13 5l1-3-5-3-2 2c-3-1-7-5-8-8l2-2-3-5Z" transform="translate(-1 -1)" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function WrenchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      <path d="M14.7 6.3 18 9.6l3.4-3.4a6 6 0 0 1-7.8 7.7L6.1 21.4a2.5 2.5 0 0 1-3.5-3.5l7.5-7.5a6 6 0 0 1 7.7-7.8l-3.1 3.7Z" />
    </svg>
  );
}
