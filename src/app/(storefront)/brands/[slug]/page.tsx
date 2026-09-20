import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogCard } from "@/components/blog/blog-card";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import { buildBrandPageStructuredData, getBrandSeoContent } from "@/lib/brand-seo";
import { getAllProductsWithFilters, getBrandLandingBySlug } from "@/lib/data";
import { getRelatedBrandArticles } from "@/lib/data/brand-articles";
import { getPaginationParams } from "@/lib/pagination";
import { buildPageMetadata, serializeStructuredData } from "@/lib/seo";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params, searchParams }: BrandPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const brandLanding = await getBrandLandingBySlug(slug);
  if (!brandLanding) {
    return buildPageMetadata({
      pathname: `/brands/${encodeURIComponent(slug)}`,
      title: "برند پیدا نشد | اویل‌بار",
      description: "این برند در فروشگاه اویل‌بار پیدا نشد.",
      noindex: true,
    });
  }
  const { page } = getPaginationParams(query, { defaultPageSize: 12, maxPageSize: 12 });
  const seo = getBrandSeoContent(brandLanding.brand.slug, brandLanding.brand.name);

  return buildPageMetadata({
    pathname: page > 1 ? `/brands/${encodeURIComponent(slug)}?page=${page}` : `/brands/${encodeURIComponent(slug)}`,
    title: page > 1
      ? `خرید محصولات ${brandLanding.brand.name} | صفحه ${page.toLocaleString("fa-IR")} | اویل‌بار`
      : `خرید محصولات ${brandLanding.brand.name} اصل | قیمت و موجودی | اویل‌بار`,
    description: seo.intro,
    imageUrl: brandLanding.brand.imageUrl,
  });
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { page } = getPaginationParams(query, { defaultPageSize: 12, maxPageSize: 12 });
  const brandLandingPromise = getBrandLandingBySlug(slug);
  const productsPromise = getAllProductsWithFilters({ brand: slug, page, pageSize: 12, sort: "latest" });
  const brandLanding = await brandLandingPromise;

  if (!brandLanding) notFound();

  const [productsResult, relatedArticles] = await Promise.all([
    productsPromise,
    getRelatedBrandArticles(brandLanding.brand.slug, brandLanding.brand.name),
  ]);

  const { brand, categorySummaries, availableCount, unavailableCount } = brandLanding;
  const seo = getBrandSeoContent(brand.slug, brand.name);
  const { items, pageInfo } = productsResult;
  const structuredData = buildBrandPageStructuredData({
    brandName: brand.name,
    brandSlug: brand.slug,
    description: seo.intro,
    productCount: pageInfo.total,
  });

  return (
    <div className="container-zen space-y-7 py-5 sm:py-6 md:py-8">
      <script
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}
        type="application/ld+json"
      />
      <Breadcrumb items={[{ href: "/", label: "خانه" }, { href: "/brands", label: "برندها" }, { label: brand.name }]} />

      <StorefrontPageIntro
        compact
        actions={(
          <Link className="inline-flex min-h-11 items-center px-1 text-sm font-extrabold text-primary-accent-strong transition hover:text-[#B45309] md:min-h-10" href={`/products?brand=${brand.slug}`}>
            مشاهده در فروشگاه
          </Link>
        )}
        description={seo.intro}
        meta={`${pageInfo.total.toLocaleString("fa-IR")} محصول · ${availableCount.toLocaleString("fa-IR")} موجود`}
        title={`محصولات ${brand.name}`}
        tone="plain"
      />

      <section className="grid gap-4 border-y border-border py-4 md:grid-cols-3">
        <Metric label="محصولات این برند" value={pageInfo.total.toLocaleString("fa-IR")} />
        <Metric label="موجود برای خرید" value={availableCount.toLocaleString("fa-IR")} />
        <Metric label="ناموجود یا در انتظار قیمت" value={unavailableCount.toLocaleString("fa-IR")} />
      </section>

      {seo.searchLinks.length ? (
        <section>
          <h2 className="text-base font-extrabold text-text-strong">جستجوهای پرکاربرد {brand.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {seo.searchLinks.map((item) => (
              <Link key={item.href} className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-xs font-extrabold text-text transition hover:border-primary-accent-strong hover:text-primary-accent-strong" href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {categorySummaries.length ? (
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-extrabold text-text-strong">دسته‌های فعال {brand.name}</h2>
            <span className="text-xs font-bold text-text-muted">{categorySummaries.length.toLocaleString("fa-IR")} دسته</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categorySummaries.map((category) => (
              <Link key={category.slug} className="min-h-20 border-r-2 border-border bg-white px-4 py-3 transition hover:border-primary-accent-strong hover:bg-surface-tint" href={`/products?brand=${brand.slug}&category=${category.slug}`}>
                <span className="block text-sm font-extrabold text-text-strong">{category.name}</span>
                <span className="mt-1 block text-xs text-text-muted">{category.count.toLocaleString("fa-IR")} محصول</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-extrabold text-text-strong">محصولات {brand.name}</h2>
          <Link className="inline-flex min-h-10 items-center text-xs font-extrabold text-primary-accent-strong" href={`/products?brand=${brand.slug}`}>
            فیلتر پیشرفته محصولات
          </Link>
        </div>
        {items.length ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((product, index) => (
              <ProductCard key={product.id} priority={index === 0} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState compact title={`فعلاً محصولی برای ${brand.name} ثبت نشده است`} />
        )}
        <Pagination pageInfo={pageInfo} pathname={`/brands/${brand.slug}`} searchParams={query} />
      </section>

      <section className="grid gap-6 border-t border-border pt-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-text-strong">راهنمای خرید محصولات {brand.name}</h2>
          {seo.body.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-8 text-text-muted">{paragraph}</p>
          ))}
        </div>
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-text-strong">سوالات پرتکرار</h2>
          {seo.faq.map((item) => (
            <details key={item.question} className="group border-b border-border py-3">
              <summary className="cursor-pointer list-none text-sm font-extrabold text-text-strong">
                {item.question}
              </summary>
              <p className="mt-2 text-xs leading-7 text-text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {relatedArticles.length ? (
        <section className="border-t border-border pt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-text-strong">راهنماهای مرتبط با {brand.name}</h2>
              <p className="mt-1 text-xs leading-6 text-text-muted">مقایسه‌ها و نکات فنی مجله اویل‌بار برای انتخاب آگاهانه‌تر</p>
            </div>
            <Link className="inline-flex min-h-10 items-center text-xs font-extrabold text-primary-accent-strong" href="/blog">
              مشاهده مجله اویل‌بار
            </Link>
          </div>
          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedArticles.map((article) => (
              <BlogCard key={article.id} post={article} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-black text-text-strong">{value}</p>
      <p className="mt-1 text-xs font-bold text-text-muted">{label}</p>
    </div>
  );
}
