import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";

export function FuelRevivalBanner() {
  return (
    <section aria-labelledby="fuel-revival-title" className="container-zen mt-6 md:mt-8" id="fuel-revival-campaign">
      <div className="relative isolate overflow-hidden rounded-2xl bg-surface-dark text-white md:grid md:grid-cols-[1.5fr_1fr]">
        <div className="relative z-10 px-5 py-6 sm:px-7 md:py-8 lg:px-10 lg:py-10">
          <p className="flex items-center gap-2.5 text-xs font-extrabold text-primary-accent">
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            کمپین احیای سوخت
          </p>
          <h2 className="mt-3 text-[1.45rem] font-black leading-[1.6] tracking-[-0.025em] sm:text-[1.7rem] md:text-[1.8rem] lg:text-[2.15rem]" id="fuel-revival-title">
            حال خوبِ موتور، <span className="inline-block text-primary-accent">هدیه‌اش با ما!</span>
          </h2>
          <p className="mt-2 text-[13px] leading-7 text-white/75 md:text-sm">
            با سفارش <strong className="font-extrabold text-white">بالای ۱۰ میلیون تومان</strong>، این دو هدیه را از ما بگیر:
          </p>
          <div className="mt-5 flex max-w-[64%] flex-col gap-3 text-xs font-bold leading-6 sm:text-[13px] md:max-w-none lg:flex-row lg:gap-6">
            <span className="flex items-start gap-2">
              <GiftIcon className="mt-0.5 size-5 shrink-0 text-primary-accent" />
              <span>یک اشانتیون کمپین احیای سوخت</span>
            </span>
            <span className="flex items-center gap-2">
              <DeliveryIcon className="size-5 shrink-0 text-primary-accent" />
              ارسال رایگان
            </span>
          </div>
          <Link
            className="fuel-revival-cta group mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-extrabold transition-colors sm:text-[13px]"
            href="/products?inStock=1"
          >
            انتخاب محصولات
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transform-none">←</span>
          </Link>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-16 -left-2 w-[42%] max-w-[200px] md:relative md:bottom-auto md:left-auto md:flex md:w-full md:max-w-none md:items-center md:justify-center md:bg-white/[0.025] md:px-3">
          <Image alt="" className="h-auto w-full md:max-w-[400px]" height={310} sizes="(max-width: 767px) 42vw, 35vw" src="/illustrations/fuel-revival-gift.svg" width={420} />
        </div>
      </div>
    </section>
  );
}

function GiftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      <path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14" />
      <path d="M12 7C5 7 5 2 8 2c3 0 4 5 4 5Zm0 0c7 0 7-5 4-5-3 0-4 5-4 5Z" />
    </svg>
  );
}

function DeliveryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      <path d="M3 6h11v10H3zM14 10h3l4 4v2h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
