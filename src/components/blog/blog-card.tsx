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
    <article className="flex flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm transition hover:-translate-y-2 hover:shadow-lg hover:shadow-slate-500/15">
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
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
            {published}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
            {post.readMinutes} دقیقه مطالعه
          </span>
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-200 px-2 py-1 text-slate-500">
              #{tag}
            </span>
          ))}
        </div>
        <Link href={`/blog/${post.slug}`} className="block text-lg font-semibold text-slate-900 transition hover:text-sky-600">
          {post.title}
        </Link>
        <p className="leading-7 text-slate-600 line-clamp-3">{post.excerpt}</p>
      </div>
      <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
        <span>{post.authorName}</span>
        <Link href={`/blog/${post.slug}`} className="text-sky-600 hover:text-sky-700">
          مطالعه مقاله →
        </Link>
      </div>
    </article>
  );
}
