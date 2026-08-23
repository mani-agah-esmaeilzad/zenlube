import Image from "next/image";
import Link from "next/link";

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

const heroTrust = ["ضمانت اصالت کالا", "ارسال به سراسر کشور", "مشاوره تخصصی انتخاب محصول"];

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

  return (
    <div className="pb-14">
      <section className="container-zen pt-6 md:pt-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div>
            <p className="text-sm font-bold text-primary-accent-strong">فروشگاه تخصصی محصولات خودرو</p>
            <h1 className="t-display mt-3 max-w-[16ch]">روغن اصل، انتخاب دقیق، خرید مطمئن</h1>
            <p className="mt-4 max-w-xl text-sm leading-8 text-text-muted sm:text-base">
              روغن موتور، روغن گیربکس و فیلترهای اصلی را بر اساس برند، ویسکوزیته یا مدل خودرو پیدا کنید و با ضمانت اصالت تحویل بگیرید.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary w-full sm:w-auto" href="/products">
                مشاهده محصولات
              </Link>
              <Link className="btn-outline w-full sm:w-auto" href="/brands">
                مشاهده برندها
              </Link>
            </div>
            <ul className="mt-6 space-y-2 text-xs font-bold text-text sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:space-y-0 sm:text-sm">
              {heroTrust.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-accent-strong" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[640px]">
            <Image
              alt="محصولات ویژه Oilbar"
              className="relative z-10 h-auto w-full object-contain"
              height={1024}
              priority
              src="/generated/oilbar-hero-products.png"
              width={1536}
            />
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

      <section className="container-zen mt-10 space-y-5 md:mt-14">
        <SectionHeader href="/categories" subtitle="روغن موتور، گیربکس، فیلتر و لوازم مصرفی" title="خرید بر اساس دسته‌بندی" />
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                className="group rounded-2xl border border-border bg-white px-3 py-4 text-center transition hover:border-[rgba(217,119,6,0.28)]"
                href={`/categories/${category.slug}`}
              >
                <span className="mx-auto mb-3 flex size-12 items-center justify-center overflow-hidden rounded-xl bg-surface-secondary text-sm font-extrabold text-primary-accent-strong">
                  {category.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="h-full w-full object-contain p-2" src={category.imageUrl} />
                  ) : (
                    category.name.trim().charAt(0)
                  )}
                </span>
                <span className="line-clamp-2 text-sm font-bold leading-6 text-text-strong">{category.name}</span>
                <span className="mt-1 block text-xs text-text-muted">{category._count.products.toLocaleString("fa-IR")} محصول</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState description="پس از ثبت دسته‌بندی‌ها، مسیر خرید از اینجا شروع می‌شود." title="هنوز دسته‌بندی‌ای ثبت نشده است." />
        )}
      </section>

      {selectedProducts.length ? (
        <section className="container-zen mt-10 space-y-5 md:mt-14">
          <SectionHeader href="/products" subtitle="کالاهای منتخب بر اساس موجودی و مشخصات فنی" title={selectedProductsTitle} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {selectedProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {brands.length > 0 ? (
        <section className="container-zen mt-10 space-y-5 md:mt-14">
          <SectionHeader href="/brands" subtitle="برندهای تخصصی روغن و فیلتر موجود در فروشگاه" title="برندهای معتبر" />
          <div className="grid grid-cols-2 border-y border-border sm:grid-cols-3 lg:grid-cols-6">
            {brands.slice(0, 12).map((brand) => (
              <Link
                key={brand.id}
                className="flex min-h-20 items-center justify-center border-b border-l border-border px-4 py-5 text-center text-sm font-extrabold text-text transition hover:bg-surface-secondary hover:text-primary-accent-strong"
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

      <section className="container-zen mt-10 md:mt-14">
        <div className="grid gap-8 border-y border-border py-8 md:grid-cols-3 md:gap-10">
          <TrustItem description="کالاها از منابع معتبر تامین می‌شوند و مشخصات فنی آن‌ها قابل بررسی است." title="اصالت کالا" />
          <TrustItem description="ویسکوزیته، استاندارد و سازگاری با خودرو برای انتخاب دقیق‌تر در دسترس است." title="انتخاب تخصصی" />
          <TrustItem description="سفارش‌ها بسته‌بندی می‌شوند و به سراسر کشور ارسال می‌گردند." title="ارسال سراسری" />
        </div>
      </section>

      <section className="container-zen mt-10 md:mt-14">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h2 className="section-title">راهنمای انتخاب روغن</h2>
            <p className="section-subtitle">
              اگر ویسکوزیته مناسب خودرو را نمی‌دانید، از دفترچه خودرو استفاده کنید. مشخصات فنی هر محصول فقط در صورت وجود در داده واقعی نمایش داده می‌شود.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-secondary w-full sm:w-auto" href="/cars">
                انتخاب بر اساس خودرو
              </Link>
              <Link className="btn-outline w-full sm:w-auto" href="/blog">
                مطالب فنی و راهنما
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <GuideNote title="ویسکوزیته" text="گریدهایی مثل 5W-30 یا 10W-40 را با توصیه سازنده خودرو مطابقت دهید." />
            <GuideNote title="استاندارد" text="API، ACEA و تاییدیه سازنده را در صفحه محصول بررسی کنید." />
          </div>
        </div>
      </section>

      {!!posts.length && (
        <section className="container-zen mt-10 space-y-5 md:mt-14">
          <SectionHeader href="/blog" subtitle="نکات فنی برای انتخاب روغن، فیلتر و نگهداری خودرو" title="راهنمای خرید" />
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustItem({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-text-strong">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-text-muted">{description}</p>
    </div>
  );
}

function GuideNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-secondary px-4 py-4">
      <p className="text-sm font-extrabold text-text-strong">{title}</p>
      <p className="mt-2 text-sm leading-7 text-text-muted">{text}</p>
    </div>
  );
}
