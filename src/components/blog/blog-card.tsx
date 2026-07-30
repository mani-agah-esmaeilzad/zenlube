import Link from "next/link";
import type { BlogPost } from "@/generated/prisma";

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  const published = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(post.publishedAt));

  return (
    <article className="panel-zen interactive-lift group flex h-full min-w-0 flex-col overflow-hidden rounded-[26px]">
      <Link href={`/blog/${post.slug}`} className="block bg-[linear-gradient(180deg,#F7F8FA_0%,#F2F5F8_100%)] p-3">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="h-36 w-full rounded-[18px] object-cover sm:h-44" loading="lazy" />
        ) : (
          <div className="flex h-36 items-center justify-center rounded-[18px] bg-[#171B23] text-sm font-bold text-white sm:h-44">راهنمای تخصصی روغن</div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-muted">
          <span className="chip-zen px-2.5 py-1">راهنمای خرید</span>
          <span>{published}</span>
          <span>{post.readMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
        </div>
        <Link href={`/blog/${post.slug}`} className="line-clamp-2 text-base font-bold leading-7 text-text-strong transition group-hover:text-primary-accent-strong">
          {post.title}
        </Link>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-text-muted">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs">
          <span className="min-w-0 truncate font-medium text-text-muted">{post.authorName}</span>
          <Link href={`/blog/${post.slug}`} className="font-bold text-primary-accent-strong">
            مطالعه مقاله
          </Link>
        </div>
      </div>
    </article>
  );
}
