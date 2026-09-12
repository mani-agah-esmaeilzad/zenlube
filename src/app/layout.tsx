import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "Oilbar | مرجع تخصصی روغن موتور و لوازم مصرفی خودرو",
  description:
    "خرید آنلاین روغن موتور اصل، فیلتر خودرو، ضدیخ و روانکار با ضمانت اصالت، مشاوره تخصصی انتخاب روغن و ارسال سریع.",
  metadataBase: new URL("https://www.oilbar.ir"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html dir="rtl" lang="fa">
      <body className="bg-background text-foreground antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
