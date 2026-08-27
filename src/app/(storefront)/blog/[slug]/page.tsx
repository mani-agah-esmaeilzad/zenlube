import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/blog-article";
import { getBlogPostBySlug } from "@/lib/data";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "مقاله یافت نشد",
    };
  }

  return {
    title: `${post.title} | وبلاگ Oilbar`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const published = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
  }).format(new Date(post.publishedAt));

  return (
    <div className="container-zen py-5 sm:py-6 md:py-8">
      <div className="mx-auto max-w-4xl space-y-5 text-text-strong sm:space-y-8">
        <header className="rounded-2xl border border-border bg-white p-4 sm:p-6 md:p-8">
          <span className="chip-zen inline-flex">راهنمای تخصصی Oilbar</span>
          <h1 className="mt-3 text-2xl font-black leading-[1.55] sm:text-3xl md:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            <span>{post.authorName}</span>
            <span>•</span>
            <span>{published}</span>
            <span>•</span>
            <span>{post.readMinutes} دقیقه مطالعه</span>
          </div>
          {post.tags.length ? (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
              {post.tags.map((tag) => (
                <span key={tag} className="chip-zen-muted">
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
            className="h-52 w-full rounded-2xl border border-border object-cover sm:h-72"
            loading="lazy"
          />
        ) : null}

        <div className="rounded-2xl border border-border bg-white p-4 sm:p-6 md:p-8">
          <BlogArticle content={post.content} />
        </div>
      </div>
    </div>
  );
}
