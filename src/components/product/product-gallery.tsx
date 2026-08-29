"use client";

import type { TouchEvent } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProductGalleryItem } from "@/lib/product-detail";

type ProductGalleryProps = {
  items: ProductGalleryItem[];
  title: string;
};

export function ProductGallery({ items, title }: ProductGalleryProps) {
  const galleryItems = useMemo(
    () =>
      items.length
        ? items
        : [
            {
              src: "",
              alt: `تصویر ${title}`,
            },
          ],
    [items, title],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const activeItem = galleryItems[activeIndex];
  const hasMultiple = galleryItems.filter((item) => item.src).length > 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    setActiveIndex((current) => (current + 1) % galleryItems.length);
  }, [galleryItems.length, hasMultiple]);

  const goPrevious = useCallback(() => {
    if (!hasMultiple) return;
    setActiveIndex((current) => (current - 1 + galleryItems.length) % galleryItems.length);
  }, [galleryItems.length, hasMultiple]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") goNext();
      if (event.key === "ArrowRight") goPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goNext, goPrevious, lightboxOpen]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX == null || !hasMultiple) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) < 42) return;
    if (deltaX > 0) {
      goNext();
    } else {
      goPrevious();
    }
    setTouchStartX(null);
  };

  return (
    <>
      <section>
        <div
          className={cn(
            "relative overflow-hidden rounded-xl bg-surface-secondary",
            !activeItem.src && "rounded-none border-y border-border bg-transparent",
          )}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <div className={cn("relative", activeItem.src ? "min-h-[280px] min-[390px]:min-h-[320px] sm:min-h-[380px] lg:min-h-[460px]" : "min-h-[140px]")}>
            {!activeItem.src ? (
              <div className="flex min-h-[140px] items-center justify-center text-sm font-bold text-text-soft">
                تصویر محصول موجود نیست
              </div>
            ) : (
              <>
                {!loadedMap[activeIndex] ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
                <Image
                  alt={activeItem.alt}
                  className={cn(
                    "object-contain p-6 transition duration-200 sm:p-8 lg:p-10",
                    loadedMap[activeIndex] ? "opacity-100" : "opacity-0",
                  )}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1023px) 100vw, 46vw"
                  src={activeItem.src}
                  onLoad={() => setLoadedMap((current) => ({ ...current, [activeIndex]: true }))}
                />
              </>
            )}

            {activeItem.src ? (
              <button
                aria-label="نمایش تصویر بزرگ‌تر"
                className="absolute left-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/90 text-text-strong shadow-[0_8px_20px_rgba(17,24,39,0.08)] transition hover:border-[rgba(245,158,11,0.26)] hover:bg-surface-tint hover:text-primary-accent-strong"
                onClick={() => setLightboxOpen(true)}
                type="button"
              >
                <ZoomIcon className="h-5 w-5" />
              </button>
            ) : null}

            {hasMultiple ? (
              <>
                <button
                  aria-label="تصویر قبلی"
                  className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-text-strong shadow-[0_8px_20px_rgba(17,24,39,0.08)] transition hover:border-[rgba(245,158,11,0.26)] hover:bg-surface-tint hover:text-primary-accent-strong"
                  onClick={goPrevious}
                  type="button"
                >
                  <ChevronIcon className="h-5 w-5" />
                </button>
                <button
                  aria-label="تصویر بعدی"
                  className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-text-strong shadow-[0_8px_20px_rgba(17,24,39,0.08)] transition hover:border-[rgba(245,158,11,0.26)] hover:bg-surface-tint hover:text-primary-accent-strong"
                  onClick={goNext}
                  type="button"
                >
                  <ChevronIcon className="h-5 w-5 rotate-180" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        {hasMultiple ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:gap-3">
            {galleryItems.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                aria-label={`انتخاب تصویر ${index + 1}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-surface-secondary transition sm:h-24 sm:w-24",
                  index === activeIndex ? "border-[rgba(245,158,11,0.4)] ring-2 ring-[rgba(245,158,11,0.15)]" : "border-border",
                )}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <Image alt={item.alt} className="object-contain p-2.5" fill sizes="96px" src={item.src} />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {mounted && lightboxOpen && activeItem.src
        ? createPortal(
            <div className="fixed inset-0 z-[210] flex items-center justify-center bg-[#101828]/82 p-4 backdrop-blur-sm">
              <button
                aria-label="بستن تصویر"
                className="absolute inset-0"
                onClick={() => setLightboxOpen(false)}
                type="button"
              />
              <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-white/10 bg-primary p-3 sm:p-5">
                <div className="relative min-h-[72dvh] overflow-hidden rounded-xl bg-white">
                  <Image alt={activeItem.alt} className="object-contain p-4 sm:p-6" fill sizes="90vw" src={activeItem.src} />
                </div>
                <button
                  aria-label="بستن"
                  className="absolute left-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#171B23]/90 text-white transition hover:border-[#F5C56B] hover:text-[#F5C56B]"
                  onClick={() => setLightboxOpen(false)}
                  type="button"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
