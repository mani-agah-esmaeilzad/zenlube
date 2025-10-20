import Link from "next/link";
import type { BlogPost } from "@/generated/prisma";

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  const published = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
  }).format(new Date(post.publishedAt));

  return (
    <article className="flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 transition hover:-translate-y-2 hover:border-purple-400/60">
      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="h-48 w-full rounded-2xl object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-purple-200">
          <span className="rounded-full border border-purple-300/40 bg-purple-500/10 px-2 py-1">
            {published}
          </span>
          <span className="rounded-full border border-purple-300/40 bg-purple-500/10 px-2 py-1">
            {post.readMinutes} دقیقه مطالعه
          </span>
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 px-2 py-1 text-white/60">
              #{tag}
            </span>
          ))}
        </div>
        <Link href={`/blog/${post.slug}`} className="block text-lg font-semibold text-white transition hover:text-purple-200">
          {post.title}
        </Link>
        <p className="leading-7 text-white/70 line-clamp-3">{post.excerpt}</p>
      </div>
      <div className="mt-auto flex items-center justify-between text-xs text-white/50">
        <span>{post.authorName}</span>
        <Link href={`/blog/${post.slug}`} className="text-purple-200 hover:text-purple-100">
          مطالعه مقاله →
        </Link>
      </div>
    </article>
  );
}
