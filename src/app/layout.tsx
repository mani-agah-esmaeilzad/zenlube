import type { Metadata } from "next";
import "./globals.css";
import { AdminRouteBodyClass } from "@/components/layout/admin-route-body-class";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Oilbar | مرجع تخصصی روغن موتور و لوازم مصرفی خودرو",
  description:
    "خرید آنلاین روغن موتور اصل، فیلتر خودرو، ضدیخ و روانکار با ضمانت اصالت، مشاوره تخصصی انتخاب روغن و ارسال سریع.",
  metadataBase: new URL("https://oilbar.ir"),
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html dir="rtl" lang="fa">
      <body className="bg-surface text-[#1F2937] antialiased">
        <AdminRouteBodyClass />
        <div className="site-shell flex min-h-screen flex-col bg-surface">
          <div className="site-chrome">
            <SiteHeader />
          </div>
          <main className="site-main flex-1 pb-20 lg:pb-0">{children}</main>
          <div className="site-chrome">
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
