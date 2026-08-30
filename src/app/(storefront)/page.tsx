import Image from "next/image";
import Link from "next/link";
import type { ReactNode, SVGProps } from "react";

import { BlogCard } from "@/components/blog/blog-card";
import { HeroVehicleFinder } from "@/components/layout/hero-vehicle-finder";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getBestsellerProducts,
  getBrandsWithProductCount,
  getFeaturedProducts,
  getHighlightedCategories,
  getLatestBlogPosts,
  getPopularCars,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [categories, brands, cars, posts, featuredProducts, bestsellerProducts] = await Promise.all([
    getHighlightedCategories().catch(() => []),
    getBrandsWithProductCount().catch(() => []),
    getPopularCars(8).catch(() => []),
    getLatestBlogPosts(3).catch(() => []),
    getFeaturedProducts(8).catch(() => []),
    getBestsellerProducts(8).catch(() => []),
  ]);

  const selectedProducts = featuredProducts.length ? featuredProducts : bestsellerProducts;
  const selectedProductsTitle = featuredProducts.length ? "محصولات منتخب" : "محصولات پرفروش";
  const highlightedCategories = [...categories]
    .sort((left, right) => right._count.products - left._count.products)
    .slice(0, 8);
  const availableBrands = brands
    .filter((brand) => brand._count.products > 0)
    .sort((left, right) => right._count.products - left._count.products)
    .slice(0, 12);

  return (
    <div className="pb-6 md:pb-12">
      <section className="container-zen pt-4 md:pt-8">
        <div className="relative overflow-hidden border-b border-border bg-white">
          <div className="relative grid min-h-[350px] grid-cols-[minmax(0,1.25fr)_minmax(105px,0.75fr)] items-center gap-0 pt-3 sm:min-h-[400px] md:min-h-0 md:grid-cols-2 md:gap-8 md:py-8 lg:py-10">
            <div className="relative z-10 py-4 md:py-6">
              <h1 className="max-w-[13ch] text-[1.7rem] font-black leading-[1.45] tracking-[-0.035em] text-text-strong min-[390px]:text-[1.8rem] sm:text-4xl md:max-w-[12ch] md:text-5xl md:leading-[1.35] lg:text-[3.35rem]">
                روغن مناسب خودروی شما، <span className="text-primary-accent-strong">دقیق و مطمئن</span>
              </h1>
              <p className="mt-3 hidden max-w-lg text-sm leading-7 text-text-muted min-[390px]:block md:mt-5 md:text-base md:leading-8">
                روغن موتور، روغن گیربکس و فیلتر اصل را بر اساس مشخصات واقعی خودرو پیدا کنید و با ضمانت اصالت تحویل بگیرید.
              </p>
              <Link className="btn-secondary mt-5 md:mt-7" href="/products">
                مشاهده محصولات
              </Link>
            </div>

            <div className="relative h-full min-h-[300px] self-end md:min-h-0">
              <Image
                alt="مجموعه روغن و فیلتر خودرو Oilbar"
                className="absolute bottom-0 left-1/2 h-auto w-[210%] max-w-none -translate-x-1/2 object-contain sm:w-[145%] md:relative md:bottom-auto md:left-auto md:w-full md:max-w-[680px] md:translate-x-0"
                height={1024}
                priority
                sizes="(max-width: 767px) 62vw, 50vw"
                src="/generated/oilbar-hero-products.png"
                width={1536}
              />
            </div>
          </div>

          <div className="relative grid grid-cols-2 border-t border-border bg-white py-4 md:max-w-xl md:py-5">
            <HeroAssurance icon={<ShieldIcon className="size-6" />} label="ضمانت اصالت کالا" />
            <HeroAssurance className="border-r border-border" icon={<TruckIcon className="size-6" />} label="ارسال سراسری" />
          </div>
        </div>
      </section>

      {cars.length ? (
        <section className="mt-10 md:mt-12">
          <HeroVehicleFinder
            cars={cars.map((car) => ({
              engineType: car.engineType,
              id: car.id,
              manufacturer: car.manufacturer,
              model: car.model,
              slug: car.slug,
              viscosity: car.viscosity,
              yearFrom: car.yearFrom,
              yearTo: car.yearTo,
            }))}
            variant="compact"
          />
        </section>
      ) : null}

      <section className="container-zen mt-9 space-y-4 md:mt-14 md:space-y-6">
        <SectionHeader compactOnMobile href="/categories" subtitle="مسیر کوتاه‌تر برای رسیدن به کالای موردنیاز" title="دسته‌بندی محصولات" />
        {highlightedCategories.length > 0 ? (
          <div className="scrollbar-none -mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 xl:grid-cols-8">
            {highlightedCategories.map((category) => (
              <Link
                key={category.id}
                className="group flex w-[118px] shrink-0 snap-start flex-col items-center px-2 py-3 text-center transition hover:bg-surface-secondary md:w-auto md:px-3 md:py-4"
                href={`/categories/${category.slug}`}
              >
                {category.imageUrl ? (
                  <span className="mb-3 flex size-[76px] items-center justify-center overflow-hidden rounded-xl bg-surface-secondary md:size-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105" src={category.imageUrl} />
                  </span>
                ) : null}
                <span className="line-clamp-2 min-h-11 text-sm font-extrabold leading-6 text-text-strong">{category.name}</span>
                <span className="mt-1 text-[11px] font-medium text-text-muted">{category._count.products.toLocaleString("fa-IR")} محصول</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState description="پس از ثبت دسته‌بندی‌ها، مسیر خرید از اینجا شروع می‌شود." title="هنوز دسته‌بندی‌ای ثبت نشده است." />
        )}
      </section>

      {selectedProducts.length ? (
        <section className="container-zen mt-9 space-y-4 md:mt-14 md:space-y-6">
          <SectionHeader compactOnMobile href="/products" subtitle="انتخاب‌شده از موجودی واقعی فروشگاه" title={selectedProductsTitle} />
          <div className="scrollbar-none -mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 xl:grid-cols-4">
            {selectedProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="w-[calc(100vw-2.75rem)] max-w-[360px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {availableBrands.length > 0 ? (
        <section className="container-zen mt-9 space-y-4 md:mt-14 md:space-y-6">
          <SectionHeader compactOnMobile href="/brands" subtitle="فقط برندهایی که اکنون محصول فعال دارند" title="برندهای موجود" />
          <div className="scrollbar-none -mx-2 flex snap-x gap-3 overflow-x-auto px-2 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-0 md:overflow-visible md:border-y md:border-border md:px-0 lg:grid-cols-6">
            {availableBrands.map((brand) => (
              <Link
                key={brand.id}
                className="flex min-h-20 w-[156px] shrink-0 snap-start items-center justify-center border-l border-border px-4 py-4 text-center text-sm font-extrabold text-text transition last:border-l-0 hover:bg-surface-secondary hover:text-primary-accent-strong md:w-auto"
                href={`/products?brand=${brand.slug}`}
              >
                {brand.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={brand.name} className="h-10 w-auto max-w-[120px] object-contain" src={brand.imageUrl} />
                ) : (
                  brand.name
                )}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-zen mt-9 md:mt-14">
        <div className="grid gap-7 border-y border-[rgba(217,119,6,0.18)] bg-surface-tint py-7 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <h2 className="section-title">راهنمای انتخاب روغن</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-text-muted md:text-base md:leading-8">
              ویسکوزیته، استاندارد و تأییدیهٔ سازنده را با دفترچهٔ خودرو تطبیق دهید. انتخاب‌گر خودرو فقط بر پایهٔ اطلاعات ثبت‌شده، پیشنهاد سازگار نمایش می‌دهد.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link className="text-link-zen inline-flex min-h-11 items-center px-1 text-sm font-extrabold" href="/cars">
                انتخاب بر اساس خودرو
              </Link>
              <Link className="text-sm font-extrabold text-primary-accent-strong" href="/blog">
                مطالعه راهنماهای فنی ←
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <GuideNote number="۱" title="ویسکوزیته" text="گریدی مثل 5W-30 را با توصیهٔ سازندهٔ خودرو مطابقت دهید." />
            <GuideNote number="۲" title="استاندارد" text="API، ACEA و تأییدیهٔ سازنده را در صفحهٔ محصول بررسی کنید." />
          </div>
        </div>
      </section>

      {!!posts.length && (
        <section className="container-zen mt-9 space-y-4 md:mt-14 md:space-y-6">
          <SectionHeader compactOnMobile href="/blog" subtitle="نکات فنی برای انتخاب روغن، فیلتر و نگهداری خودرو" title="مجلهٔ فنی" />
          <div className="scrollbar-none -mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {posts.map((post) => (
              <div key={post.id} className="w-[82vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none">
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function HeroAssurance({ className = "", icon, label }: { className?: string; icon: ReactNode; label: string }) {
  return (
    <div className={`flex min-w-0 items-center justify-center gap-2.5 px-2 text-xs font-extrabold text-text sm:text-sm ${className}`}>
      <span className="shrink-0 text-primary-accent-strong">{icon}</span>
      <span className="line-clamp-2">{label}</span>
    </div>
  );
}

function GuideNote({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="border-t border-[rgba(217,119,6,0.18)] px-1 py-4 first:border-t-0 sm:first:border-t">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-dark text-xs font-black text-white">{number}</span>
        <p className="text-sm font-extrabold text-text-strong">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-7 text-text-muted">{text}</p>
    </div>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      <path d="M12 3 5.5 5.7v5.2c0 4.2 2.6 7.8 6.5 10.1 3.9-2.3 6.5-5.9 6.5-10.1V5.7L12 3Z" />
      <path d="m9.2 12 1.8 1.8 3.8-4" />
    </svg>
  );
}

function TruckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      <path d="M3 6h11v10H3zM14 10h3l4 4v2h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
