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
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <header className="space-y-4 text-slate-700">
        <h1 className="text-4xl font-semibold text-slate-900">وبلاگ تخصصی Oilbar</h1>
        <p className="text-sm leading-7 text-slate-600">
          مجموعه‌ای از تجربیات فنی، راهنمای خرید، مقایسه محصولات و نکات نگهداری برای موتور خودرو. تیم تحریریه ما به
          صورت مستمر محتوا را بر اساس استانداردهای روز به‌روزرسانی می‌کند.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <span>مجموع {pageInfo.total.toLocaleString("fa-IR")} مقاله تخصصی منتشر شده است.</span>
          <Link
            href="/support"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
          >
            درخواست موضوع پیشنهادی
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm font-semibold text-[#6B7280]">
            هنوز مقاله‌ای ثبت نشده است.
          </div>
        )}
        <Pagination pathname="/blog" searchParams={params} pageInfo={pageInfo} />
      </section>
    </div>
  );
}
