import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import { getPaginatedBlogPosts } from "@/lib/data";
import { getPaginationParams } from "@/lib/pagination";

type BlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "وبلاگ Oilbar | راهنمای تخصصی روغن موتور",
  description:
    "جدیدترین مقالات آموزشی و تخصصی درباره انتخاب، نگهداری و مقایسه روغن موتور برای خودروهای مدرن.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const { page, pageSize } = getPaginationParams(params, { defaultPageSize: 10, maxPageSize: 30 });
  const { items: posts, pageInfo } = await getPaginatedBlogPosts({ page, pageSize });

  return (
    <div className="container-zen space-y-6 py-5 sm:py-6 md:py-8">
      <StorefrontPageIntro
        compact
        description="راهنمای خرید، مقایسهٔ محصولات و نکات فنی برای انتخاب روغن موتور و فیلتر خودرو."
        meta={`${pageInfo.total.toLocaleString("fa-IR")} مقالهٔ منتشرشده`}
        title="وبلاگ تخصصی Oilbar"
        tone="plain"
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm text-text-muted">
          <span>تازه‌ترین راهنماهای فنی و خرید</span>
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
