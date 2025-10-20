import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/blog-article";
import { getBlogPostBySlug } from "@/lib/data";

type BlogPostPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "مقاله یافت نشد",
    };
  }

  return {
    title: `${post.title} | وبلاگ ZenLube`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const published = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
  }).format(new Date(post.publishedAt));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-white">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{post.authorName}</span>
          <span>•</span>
          <span>{published}</span>
          <span>•</span>
          <span>{post.readMinutes} دقیقه مطالعه</span>
        </div>
        {post.tags.length ? (
          <div className="flex flex-wrap gap-2 text-xs text-white/50">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/15 px-3 py-1">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="mt-8 h-72 w-full rounded-[32px] object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
        <BlogArticle content={post.content} />
      </div>
    </div>
  );
}
