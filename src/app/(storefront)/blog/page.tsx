import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { Pagination } from "@/components/ui/pagination";
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
    <div className="container-zen space-y-8 py-6 md:py-8">
      <header>
        <p className="text-sm font-bold text-primary-accent-strong">آموزش و راهنما</p>
        <h1 className="t-h1 mt-2">وبلاگ تخصصی Oilbar</h1>
        <p className="mt-3 max-w-4xl text-sm leading-8 text-text-muted">
          راهنمای خرید، مقایسه محصولات و نکات فنی برای انتخاب روغن موتور و فیلتر خودرو.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
          <span>مجموع {posts.length} مقاله تخصصی منتشر شده است.</span>
          <Link
            href="/support"
            className="btn-outline rounded-full px-4 py-2 text-xs font-bold text-[#475467]"
          >
            درخواست موضوع پیشنهادی
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-secondary p-10 text-center text-sm font-semibold text-text-muted">
            هنوز مقاله‌ای ثبت نشده است.
          </div>
        )}
        <Pagination pathname="/blog" searchParams={params} pageInfo={pageInfo} />
      </section>
    </div>
  );
}
