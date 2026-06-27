import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "ZenLube | فروشگاه تخصصی روغن موتور و فیلتر خودرو",
  description: "خرید آنلاین روغن موتور اصل، فیلتر خودرو، ضدیخ و روانکار با ضمانت اصالت، مشاوره تخصصی انتخاب روغن و ارسال سریع سراسر ایران.",
  metadataBase: new URL("https://zenlube.ir"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-surface text-slate-800 antialiased">
        <div className="flex min-h-screen flex-col bg-surface">
          <SiteHeader />
          <main className="flex-1 bg-surface pb-20 lg:pb-0">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
