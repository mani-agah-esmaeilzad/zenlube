import Link from "next/link";
import type { BlogPost } from "@/generated/prisma";

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  const published = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(post.publishedAt));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_18px_44px_rgba(17,24,39,0.1)]">
      <Link href={`/blog/${post.slug}`} className="block bg-[#F7F7F8] p-3">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="h-44 w-full rounded-xl object-cover" loading="lazy" />
        ) : (
          <div className="flex h-44 items-center justify-center rounded-xl bg-[#111827] text-sm font-bold text-white">راهنمای تخصصی روغن</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#6B7280]">
          <span className="rounded-full bg-red-50 px-2.5 py-1 font-bold text-red-600">راهنمای خرید</span>
          <span>{published}</span>
          <span>{post.readMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
        </div>
        <Link href={`/blog/${post.slug}`} className="line-clamp-2 text-base font-bold leading-7 text-[#111827] transition group-hover:text-red-600">
          {post.title}
        </Link>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#6B7280]">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-5 text-xs">
          <span className="font-medium text-[#6B7280]">{post.authorName}</span>
          <Link href={`/blog/${post.slug}`} className="font-bold text-red-600">
            مطالعه مقاله
          </Link>
        </div>
      </div>
    </article>
  );
}
