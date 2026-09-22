import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import { getBlogCategories, getPaginatedBlogPosts } from "@/lib/data";
import { getPaginationParams } from "@/lib/pagination";
import { buildCollectionMetadata } from "@/lib/seo";

type BlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const highDemandGuides = [
  {
    href: "/blog/oil-filter-buying-and-replacement-guide",
    title: "راهنمای خرید و تعویض فیلتر روغن",
    description: "زمان تعویض، نشانه‌های فیلتر نامناسب و نکات انتخاب برای خودرو",
  },
  {
    href: "/blog/brake-fluid-buying-guide-dot3-dot4-dot51",
    title: "راهنمای خرید روغن ترمز",
    description: "تفاوت DOT 3، DOT 4 و DOT 5.1 و روش انتخاب درست",
  },
  {
    href: "/blog/cabin-air-filter-buying-replacement-guide",
    title: "راهنمای خرید و تعویض فیلتر کابین",
    description: "زمان تعویض و معیارهای انتخاب فیلتر هوای اتاق خودرو",
  },
  {
    href: "/blog/0w20-engine-oil-guide-for-modern-cars",
    title: "روغن 0W-20 برای چه ماشین‌هایی است؟",
    description: "کاربرد، استانداردها و نکات مهم روغن موتورهای مدرن",
  },
  {
    href: "/blog/5w30-vs-5w40-engine-oil",
    title: "تفاوت روغن 5W-30 و 5W-40",
    description: "مقایسه گرانروی و انتخاب روغن مناسب براساس دفترچه خودرو",
  },
  {
    href: "/blog/best-octane-booster-for-turbo-cars",
    title: "بهترین اکتان برای موتورهای توربو",
    description: "ویژگی‌های مکمل سوخت مناسب خودروهای توربوشارژ",
  },
] as const;

export async function generateMetadata({ searchParams }: BlogPageProps) {
  return buildCollectionMetadata({ pathname: "/blog", title: "مجله اویل‌بار | راهنمای خرید روغن، اکتان و نگهداری خودرو", description: "راهنمای تخصصی انتخاب روغن موتور، اکتان بوستر، نگهداری خودرو و محصولات مناسب ماشین‌ها در مجله اویل‌بار.", searchParams: await searchParams, defaultPageSize: 10, maxPageSize: 30 });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const { page, pageSize } = getPaginationParams(params, { defaultPageSize: 10, maxPageSize: 30 });
  const category = typeof params.category === "string" ? params.category : null;
  const showHighDemandGuides = !category && page === 1;
  const [{ items: posts, pageInfo }, categories] = await Promise.all([
    getPaginatedBlogPosts({ page, pageSize, category }),
    getBlogCategories(),
  ]);

  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:py-8">
      <StorefrontPageIntro
        compact
        description="راهنمای خرید، مقایسه محصولات و نکات فنی برای انتخاب روغن موتور، اکتان بوستر و لوازم مصرفی خودرو."
        meta={`${pageInfo.total.toLocaleString("fa-IR")} مقالهٔ منتشرشده`}
        title="مجله اویل‌بار"
        tone="plain"
      />

      {showHighDemandGuides ? (
        <section aria-labelledby="high-demand-guides-title">
          <div className="mb-2">
            <h2 className="t-h2" id="high-demand-guides-title">راهنماهای پرتقاضا</h2>
            <p className="mt-1 text-xs leading-6 text-text-muted">پاسخ‌های سریع و تخصصی به پرسش‌های پرتکرار نگهداری خودرو</p>
          </div>
          <div className="grid border-t border-border md:grid-cols-2 md:gap-x-6">
            {highDemandGuides.map((guide) => (
              <Link className="group flex min-w-0 items-center justify-between gap-4 border-b border-border py-4" href={guide.href} key={guide.href}>
                <span className="min-w-0">
                  <span className="block font-extrabold text-text-strong transition group-hover:text-primary-accent-strong">{guide.title}</span>
                  <span className="mt-1 block text-xs leading-6 text-text-muted">{guide.description}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-primary-accent-strong">←</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-border pb-3 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            <Link href="/blog" className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold ${!category ? "border-primary-accent-strong bg-primary-accent-strong text-white" : "border-border bg-surface text-text-muted"}`}>
              همه راهنماها
            </Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                href={`/blog?category=${encodeURIComponent(item.slug)}`}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold ${category === item.slug ? "border-primary-accent-strong bg-primary-accent-strong text-white" : "border-border bg-surface text-text-muted"}`}
              >
                {item.title}
              </Link>
            ))}
          </div>
          <Link
            href="/support"
            className="inline-flex min-h-11 shrink-0 items-center px-1 text-xs font-extrabold text-primary-accent-strong transition hover:text-[#B45309] md:min-h-10"
          >
            درخواست موضوع پیشنهادی
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState compact description="با انتشار نخستین راهنمای فنی، مطالب این بخش نمایش داده می‌شود." title="هنوز مقاله‌ای ثبت نشده است" />
        )}
        <Pagination pathname="/blog" searchParams={params} pageInfo={pageInfo} />
      </section>
    </div>
  );
}
