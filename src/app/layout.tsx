import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["latin", "arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZenLube | فروشگاه تخصصی روغن موتور",
  description:
    "ZenLube فروشگاهی مینیمال و مدرن برای خرید روغن موتور، با دسته‌بندی هوشمند، معرفی برندها، پیشنهاد محصولات متناسب با خودرو و پنل مدیریت کامل.",
  metadataBase: new URL("https://zenlube.ir"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.variable} bg-[#08070C] text-white antialiased`}
      >
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(141,99,255,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(26,26,31,0.95),_rgba(8,7,12,0.95))]" />
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
