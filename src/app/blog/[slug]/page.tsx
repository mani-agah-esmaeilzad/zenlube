import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/blog-article";
import { getBlogPostBySlug } from "@/lib/data";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

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
    <div className="w-full bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl space-y-8 px-6 text-slate-900">
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>{post.authorName}</span>
            <span>•</span>
            <span>{published}</span>
            <span>•</span>
            <span>{post.readMinutes} دقیقه مطالعه</span>
          </div>
          {post.tags.length ? (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1">
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
            className="h-72 w-full rounded-[32px] border border-slate-200 object-cover"
            loading="lazy"
          />
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <BlogArticle content={post.content} />
        </div>
      </div>
    </div>
  );
}
