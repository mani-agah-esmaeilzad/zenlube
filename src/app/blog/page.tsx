import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { getAllBlogPosts } from "@/lib/data";

export const metadata = {
  title: "وبلاگ Oilbar | راهنمای تخصصی روغن موتور",
  description:
    "جدیدترین مقالات آموزشی و تخصصی درباره انتخاب، نگهداری و مقایسه روغن موتور برای خودروهای مدرن.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <header className="space-y-4 text-slate-700">
        <h1 className="text-4xl font-semibold text-slate-900">وبلاگ تخصصی Oilbar</h1>
        <p className="text-sm leading-7 text-slate-600">
          مجموعه‌ای از تجربیات فنی، راهنمای خرید، مقایسه محصولات و نکات نگهداری برای موتور خودرو. تیم تحریریه ما به صورت مستمر محتوا را بر اساس استانداردهای روز به‌روزرسانی می‌کند.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <span>مجموع {posts.length} مقاله تخصصی منتشر شده است.</span>
          <Link
            href="/support"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
          >
            درخواست موضوع پیشنهادی
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
