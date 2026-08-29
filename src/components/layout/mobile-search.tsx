"use client";

import type { MouseEvent as ReactMouseEvent, SVGProps } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { SearchAutocompleteForm } from "@/components/layout/search-autocomplete-form";
import { MobileSheet } from "@/components/ui/mobile-sheet";

type MobileSearchProps = {
  quickSuggestions: string[];
};

export function MobileSearch({ quickSuggestions }: MobileSearchProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleResultClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) return;

    if (event.target.closest('[role="option"], .chip-zen-muted')) {
      window.setTimeout(() => setOpen(false), 0);
    }
  };

  return (
    <>
      <button
        aria-controls="mobile-search-sheet"
        aria-expanded={open}
        aria-label="باز کردن جستجو"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-text-strong transition hover:border-[rgba(217,119,6,0.28)] hover:bg-surface-tint hover:text-primary-accent-strong"
        onClick={() => setOpen(true)}
        type="button"
      >
        <SearchIcon className="h-[19px] w-[19px]" />
      </button>

      <MobileSheet
        className="h-[min(76dvh,34rem)]"
        contentClassName="px-4 pb-6 pt-4"
        onClose={() => setOpen(false)}
        open={open}
        side="bottom"
        title="جستجو در فروشگاه"
      >
        <div
          id="mobile-search-sheet"
          onClickCapture={handleResultClick}
          onSubmitCapture={() => setOpen(false)}
        >
          <p className="mb-3 text-xs font-semibold leading-6 text-text-muted">
            نام محصول، برند، دسته‌بندی یا خودرو را وارد کنید.
          </p>
          <SearchAutocompleteForm
            placeholder="مثلاً روغن موتور 5W-30"
            quickSuggestions={quickSuggestions}
          />
        </div>
      </MobileSheet>
    </>
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
