import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/blog-article";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getBlogPostBySlug } from "@/lib/data";
import { StructuredData } from "@/components/seo/structured-data";
import { buildArticleStructuredData, buildBreadcrumbStructuredData, buildPageMetadata, SITE_URL } from "@/lib/seo";

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
      robots: { index: false, follow: true },
    };
  }

  return buildPageMetadata({
    title: post.seoTitle ?? `${post.title} | مجله اویل‌بار`,
    description: post.seoDescription ?? post.excerpt,
    pathname: `/blog/${encodeURIComponent(post.slug)}`,
    imageUrl: post.coverImage,
    type: "article",
  });
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
  const faqItems = normalizeBlogFaqItems(post.faqItems);
  const relatedBrands = Array.from(
    new Map(
      post.relatedProducts
        .filter((product) => product.brand)
        .map((product) => [product.brand.slug, product.brand] as const),
    ).values(),
  ).slice(0, 6);

  return (
    <div className="container-zen py-5 sm:py-6 md:py-8">
      <StructuredData data={buildArticleStructuredData(post)} />
      {faqItems.length ? <StructuredData data={buildFaqStructuredData(faqItems)} /> : null}
      <StructuredData data={buildBreadcrumbStructuredData([
        { name: "خانه", url: SITE_URL },
        { name: "مجله اویل‌بار", url: `${SITE_URL}/blog` },
        { name: post.title, url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}` },
      ])} />
      <div className="mx-auto max-w-4xl space-y-5 text-text-strong sm:space-y-8">
        <Breadcrumb items={[{ href: "/", label: "خانه" }, { href: "/blog", label: "مجله اویل‌بار" }, { label: post.title }]} />
        <header className="border-r-4 border-primary-accent-strong py-2 pr-4 sm:pr-6">
          <h1 className="text-2xl font-black leading-[1.55] sm:text-3xl md:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {post.category ? (
              <>
                <Link
                  className="font-extrabold text-primary-accent-strong"
                  href={`/blog?category=${encodeURIComponent(post.category.slug)}`}
                >
                  {post.category.title}
                </Link>
                <span>•</span>
              </>
            ) : null}
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

        {faqItems.length ? (
          <section className="rounded-[28px] border border-border bg-surface p-5">
            <h2 className="text-lg font-black text-text-strong">سوالات پرتکرار همین راهنما</h2>
            <div className="mt-4 divide-y divide-border">
              {faqItems.map((item) => (
                <details key={item.question} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-extrabold text-text-strong">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-sm leading-7 text-text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {relatedBrands.length ? (
          <section className="border-y border-border py-5">
            <h2 className="text-base font-black text-text-strong">برندهای مرتبط با این راهنما</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedBrands.map((brand) => (
                <Link
                  key={brand.id}
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-xs font-extrabold text-text transition hover:border-primary-accent-strong hover:text-primary-accent-strong"
                  href={`/brands/${encodeURIComponent(brand.slug)}`}
                >
                  راهنمای برند {brand.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {post.relatedProducts.length ? (
          <section className="rounded-[28px] border border-border bg-surface p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-text-strong">محصولات پیشنهادی مرتبط</h2>
                <p className="mt-1 text-xs leading-6 text-text-muted">این محصولات توسط ادمین برای همین راهنما انتخاب شده‌اند.</p>
              </div>
              <Link href="/products" className="text-link-zen inline-flex min-h-11 items-center px-2 text-xs font-extrabold">
                مشاهده همه محصولات
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {post.relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function normalizeBlogFaqItems(value: unknown): Array<{ question: string; answer: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as { question?: unknown; answer?: unknown };
      if (typeof candidate.question !== "string" || typeof candidate.answer !== "string") return null;
      return { question: candidate.question, answer: candidate.answer };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item));
}

function buildFaqStructuredData(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
