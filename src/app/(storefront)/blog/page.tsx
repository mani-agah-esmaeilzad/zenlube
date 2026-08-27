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
    <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
      <header>
        <h1 className="t-h1">وبلاگ تخصصی Oilbar</h1>
        <p className="mt-3 max-w-4xl text-sm leading-8 text-text-muted">
          راهنمای خرید، مقایسه محصولات و نکات فنی برای انتخاب روغن موتور و فیلتر خودرو.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-sm text-text-muted">
          <span>مجموع {pageInfo.total.toLocaleString("fa-IR")} مقاله تخصصی منتشر شده است.</span>
          <Link
            href="/support"
            className="btn-outline shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-[#475467] sm:px-4"
          >
            درخواست موضوع پیشنهادی
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-secondary p-6 text-center text-sm font-semibold text-text-muted sm:p-10">
            هنوز مقاله‌ای ثبت نشده است.
          </div>
        )}
        <Pagination pathname="/blog" searchParams={params} pageInfo={pageInfo} />
      </section>
    </div>
  );
}
