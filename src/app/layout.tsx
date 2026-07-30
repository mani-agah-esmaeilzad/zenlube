import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "Oilbar | مرجع تخصصی روغن موتور و لوازم مصرفی خودرو",
  description:
    "خرید آنلاین روغن موتور اصل، فیلتر خودرو، ضدیخ و روانکار با ضمانت اصالت، مشاوره تخصصی انتخاب روغن و ارسال سریع.",
  metadataBase: new URL("https://oilbar.ir"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html dir="rtl" lang="fa">
      <body className="bg-surface text-[#1F2937] antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
