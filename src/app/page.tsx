import Image from "next/image";
import Link from "next/link";
import { BrandPill } from "@/components/catalog/brand-pill";
import { CategoryCard } from "@/components/catalog/category-card";
import { CarCard } from "@/components/catalog/car-card";
import { ProductCard } from "@/components/product/product-card";
import { ReviewCard } from "@/components/review/review-card";
import { BlogCard } from "@/components/blog/blog-card";
import {
  getActiveBanners,
  getBestsellerProducts,
  getBrandsWithProductCount,
  getFeaturedProducts,
  getHighlightedCategories,
  getLatestBlogPosts,
  getLatestReviews,
  getPopularCars,
} from "@/lib/data";

type ProductCollection = Awaited<ReturnType<typeof getFeaturedProducts>>;

export const revalidate = 0;

const valueProps = [
  {
    title: "ارسال سریع و سراسری",
    description: "تحویل اکسپرس در تهران و ارسال حداکثر ۴۸ ساعته به استان‌ها",
    icon: "🚚",
  },
  {
    title: "تضمین اصالت کالا",
    description: "تمام محصولات با گارانتی واردکننده رسمی تحویل می‌شود",
    icon: "🔒",
  },
  {
    title: "مشاوره تخصصی رایگان",
    description: "قبل از خرید بهترین روغن موتور متناسب با خودرو شما معرفی می‌شود",
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
    latestBlogPosts,
  ] = await Promise.all([
    getActiveBanners(),
    getHighlightedCategories(),
    getFeaturedProducts(8),
    getBestsellerProducts(8),
    getBrandsWithProductCount(),
    getPopularCars(4),
    getLatestReviews(6),
    getLatestBlogPosts(3),
  ]);

  const heroBanner = banners.find((banner) => banner.position === "homepage-hero") ?? banners[0];
  const heroGallery = banners
    .filter((banner) => banner.imageUrl)
    .slice(0, 3);

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

  const curatedCollection = featuredProducts.slice(0, 4);
  const mechanicsChoice = bestsellerProducts.slice(0, 4);
  const quickServiceSet = [...featuredProducts.slice(4, 8), ...bestsellerProducts.slice(4, 6)].slice(0, 6);

  return (
    <div className="bg-slate-50">
      <section className="relative isolate overflow-hidden px-6 py-16 text-white lg:px-12">
        {heroBanner?.imageUrl ? (
          <Image
            src={heroBanner.imageUrl}
            alt={heroBanner.title}
            fill
            priority
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/90" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
          <div className="space-y-6 lg:max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
              OILBAR
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              فروشگاه تخصصی روغن موتور با تحویل سریع و ضمانت اصالت
            </h1>
            <p className="text-base leading-7 text-white/80">
              جدیدترین روغن‌های سنتتیک و نیمه‌سنتتیک با پیشنهاد اختصاصی برای خودرو شما. سفارش آنلاین، مشاوره فنی و پشتیبانی ۷ روز هفته.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/products"
                className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
              >
                ورود به فروشگاه
              </Link>
              <Link
                href="/support"
                className="rounded-full border border-white/20 px-6 py-3 text-white transition hover:border-white"
              >
                مشاوره فنی
              </Link>
            </div>
            <div className="grid gap-4 text-sm text-white/80 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  <p className="text-xs text-white/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          {heroGallery.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {heroGallery.map((banner) => (
                <div
                  key={banner.id}
                  className="relative h-48 overflow-hidden rounded-3xl border border-white/10 bg-white/10"
                >
                  {banner.imageUrl ? (
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 80vw, 300px"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-white/70">
                      <span className="text-4xl">🛢️</span>
                      <p className="mt-2 text-xs">تصویر موجود نیست</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-0 right-0 px-4 text-sm">
                    <p className="font-semibold text-white">{banner.title}</p>
                    {banner.subtitle && <p className="text-white/70">{banner.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16 lg:px-10">
        <section className="grid gap-4 lg:grid-cols-3">
          {valueProps.map((prop) => (
            <div
              key={prop.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-400/20"
            >
              <span className="text-3xl">{prop.icon}</span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{prop.title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{prop.description}</p>
            </div>
          ))}
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">دسته‌بندی‌های محبوب</h2>
              <p className="text-sm text-slate-500">بر اساس نوع موتور و استاندارد دلخواه انتخاب کنید.</p>
            </div>
            <Link href="/categories" className="text-sm text-sky-600 hover:text-sky-700">
              مشاهده همه
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3">
            {categories.map((category) => (
              <div key={category.id} className="min-w-[240px]">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </section>

        {curatedCollection.length > 0 && (
          <Shelf
            title="پیشنهاد متخصصان"
            description="انتخاب تیم فنی برای عملکرد بالا و محافظت حداکثری."
            href="/products?sort=featured"
            products={curatedCollection}
          />
        )}

        {mechanicsChoice.length > 0 && (
          <Shelf
            title="پرفروش‌ترین‌های این هفته"
            description="محبوب‌ترین روغن‌ها بین مشتریان حرفه‌ای و تعمیرگاه‌ها."
            href="/products?sort=bestseller"
            products={mechanicsChoice}
          />
        )}

        {quickServiceSet.length > 0 && (
          <Shelf
            title="کالکشن سرویس سریع"
            description="محصولات مناسب سرویس فصلی و نگهداری روزمره."
            href="/products?sort=newest"
            products={quickServiceSet}
          />
        )}

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">برندهای همکار</h2>
              <p className="text-sm text-slate-500">تضمین اصالت با واردکنندگان رسمی و شبکه تأمین اختصاصی.</p>
            </div>
            <Link href="/brands" className="text-sm text-sky-600 hover:text-sky-700">
              معرفی برندها
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            {brands.map((brand) => (
              <BrandPill key={brand.id} brand={brand} />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">دفترچه‌های فنی خودرو</h2>
              <p className="text-sm text-slate-500">مشخصات فنی و سرویس دوره‌ای خودروهای محبوب.</p>
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

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl shadow-slate-900/30">
          <div className="flex flex-col gap-4 text-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-white/50">خدمات ویژه</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">نیاز به راهنمایی فوری دارید؟</h2>
              <p className="mt-2 text-white/70">
                تیم فنی Oilbar آماده است مشخصات خودرو شما را بررسی و روغن مناسب را بدون آزمون و خطا پیشنهاد کند.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="tel:02112345678"
                className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                تماس تلفنی ۰۲۱-۱۲۳۴۵۶۷۸
              </Link>
              <Link
                href="/support"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                ثبت درخواست آنلاین
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type ShelfProps = {
  title: string;
  description: string;
  href: string;
  products: ProductCollection;
};

function Shelf({ title, description, href, products }: ShelfProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <Link href={href} className="text-sm text-sky-600 hover:text-sky-700">
          مشاهده همه
        </Link>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-3">
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] max-w-[320px] flex-1">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
