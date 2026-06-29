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
    <div className="container-zen py-6 md:py-8">
      <div className="mx-auto max-w-4xl space-y-8 text-[#171B23]">
        <header className="rounded-[32px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] md:p-8">
          <h1 className="text-3xl font-black leading-[1.6] md:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#667085]">
            <span>{post.authorName}</span>
            <span>•</span>
            <span>{published}</span>
            <span>•</span>
            <span>{post.readMinutes} دقیقه مطالعه</span>
          </div>
          {post.tags.length ? (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#667085]">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#E7E8EE] bg-[#F7F8FA] px-3 py-1">
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
            className="h-72 w-full rounded-[32px] border border-[#E7E8EE] object-cover"
            loading="lazy"
          />
        ) : null}

        <div className="rounded-[32px] border border-[#E7E8EE] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
          <BlogArticle content={post.content} />
        </div>
      </div>
    </div>
  );
}
