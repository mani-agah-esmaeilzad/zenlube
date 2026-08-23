import Link from "next/link";
import type { BlogPost } from "@/generated/prisma";

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  const published = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(post.publishedAt));

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white">
      <Link className="block bg-surface-secondary" href={`/blog/${post.slug}`}>
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={post.title} className="h-40 w-full object-cover sm:h-44" loading="lazy" src={post.coverImage} />
        ) : (
          <div className="flex h-40 items-center justify-center bg-primary text-sm font-bold text-white sm:h-44">راهنمای تخصصی روغن</div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-muted">
          <span>{published}</span>
          <span>{post.readMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
        </div>
        <Link className="line-clamp-2 text-base font-bold leading-7 text-text-strong transition group-hover:text-primary-accent-strong" href={`/blog/${post.slug}`}>
          {post.title}
        </Link>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-text-muted">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs">
          <span className="min-w-0 truncate font-medium text-text-muted">{post.authorName}</span>
          <Link className="font-bold text-primary-accent-strong" href={`/blog/${post.slug}`}>
            مطالعه مقاله
          </Link>
        </div>
      </div>
    </article>
  );
}
