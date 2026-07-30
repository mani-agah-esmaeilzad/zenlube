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
      <header className="panel-zen relative overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(251,252,254,0.8)_100%)]" />
        <p className="relative z-10 text-sm font-bold text-primary-accent-strong">آموزش و راهنما</p>
        <h1 className="relative z-10 mt-3 text-3xl font-black text-text-strong md:text-4xl">وبلاگ تخصصی Oilbar</h1>
        <p className="relative z-10 mt-3 max-w-4xl text-sm leading-8 text-text-muted">
          مجموعه‌ای از تجربیات فنی، راهنمای خرید، مقایسه محصولات و نکات نگهداری برای موتور خودرو. تیم تحریریه ما به صورت مستمر محتوا را بر اساس استانداردهای روز به‌روزرسانی می‌کند.
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
          <div className="panel-zen-muted rounded-[28px] border-dashed p-10 text-center text-sm font-semibold text-text-muted">
            هنوز مقاله‌ای ثبت نشده است.
          </div>
        )}
        <Pagination pathname="/blog" searchParams={params} pageInfo={pageInfo} />
      </section>
    </div>
  );
}
