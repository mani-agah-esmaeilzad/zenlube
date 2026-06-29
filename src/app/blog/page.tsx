import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { getAllBlogPosts } from "@/lib/data";

export const metadata = {
  title: "وبلاگ Oilbar | راهنمای تخصصی روغن موتور",
  description:
    "جدیدترین مقالات آموزشی و تخصصی درباره انتخاب، نگهداری و مقایسه روغن موتور برای خودروهای مدرن.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <header className="rounded-[32px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] md:p-8">
        <p className="text-sm font-bold text-[#D97706]">آموزش و راهنما</p>
        <h1 className="mt-3 text-3xl font-black text-[#171B23] md:text-4xl">وبلاگ تخصصی Oilbar</h1>
        <p className="mt-3 max-w-4xl text-sm leading-8 text-[#667085]">
          مجموعه‌ای از تجربیات فنی، راهنمای خرید، مقایسه محصولات و نکات نگهداری برای موتور خودرو. تیم تحریریه ما به صورت مستمر محتوا را بر اساس استانداردهای روز به‌روزرسانی می‌کند.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#667085]">
          <span>مجموع {posts.length} مقاله تخصصی منتشر شده است.</span>
          <Link
            href="/support"
            className="rounded-full border border-[#E7E8EE] px-4 py-2 text-xs font-bold text-[#475467] transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706]"
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
          <div className="rounded-[28px] border border-dashed border-[#D0D5DD] bg-white p-10 text-center text-sm font-semibold text-[#667085]">
            هنوز مقاله‌ای ثبت نشده است.
          </div>
        )}
      </section>
    </div>
  );
}
