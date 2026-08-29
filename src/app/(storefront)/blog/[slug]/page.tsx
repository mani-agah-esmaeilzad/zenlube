import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/blog-article";
import { Breadcrumb } from "@/components/ui/breadcrumb";
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
        <Breadcrumb items={[{ href: "/", label: "خانه" }, { href: "/blog", label: "وبلاگ" }, { label: post.title }]} />
        <header className="border-r-4 border-primary-accent-strong py-2 pr-4 sm:pr-6">
          <h1 className="text-2xl font-black leading-[1.55] sm:text-3xl md:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            <span>{post.authorName}</span>
            <span>•</span>
            <span>{published}</span>
            <span>•</span>
            <span>{post.readMinutes} دقیقه مطالعه</span>
          </div>
          {post.tags.length ? (
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-text-muted">
              {post.tags.map((tag) => (
                <span key={tag}>
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
            className="h-52 w-full rounded-xl object-cover sm:h-72"
            loading="lazy"
          />
        ) : null}

        <div className="border-t border-border pt-6 sm:pt-8">
          <BlogArticle content={post.content} />
        </div>
      </div>
    </div>
  );
}
