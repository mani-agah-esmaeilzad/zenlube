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
  title: "Oilbar | فروشگاه تخصصی روغن موتور",
  description:
    "Oilbar فروشگاهی مینیمال و مدرن برای خرید روغن موتور، با دسته‌بندی هوشمند، معرفی برندها، پیشنهاد محصولات متناسب با خودرو و پنل مدیریت کامل.",
  metadataBase: new URL("https://oilbar.ir"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.variable} bg-white text-slate-700 antialiased`}
      >
        <div className="min-h-screen bg-white">
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 bg-white">{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
