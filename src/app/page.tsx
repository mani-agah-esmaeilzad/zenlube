import Link from "next/link";
import { HeroBanner } from "@/components/layout/hero-banner";
import { StatsBar } from "@/components/layout/stats-bar";
import { CategoryCard } from "@/components/catalog/category-card";
import { BrandPill } from "@/components/catalog/brand-pill";
import { CarCard } from "@/components/catalog/car-card";
import { ProductCard } from "@/components/product/product-card";
import { ReviewCard } from "@/components/review/review-card";
import { ImageMosaic } from "@/components/gallery/image-mosaic";
import { BlogCard } from "@/components/blog/blog-card";
import {
  getActiveBanners,
  getBestsellerProducts,
  getBrandsWithProductCount,
  getFeaturedProducts,
  getGalleryImages,
  getHighlightedCategories,
  getLatestBlogPosts,
  getLatestReviews,
  getPopularCars,
} from "@/lib/data";

export const revalidate = 0;

const valueProps = [
  {
    title: "ارسال سریع و سراسری",
    description: "تحویل اکسپرس در تهران و ارسال حداکثر ۴۸ ساعته به تمام استان‌ها",
    icon: "🚚",
  },
  {
    title: "تضمین اصالت کالا",
    description: "تمام محصولات با گارانتی کتبی واردکننده رسمی تحویل می‌گردد",
    icon: "🔒",
  },
  {
    title: "مشاوره تخصصی رایگان",
    description: "پیش از خرید، با کارشناس فنی ما تماس بگیرید و بهترین انتخاب را داشته باشید",
    icon: "🛠️",
  },
];

export default async function Home() {
  const [
    banners,
    categories,
    featuredProducts,
    bestsellerProducts,
    brands,
    cars,
    latestReviews,
    galleryImages,
    latestBlogPosts,
  ] = await Promise.all([
    getActiveBanners(),
    getHighlightedCategories(),
    getFeaturedProducts(6),
    getBestsellerProducts(6),
    getBrandsWithProductCount(),
    getPopularCars(4),
    getLatestReviews(6),
    getGalleryImages(3),
    getLatestBlogPosts(3),
  ]);

  const heroBanner = banners.find((banner) => banner.position === "homepage-hero") ?? banners[0];
  const secondaryBanner = banners.find((banner) => banner.position === "homepage-secondary");

  const stats = [
    {
      label: "محصولات فعال",
      value: `${featuredProducts.length + bestsellerProducts.length}+`,
      description: "برترین روغن‌های موتور از برندهای معتبر جهانی",
    },
    {
      label: "برندهای همکار",
      value: `${brands.length}`,
      description: "شبکه تامین رسمی با ضمانت اصالت",
    },
    {
      label: "خودروهای پشتیبانی شده",
      value: `${cars.length * 5}+`,
      description: "پوشش خودروهای اروپایی، آسیایی و داخلی",
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12 sm:py-20">
      {heroBanner ? <HeroBanner banner={heroBanner} /> : null}

      <StatsBar stats={stats} />

      <section className="grid gap-4 sm:grid-cols-3">
        {valueProps.map((prop) => (
          <div
            key={prop.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-500/15"
          >
            <span className="text-3xl">{prop.icon}</span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{prop.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{prop.description}</p>
          </div>
        ))}
      </section>

      {!!galleryImages.length && (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-slate-900">
            <h2 className="text-2xl font-semibold">لحظه‌هایی از پشت‌صحنه و بررسی‌ها</h2>
            <Link href="/support" className="text-sm text-sky-600 hover:text-sky-700">
              رزرو بازدید حضوری
            </Link>
          </div>
          <ImageMosaic images={galleryImages} />
        </section>
      )}

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">خرید بر اساس دسته‌بندی</h2>
            <p className="mt-2 text-sm text-slate-500">
              بر اساس نوع موتور و استاندارد مورد نیاز خود، دسته‌بندی مناسب را انتخاب کنید.
            </p>
          </div>
          <Link href="/categories" className="text-sm text-sky-600 hover:text-sky-700">
            مشاهده همه
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {!!featuredProducts.length && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">محصولات ویژه فنی</h2>
              <p className="mt-2 text-sm text-slate-500">
                انتخاب متخصصان ZenLube برای خودروهایی که عملکرد بالا و دوام طولانی می‌خواهند.
              </p>
            </div>
            <Link href="/products?sort=bestseller" className="text-sm text-sky-600 hover:text-sky-700">
              مشاهده همه پیشنهادات
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {!!bestsellerProducts.length && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">پرفروش‌ترین‌ها</h2>
              <p className="mt-2 text-sm text-slate-500">
                محبوب‌ترین محصولات بین تعمیرگاه‌ها و مالکان خودروهای اسپرت و خانواده.
              </p>
            </div>
            <Link href="/products?sort=bestseller" className="text-sm text-sky-600 hover:text-sky-700">
              مشاهده لیست کامل
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {bestsellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {secondaryBanner ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          <h3 className="text-2xl font-semibold text-slate-900">{secondaryBanner.title}</h3>
          {secondaryBanner.subtitle && (
            <p className="mt-3 text-sm leading-7 text-slate-500">{secondaryBanner.subtitle}</p>
          )}
          {secondaryBanner.ctaLabel && secondaryBanner.ctaLink && (
            <Link
              href={secondaryBanner.ctaLink}
              className="mt-6 inline-flex rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-600"
            >
              {secondaryBanner.ctaLabel}
            </Link>
          )}
        </div>
      ) : null}

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">برندهای همکار و نمایندگی‌ها</h2>
        <p className="text-sm text-slate-500">
          همکاری با نمایندگان رسمی Mobil، Castrol، Total و سایر برندهای بین‌المللی با ضمانت اصالت کالا.
        </p>
        <div className="flex flex-wrap gap-4">
          {brands.map((brand) => (
            <BrandPill key={brand.id} brand={brand} />
          ))}
        </div>
      </section>

      {!!latestReviews.length && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">بازخورد مشتریان</h2>
            <Link href="/products" className="text-sm text-sky-600 hover:text-sky-700">
              مطالعه تمام نظرات
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {latestReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {!!latestBlogPosts.length && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">آخرین مقالات وبلاگ</h2>
            <Link href="/blog" className="text-sm text-sky-600 hover:text-sky-700">
              مشاهده همه مقالات
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestBlogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">پیشنهاد اختصاصی برای خودرو شما</h2>
            <p className="mt-2 text-sm text-slate-500">
              مشخصات فنی و استاندارد روغن هر خودرو را مشاهده کنید و محصول مناسب را بدون آزمون و خطا انتخاب کنید.
            </p>
          </div>
          <Link href="/cars" className="text-sm text-sky-600 hover:text-sky-700">
            مشاهده همه خودروها
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-md shadow-slate-500/15">
        <h2 className="text-2xl font-semibold text-slate-900">نیاز به مشاوره تخصصی دارید؟</h2>
        <p className="mt-3 leading-7 text-slate-600">
          تیم فنی ZenLube آماده است تا با بررسی دقیق مشخصات خودرو شما، بهترین روغن موتور، فیلتر و سرویس‌های دوره‌ای را پیشنهاد دهد.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="tel:02112345678"
            className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            ۰۲۱-۱۲۳۴۵۶۷۸
          </Link>
          <Link
            href="/support"
            className="rounded-full border border-slate-200 px-6 py-2 text-sm text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
          >
            ثبت درخواست پشتیبانی
          </Link>
        </div>
      </section>
    </div>
  );
}
