import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";

export function OilSelectionGuide() {
  return (
    <section aria-labelledby="oil-selection-guide-title" className="container-zen mt-9 md:mt-14" id="oil-selection-guide">
      <div className="grid items-center gap-4 border-t border-border py-7 sm:gap-6 sm:py-9 md:grid-cols-[1.25fr_0.85fr] md:gap-10 lg:py-11">
        <div className="order-2 min-w-0 md:order-1">
          <p className="text-xs font-extrabold text-primary-accent-strong">راهنمای انتخاب روغن</p>
          <h2 className="mt-2 text-[1.45rem] font-black leading-[1.6] tracking-[-0.025em] sm:text-[1.65rem] lg:text-[1.95rem]" id="oil-selection-guide-title">
            روغن مناسب، <span className="inline-block">از دفترچه شروع می‌شود.</span>
          </h2>
          <p className="mt-3 max-w-xl text-[13px] leading-7 text-text-muted md:text-sm">
            گرید، استاندارد و تأییدیهٔ روغن را با دفترچهٔ خودروی‌تان تطبیق دهید؛ مشخصات خودروی خود را اینجا پیدا کنید.
          </p>

          <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3 sm:gap-x-10">
            <div>
              <dt className="text-xs font-extrabold text-text-strong">ویسکوزیته</dt>
              <dd className="mt-1 text-xs leading-6 text-text-muted">مثل <bdi className="font-semibold" dir="ltr">5W-30</bdi></dd>
            </div>
            <div>
              <dt className="text-xs font-extrabold text-text-strong">استاندارد و تأییدیه</dt>
              <dd className="mt-1 text-xs leading-6 text-text-muted"><bdi dir="ltr">API / ACEA</bdi> و سازنده</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5">
            <Link className="btn-secondary shrink-0" href="/cars">
              <CarIcon className="size-4 shrink-0" />
              دفترچه خودروی من
            </Link>
            <Link className="oil-guide-secondary inline-flex min-h-11 items-center gap-1.5 text-xs font-bold" href="/blog">
              مطالعه راهنماها
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </div>

        <figure className="order-1 mx-auto w-[220px] max-w-full sm:w-[260px] md:order-2 md:w-full md:max-w-[420px]">
          <Image alt="" className="h-auto w-full" height={330} sizes="(max-width: 639px) 220px, (max-width: 767px) 260px, 35vw" src="/illustrations/oil-selection-guide.svg" width={460} />
          <figcaption className="mt-1 text-center text-[11px] font-medium text-text-muted">نمونهٔ گرید روی برچسب روغن</figcaption>
        </figure>
      </div>
    </section>
  );
}

function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      <path d="m5 10 2-6h10l2 6M3 10h18v8H3zM5 18v3m14-3v3M7 14h1m8 0h1" />
    </svg>
  );
}
