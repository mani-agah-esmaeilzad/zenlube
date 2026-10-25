"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";

const OCTANE_BRANDS = [
  {
    name: "پرشیا ساین",
    product: "UP TO 5",
    fitment: "برای خودروهای BMW",
    note: "با تأییدیهٔ پرشیا خودرو",
    image: "/images/home/octane-brands/persia-sign-up-to-5-450ml.webp",
    alt: "بسته‌بندی واقعی اکتان بوستر پرشیا ساین Up to 5",
    accent: "#20c5d2",
    panel: "#10283e",
    eyebrow: "قدرت بیشتر، با انتخاب مطمئن",
  },
  {
    name: "باواریا",
    product: "OC110-AL",
    fitment: "برای خودروهای لوکانو",
    note: "با تأییدیهٔ مکس موتور",
    image: "/images/home/octane-brands/bavaria-oc110-250ml.jpg",
    alt: "بسته‌بندی واقعی اکتان بوستر باواریا OC110-AL حجم ۲۵۰ میلی‌لیتر",
    accent: "#56c4f3",
    panel: "#10283e",
    eyebrow: "یک انتخاب ویژه برای مسیرهای تازه",
  },
  {
    name: "ستاره ایران",
    product: "MB-OC100BV",
    fitment: "ویژهٔ خودروهای مرسدس‌بنز",
    note: "محصول ستاره ایران برای مرسدس‌بنز",
    image: "/images/home/octane-brands/setareh-iran-mb-oc100bv.webp",
    alt: "بسته‌بندی واقعی اکتان بوستر ستاره ایران برای مرسدس‌بنز",
    accent: "#ff6973",
    panel: "#10283e",
    eyebrow: "انتخابی برای یک رانندگی خاص",
  },
] as const;

const OCTANE_PRODUCTS_HREF = "/products?search=%D8%A7%DA%A9%D8%AA%D8%A7%D9%86";

export function OctaneBrandBanners() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const brand = OCTANE_BRANDS[activeIndex];

  useEffect(() => {
    if (isHovered || isFocused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveIndex((index) => (index + 1) % OCTANE_BRANDS.length);
      }
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, isFocused, isHovered]);

  function goTo(index: number) {
    setActiveIndex((index + OCTANE_BRANDS.length) % OCTANE_BRANDS.length);
  }

  function moveBy(offset: number) {
    goTo(activeIndex + offset);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveBy(1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(-1);
    }
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) > 48) moveBy(deltaX < 0 ? 1 : -1);
  }

  return (
    <section
      aria-label="سه برند اکتان بوستر"
      aria-roledescription="اسلایدر"
      className="octane-campaign-section relative left-1/2 mt-6 w-screen -translate-x-1/2 md:mt-8"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false);
      }}
      onTouchEnd={handleTouchEnd}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      tabIndex={0}
    >
      <div className="octane-campaign relative isolate grid h-[540px] grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-xl bg-[#10283e] text-white shadow-[0_18px_55px_rgba(20,40,44,0.16)] sm:h-[480px] md:h-[clamp(350px,29vw,440px)] md:grid-cols-[0.95fr_1.05fr] md:grid-rows-1 md:rounded-[1.35rem]">
        <div
          className="octane-campaign-product order-1 relative row-start-1 flex min-h-0 items-center justify-center overflow-hidden bg-white md:col-start-1 md:row-start-1"
        >
          <Image
            alt={brand.alt}
            className="octane-campaign-packshot relative z-[1] h-[min(32vh,280px)] w-[min(78vw,340px)] scale-[1.23] object-contain sm:h-[min(34vh,300px)] sm:w-[min(42vw,370px)] md:h-[min(31vw,360px)] md:w-[min(40vw,430px)] md:scale-[1.08]"
            height={1000}
            priority={activeIndex === 0}
            sizes="(max-width: 767px) 78vw, 430px"
            src={brand.image}
            width={1000}
          />
        </div>
        <div
          aria-live="polite"
          className="octane-campaign-copy order-2 row-start-2 flex flex-col items-start justify-center px-5 pb-14 pt-5 text-right sm:px-8 md:col-start-2 md:row-start-1 md:px-8 md:pb-16 lg:px-14"
          key={brand.name}
          style={{ backgroundColor: brand.panel }}
        >
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold sm:text-sm" style={{ color: brand.accent }}>
            <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: brand.accent }} />
            {brand.eyebrow}
          </p>
          <p className="text-sm font-bold text-white/75 sm:text-base">{brand.fitment}</p>
          <h2 className="mt-1 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[3.25rem]" id="octane-showcase-title">
            اکتان بوستر <span className="whitespace-nowrap">{brand.name}</span>
          </h2>
          <p className="mt-2 text-2xl font-black tracking-wide sm:text-3xl" dir="ltr" style={{ color: brand.accent }}>{brand.product}</p>
          <p className="mt-1 text-xs font-medium text-white/70 sm:text-sm">{brand.note}</p>
          <Link
            className="octane-campaign-cta mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-xs font-black shadow-lg transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-5 sm:px-6 sm:text-sm"
            href={OCTANE_PRODUCTS_HREF}
            style={{ backgroundColor: brand.accent, color: brand.panel }}
          >
            دیدن اکتان‌های موجود <span aria-hidden="true">←</span>
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-2 z-20 h-10 px-4 sm:px-6 md:bottom-3 md:px-7">
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2" role="group" aria-label="انتخاب برند اکتان">
            {OCTANE_BRANDS.map((item, index) => (
              <button
                aria-current={activeIndex === index ? "true" : undefined}
                aria-label={`نمایش ${item.name}`}
                className={`octane-campaign-dot h-2.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white ${activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                key={item.name}
                onClick={() => goTo(index)}
                type="button"
              />
            ))}
          </div>
          <div className="absolute right-4 top-0 flex items-center gap-2 md:left-[calc(50%-6rem)] md:right-auto">
            <button
              aria-label="اسلاید قبلی"
              className="flex size-9 items-center justify-center rounded-full bg-white text-lg text-[#10283e] shadow-md transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:size-10"
              onClick={() => moveBy(-1)}
              type="button"
            >
              <span aria-hidden="true">→</span>
            </button>
            <button
              aria-label="اسلاید بعدی"
              className="flex size-9 items-center justify-center rounded-full bg-white text-lg text-[#10283e] shadow-md transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:size-10"
              onClick={() => moveBy(1)}
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
