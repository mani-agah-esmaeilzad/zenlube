import Link from "next/link";
import type { BlogPost } from "@/generated/prisma";

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  const published = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(post.publishedAt));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#E7E8EE] bg-white transition hover:-translate-y-1 hover:border-[#F5C56B] hover:shadow-[0_18px_44px_rgba(17,24,39,0.1)]">
      <Link href={`/blog/${post.slug}`} className="block bg-[#F7F7F8] p-3">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="h-44 w-full rounded-[18px] object-cover" loading="lazy" />
        ) : (
          <div className="flex h-44 items-center justify-center rounded-[18px] bg-[#171B23] text-sm font-bold text-white">راهنمای تخصصی روغن</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#6B7280]">
          <span className="rounded-full bg-[#FFF8E8] px-2.5 py-1 font-bold text-[#D97706]">راهنمای خرید</span>
          <span>{published}</span>
          <span>{post.readMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
        </div>
        <Link href={`/blog/${post.slug}`} className="line-clamp-2 text-base font-bold leading-7 text-[#171B23] transition group-hover:text-[#D97706]">
          {post.title}
        </Link>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#6B7280]">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-5 text-xs">
          <span className="font-medium text-[#6B7280]">{post.authorName}</span>
          <Link href={`/blog/${post.slug}`} className="font-bold text-[#D97706]">
            مطالعه مقاله
          </Link>
        </div>
      </div>
    </article>
  );
}
