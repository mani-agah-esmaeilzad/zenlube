import Link from "next/link";
import type { MarketingBanner } from "@/generated/prisma";

type HeroBannerProps = {
  banner: MarketingBanner;
};

export function HeroBanner({ banner }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-500/5">
      <div className="relative grid gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {new Date().getFullYear()} – تضمین اصالت و ارسال سریع
            </span>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              {banner.title}
            </h1>
            {banner.subtitle && (
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                {banner.subtitle}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {banner.ctaLabel && banner.ctaLink && (
              <Link
                href={banner.ctaLink}
                className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200/60 transition hover:bg-sky-600"
              >
                {banner.ctaLabel}
              </Link>
            )}
            <Link
              href="/support"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              گفتگو با مشاور
            </Link>
          </div>
        </div>
        {banner.imageUrl && (
          <div className="relative hidden overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="h-full w-full object-cover object-center opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
