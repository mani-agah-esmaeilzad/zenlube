import Link from "next/link";
import type { MarketingBanner } from "@/generated/prisma";

type HeroBannerProps = {
  banner: MarketingBanner;
};

export function HeroBanner({ banner }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-purple-900/60 via-purple-950/30 to-black/60 p-10 shadow-2xl shadow-purple-950/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,77,255,0.25),_transparent_60%)]" />
      <div className="relative grid gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1 text-xs font-semibold text-purple-200">
              {new Date().getFullYear()} – تضمین اصالت و ارسال سریع
            </span>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              {banner.title}
            </h1>
            {banner.subtitle && (
              <p className="max-w-xl text-lg leading-8 text-white/70">
                {banner.subtitle}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {banner.ctaLabel && banner.ctaLink && (
              <Link
                href={banner.ctaLink}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-purple-500/30 transition hover:bg-white/90"
              >
                {banner.ctaLabel}
              </Link>
            )}
            <Link
              href="/support"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-purple-300 hover:text-white"
            >
              گفتگو با مشاور
            </Link>
          </div>
        </div>
        {banner.imageUrl && (
          <div className="relative hidden overflow-hidden rounded-[30px] border border-white/10 bg-black/40 lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="h-full w-full object-cover object-center opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
