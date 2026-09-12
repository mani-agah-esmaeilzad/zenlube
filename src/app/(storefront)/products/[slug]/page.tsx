import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

import { EngagementTracker } from "@/components/analytics/engagement-tracker";
import { QuestionForm } from "@/components/forms/question-form";
import { CopySkuButton } from "@/components/product/copy-sku-button";
import { ProductDetailSections } from "@/components/product/product-detail-sections";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product/product-card";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker";
import { QuestionList } from "@/components/questions/question-list";
import { ReviewCard } from "@/components/review/review-card";
import { ReviewForm } from "@/components/review/review-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { StructuredData } from "@/components/seo/structured-data";
import {
  buildCompatibilityItems,
  buildProductFaqs,
  buildProductGalleryItems,
  buildProductImportantNotes,
  buildProductQuickFacts,
  buildProductSpecRows,
  extractEnglishProductLabel,
} from "@/lib/product-detail";
import prisma from "@/lib/prisma";
import { resolveProductPricing } from "@/lib/pricing";
import { buildBreadcrumbStructuredData, buildProductPageMetadata, buildProductStructuredData, SITE_URL } from "@/lib/seo";
import { cleanProductDescription } from "@/lib/product-description";
import { getAppSession } from "@/lib/session";
import { storefrontVisibleCarWhere, storefrontVisibleProductWhere } from "@/lib/storefront-visibility";

type ProductPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductPageData(slug);

  return product
    ? buildProductPageMetadata({
        baseUrl: SITE_URL,
        description: product.description,
        imageUrl: product.imageUrl,
        name: product.name,
        slug: product.slug,
      })
    : { title: "محصول یافت نشد", robots: { index: false, follow: true } };
}

const getProductPageData = cache(async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: storefrontVisibleProductWhere({ slug }),
    include: {
      brand: true,
      category: true,
      promotion: true,
      carMappings: {
        where: { car: storefrontVisibleCarWhere() },
        include: { car: true },
      },
      reviews: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              brand: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
      questions: {
        where: { status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return product ? { ...product, description: cleanProductDescription(product.description) } : null;
});

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [session, product, requestHeaders] = await Promise.all([getAppSession(), getProductPageData(slug), headers()]);
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;

  if (!product) notFound();

  const wishlistItem = userId
    ? await prisma.wishlistItem.findUnique({
        where: { userId_productId: { userId, productId: product.id } },
        select: { id: true },
      })
    : null;

  const isTorobCrawler = /torob/i.test(requestHeaders.get("user-agent") ?? "");
  // Torob's API already receives the canonical primary image. Its HTML crawler
  // must not mistake the five related-product cards for this product's gallery.
  const relatedProducts = isTorobCrawler
    ? []
    : await prisma.product.findMany({
        where: storefrontVisibleProductWhere({
          id: { not: product.id },
          OR: [
            { categoryId: product.categoryId },
            { brandId: product.brandId },
            { tags: { hasSome: product.tags.slice(0, 4) } },
          ],
        }),
        take: 5,
        include: {
          brand: true,
          category: true,
          promotion: true,
          carMappings: {
            where: { car: storefrontVisibleCarWhere() },
            include: { car: true },
          },
        },
        orderBy: [{ isFeatured: "desc" }, { reviewCount: "desc" }, { updatedAt: "desc" }],
      });
  const baseUrl = SITE_URL;
  const pricing = resolveProductPricing(product);
  const isAvailable = product.stock > 0 && pricing.effectivePrice > 0;
  const galleryItems = buildProductGalleryItems(product);
  const hasGalleryMedia = galleryItems.length > 0;
  const specRows = buildProductSpecRows(product);
  const quickFacts = buildProductQuickFacts(product);
  const compatibleCars = buildCompatibilityItems(product);
  const importantNotes = buildProductImportantNotes(product);
  const faqs = buildProductFaqs(product);
  const englishTitle = extractEnglishProductLabel(product.name);
  const hasReviewData = product.reviewCount > 0 && product.averageRating != null;
  const descriptionPreview = product.description?.trim();

  const breadcrumbStructuredData = buildBreadcrumbStructuredData([
    { name: "خانه", url: baseUrl },
    { name: product.category.name, url: `${baseUrl}/products?category=${encodeURIComponent(product.category.slug)}` },
    { name: product.brand.name, url: `${baseUrl}/products?brand=${encodeURIComponent(product.brand.slug)}` },
    { name: product.name, url: `${baseUrl}/products/${encodeURIComponent(product.slug)}` },
  ]);

  const productStructuredData = buildProductStructuredData({
    averageRating: product.averageRating ? Number(product.averageRating) : null,
    baseUrl,
    brandName: product.brand.name,
    categoryName: product.category.name,
    description: product.description,
    imageUrl: product.imageUrl,
    inStock: isAvailable,
    name: product.name,
    price: pricing.effectivePrice,
    reviewCount: product.reviewCount,
    sku: product.sku,
    slug: product.slug,
    specifications: specRows,
  });

  const questionItems = (product.questions ?? []).map((question) => ({
    id: question.id,
    authorName: question.authorName,
    question: question.question,
    answer: question.answer,
    status: question.status,
    createdAt: question.createdAt,
    answeredAt: question.answeredAt,
  }));

  return (
    <div className="container-zen pb-[calc(11rem+env(safe-area-inset-bottom,0px))] pt-5 sm:pt-6 md:pt-8 lg:pb-8">
      <StructuredData data={productStructuredData} />
      <StructuredData data={breadcrumbStructuredData} />

      <EngagementTracker entityType="product" entityId={product.id} eventType="product_view" metadata={{ slug: product.slug }} />
      <RecentlyViewedTracker productId={product.id} />

      <div className="mb-5 border-b border-border/70 pb-3">
        <Breadcrumb
          items={[
            { href: "/", label: "خانه" },
            { href: `/categories/${product.category.slug}`, label: product.category.name },
            { href: `/products?brand=${product.brand.slug}`, label: product.brand.name },
            { label: product.name },
          ]}
        />
      </div>

      <section
        id="product-detail"
        className={hasGalleryMedia ? "grid gap-8 sm:gap-10 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] xl:gap-14 xl:items-start" : "max-w-4xl"}
        itemScope
        itemType="https://schema.org/Product"
      >
        <meta content={`${baseUrl}/products/${product.slug}`} itemProp="url" />
        {product.sku ? <meta content={product.sku} itemProp="sku" /> : null}
        {hasGalleryMedia ? (
          <div className="min-w-0">
            <ProductGallery items={galleryItems} title={product.name} />
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
            <Link className="inline-flex min-h-11 items-center text-primary-accent-strong hover:text-[#B45309] md:min-h-9" href={`/products?brand=${product.brand.slug}`}>
              {product.brand.name}
            </Link>
            <span className="text-text-soft">•</span>
            <Link className="inline-flex min-h-11 items-center text-text-muted hover:text-text-strong md:min-h-9" href={`/categories/${product.category.slug}`}>
              {product.category.name}
            </Link>
          </div>

          <h1 className="mt-3 text-[clamp(1.7rem,1.25vw+1.1rem,2.35rem)] font-black leading-[1.5] tracking-[-0.04em] text-text-strong" itemProp="name">
            {product.name}
          </h1>

          {englishTitle ? (
            <p className="mt-2 text-sm font-medium tracking-[0.01em] text-text-muted sm:text-base">{englishTitle}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-muted">
            {product.sku ? <CopySkuButton sku={product.sku} /> : null}
            {hasReviewData ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-primary-accent-strong">★</span>
                <span className="font-bold text-text-strong">{Number(product.averageRating).toLocaleString("fa-IR")}</span>
                <span>({product.reviewCount.toLocaleString("fa-IR")} نظر)</span>
              </span>
            ) : null}
          </div>

          <div className={`mt-4 inline-flex items-center gap-2 text-xs font-extrabold ${isAvailable ? "text-success" : "text-error"}`}>
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${isAvailable ? "bg-success" : "bg-error"}`} />
            {isAvailable ? "موجود در انبار" : "ناموجود"}
          </div>

          {descriptionPreview ? (
            <p className="mt-5 line-clamp-3 text-sm leading-8 text-text-muted">{descriptionPreview}</p>
          ) : null}

          {quickFacts.length ? (
            <dl className="-mx-4 mt-5 flex overflow-x-auto border-y border-border px-4 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
              {quickFacts.map((item) => (
                <div key={item.label} className="min-w-[10rem] border-l border-border px-4 py-3 first:pr-0 last:border-l-0 sm:min-w-0">
                  <dt className="text-[11px] font-bold text-text-muted">{item.label}</dt>
                  <dd className="mt-1 truncate text-sm font-extrabold text-text-strong">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-6">
            <ProductPurchasePanel
              compareHref="/products/compare"
              isAvailable={isAvailable}
              originalPrice={pricing.hasDiscount ? pricing.basePrice : null}
              price={pricing.effectivePrice}
              productId={product.id}
              promotionLabel={pricing.promotionActive ? pricing.label : null}
              stock={product.stock}
              wishlistActive={Boolean(wishlistItem)}
            />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <ProductDetailSections
          compatibleCars={compatibleCars}
          description={product.description}
          faqs={faqs}
          importantNotes={importantNotes}
          specRows={specRows}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]" id="product-reviews">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-black text-text-strong">دیدگاه کاربران</h2>
              {hasReviewData ? (
                <p className="mt-2 text-sm text-text-muted">
                  میانگین امتیاز {Number(product.averageRating).toLocaleString("fa-IR")} از ۵ بر اساس {product.reviewCount.toLocaleString("fa-IR")} نظر
                </p>
              ) : (
                <p className="mt-2 text-sm text-text-muted">هنوز امتیاز ثبت‌شده‌ای برای این کالا وجود ندارد.</p>
              )}
            </div>
            {product.reviewCount > 0 ? <span className="text-xs font-bold text-text-muted">{product.reviewCount.toLocaleString("fa-IR")} نظر</span> : null}
          </div>

          <div className="mt-5 space-y-4">
            {product.reviews.length ? (
              product.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <EmptyState compact description="اولین تجربه خرید و استفاده از این کالا را با بقیه کاربران به اشتراک بگذارید." title="هنوز نظری برای این محصول ثبت نشده است" />
            )}
          </div>
        </div>

        <ReviewForm productId={product.id} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2" id="product-questions">
        <QuestionForm type="product" slug={product.slug} title={`پرسش درباره ${product.brand.name} ${product.name}`} />
        <QuestionList items={questionItems} emptyMessage="هنوز پرسشی برای این محصول ثبت نشده است." />
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-8 space-y-4">
          <div className="section-heading">
            <div>
              <h2 className="section-title">محصولات مرتبط</h2>
              <p className="section-subtitle">کالاهای هم‌دسته یا هم‌برند برای تصمیم‌گیری سریع‌تر</p>
            </div>
            <Link className="inline-flex min-h-11 items-center text-sm font-bold text-primary-accent-strong" href="/products">
              مشاهده همه
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
