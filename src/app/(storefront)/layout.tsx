import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TechnicalConsultation } from "@/components/layout/technical-consultation";
import { StructuredData } from "@/components/seo/structured-data";
import { buildStoreStructuredData } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="site-shell flex min-h-screen flex-col bg-background">
      <StructuredData data={buildStoreStructuredData()} />
      <a
        href="#site-main-content"
        className="sr-only fixed right-4 top-4 z-[170] rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white focus:not-sr-only"
      >
        رفتن به محتوای اصلی
      </a>
      <div className="site-header-shell">
        <SiteHeader />
      </div>
      <main className="site-main flex-1 focus:outline-none" id="site-main-content" tabIndex={-1}>
        {children}
      </main>
      <div className="site-chrome">
        <SiteFooter />
      </div>
      <TechnicalConsultation />
    </div>
  );
}
