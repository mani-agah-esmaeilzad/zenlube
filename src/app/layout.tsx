import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Oilbar | مرجع تخصصی روغن موتور و لوازم مصرفی خودرو",
  description: "خرید آنلاین روغن موتور اصل، فیلتر خودرو، ضدیخ و روانکار با ضمانت اصالت، مشاوره تخصصی انتخاب روغن و ارسال سریع.",
  metadataBase: new URL("https://oilbar.ir"),
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#F7F7F8] text-[#1F2937] antialiased">
        <div className="flex min-h-screen flex-col bg-[#F7F7F8]">
          <SiteHeader />
          <main className="flex-1 bg-surface pb-20 lg:pb-0">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
