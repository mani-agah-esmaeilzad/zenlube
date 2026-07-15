import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Oilbar | به‌زودی",
  description: "فروشگاه تخصصی Oilbar در حال آماده‌سازی است و به‌زودی با تجربه کامل‌تر در دسترس قرار می‌گیرد.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const launchHighlights = [
  "فروشگاه تخصصی روغن و فیلتر",
  "جستجوی دقیق بر اساس خودرو",
  "تجربه خرید کامل و سریع",
];

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-[#0B0F19]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,#0B0F19_0%,#111827_100%)]" />
      <div className="absolute left-1/2 top-24 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-white/10 blur-3xl" />

      <section className="container-zen relative flex min-h-screen items-center py-10">
        <div className="mx-auto w-full max-w-5xl rounded-[40px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2 text-xs font-bold text-[#FFD89A]">
                سایت در حال آماده‌سازی است
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[1.35] tracking-[-0.04em] text-white md:text-6xl">
                Oilbar به‌زودی
                <br />
                با نسخه کامل برمی‌گردد
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                در حال نهایی‌سازی تجربه خرید، جستجوی دقیق محصولات و آماده‌سازی فروشگاه هستیم. صفحه اصلی موقتاً به حالت
                Coming Soon تغییر کرده و نسخه کامل به‌زودی منتشر می‌شود.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn-primary min-w-[210px] rounded-[18px] text-base" href="/support">
                  ارتباط با پشتیبانی
                </Link>
                <Link className="btn-outline min-w-[210px] rounded-[18px] border-white/20 bg-white/5 text-base text-white hover:bg-white/10" href="/blog">
                  مطالعه راهنماها
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {launchHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-bold text-white/80"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 flex items-center justify-center lg:order-2">
              <div className="w-full max-w-[420px] rounded-[32px] border border-white/10 bg-white/[0.05] p-6">
                <div className="flex items-center justify-center rounded-[24px] bg-white px-6 py-8">
                  <Image
                    alt="Oilbar"
                    className="h-auto w-full max-w-[220px] object-contain"
                    height={160}
                    priority
                    src="/oilbar-logo-main.png"
                    width={440}
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-[#111827] px-5 py-4">
                    <p className="text-xs font-bold text-white/45">STATUS</p>
                    <p className="mt-2 text-xl font-black text-white">Coming Soon</p>
                    <p className="mt-2 text-sm leading-7 text-white/65">
                      طراحی، محتوای فروشگاهی و جریان خرید در حال نهایی‌سازی است.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
                      <p className="text-xs font-bold text-white/45">نسخه فعلی</p>
                      <p className="mt-2 text-base font-black text-white">موقت</p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
                      <p className="text-xs font-bold text-white/45">وضعیت انتشار</p>
                      <p className="mt-2 text-base font-black text-[#FFD89A]">در حال آماده‌سازی</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
