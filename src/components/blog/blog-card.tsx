import Link from "next/link";
import type { BlogPost } from "@/generated/prisma";

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  const published = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(post.publishedAt));
  const hasCover = Boolean(post.coverImage);

  return (
    <article
      className={hasCover
        ? "group flex h-full min-w-0 flex-col border-b border-border pb-5"
        : "group min-w-0 border-b border-border py-4 md:col-span-2 xl:col-span-3"}
    >
      {post.coverImage ? (
        <Link className="mb-4 block overflow-hidden rounded-xl bg-surface-secondary" href={`/blog/${post.slug}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={post.title}
            className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-44"
            loading="lazy"
            src={post.coverImage}
          />
        </Link>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-text-muted">
          <span>{published}</span>
          <span>{post.readMinutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
        </div>
        <Link
          className="inline-flex min-h-11 items-center text-base font-extrabold leading-7 text-text-strong transition group-hover:text-primary-accent-strong md:min-h-8"
          href={`/blog/${post.slug}`}
        >
          <span className="line-clamp-2">{post.title}</span>
        </Link>
        <p className={`mt-2 line-clamp-3 text-sm leading-7 text-text-muted ${hasCover ? "" : "max-w-3xl"}`}>{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs">
          <span className="min-w-0 truncate font-medium text-text-muted">{post.authorName}</span>
          <Link className="inline-flex min-h-11 shrink-0 items-center font-extrabold text-primary-accent-strong md:min-h-8" href={`/blog/${post.slug}`}>
            مطالعه مقاله
          </Link>
        </div>
      </div>
    </article>
  );
}
