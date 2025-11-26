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
import { LogoMark } from "@/components/layout/logo-mark";

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
    <div className="space-y-16 pb-20">
      <section className="layout-shell pt-10">
        <div className="relative overflow-hidden rounded-[48px] border border-slate-200 bg-slate-900 text-white shadow-[0_35px_80px_rgba(15,23,42,0.4)]">
          {heroBanner?.imageUrl ? (
            <Image src={heroBanner.imageUrl} alt={heroBanner.title} fill priority className="absolute inset-0 h-full w-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          )}
          <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-[1.3fr,0.7fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                <LogoMark size={28} />
                Oilbar Store
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                انتخاب مطمئن روغن موتور با تجربه خرید شبیه قالب‌های فروشگاهی حرفه‌ای
              </h1>
              <p className="text-base leading-7 text-white/80">
                محصولات اصل با گارانتی رسمی، فیلتر بر اساس خودرو و استاندارد روغن، مشاوره رایگان و ارسال سریع به سراسر کشور.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/products" className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100">
                  مشاهده فروشگاه
                </Link>
                <Link href="/support" className="rounded-full border border-white/40 px-6 py-3 text-white transition hover:border-white">
                  درخواست مشاوره
                </Link>
              </div>
              <div className="grid gap-4 text-sm text-white/90 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/20 bg-black/20 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                    <p className="text-xs text-white/80">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            {heroGallery.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {heroGallery.map((banner) => (
                  <div key={banner.id} className="relative h-48 overflow-hidden rounded-3xl border border-white/20 bg-white/10">
                    {banner.imageUrl ? (
                      <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover transition duration-500 hover:scale-105" sizes="(max-width: 768px) 80vw, 360px" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-white/70">
                        <span className="text-4xl">🛢️</span>
                        <p className="mt-2 text-xs">تصویر موجود نیست</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-0 right-0 px-4 text-sm">
                      <p className="font-semibold">{banner.title}</p>
                      {banner.subtitle && <p className="text-white/70">{banner.subtitle}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="layout-shell">
        <div className="grid gap-4 lg:grid-cols-3">
          {valueProps.map((prop) => (
            <div key={prop.title} className="rounded-[32px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <span className="text-3xl">{prop.icon}</span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{prop.title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="layout-shell space-y-6">
        <div className="section-heading">
          <h2>دسته‌بندی‌های محبوب</h2>
          <p>جداسازی براساس نوع روغن موتور، استاندارد و خودروهای سازگار.</p>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-3">
          {categories.map((category) => (
            <div key={category.id} className="min-w-[240px]">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Link href="/categories" className="text-sm text-sky-600 hover:text-sky-800">
            مشاهده تمام دسته‌بندی‌ها →
          </Link>
        </div>
      </section>

      {curatedCollection.length > 0 && (
        <Shelf title="پیشنهاد متخصصان" description="ترکیبی از روغن‌های پریمیوم برای موتورهای نسل جدید." href="/products?sort=featured" products={curatedCollection} />
      )}

      {mechanicsChoice.length > 0 && (
        <Shelf title="پرفروش هفته" description="انتخاب تعمیرگاه‌ها و مشتریان حرفه‌ای." href="/products?sort=bestseller" products={mechanicsChoice} />
      )}

      {quickServiceSet.length > 0 && (
        <Shelf title="کالکشن سرویس فصلی" description="ست کامل سرویس دوره‌ای و نگهداری روزمره." href="/products?sort=newest" products={quickServiceSet} />
      )}

      <section className="layout-shell space-y-5">
        <div className="section-heading">
          <h2>برندهای رسمی Oilbar</h2>
          <p>شبکه تامین با ضمانت اصالت و تاریخ جدید تولید.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {brands.map((brand) => (
            <BrandPill key={brand.id} brand={brand} />
          ))}
        </div>
      </section>

      <section className="layout-shell space-y-8">
        <div className="section-heading">
          <h2>دفترچه سرویس خودرو</h2>
          <p>مشخصات فنی، گنجایش روغن و استانداردهای مورد نیاز خودروهای محبوب.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
        <div className="flex justify-end">
          <Link href="/cars" className="text-sm text-sky-600 hover:text-sky-800">
            مشاهده تمام خودروها →
          </Link>
        </div>
      </section>

      {!!latestReviews.length && (
        <section className="layout-shell space-y-6">
          <div className="section-heading">
            <h2>بازخورد مشتریان واقعی</h2>
            <p>تجربه خرید و استفاده از محصولات توسط مالکین خودرو.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {latestReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {!!latestBlogPosts.length && (
        <section className="layout-shell space-y-6">
          <div className="section-heading">
            <h2>از بلاگ Oilbar</h2>
            <p>راهنمای نگهداری، مقایسه روغن‌های مطرح و اخبار صنعت خودرو.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestBlogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <section className="layout-shell">
        <div className="wp-section flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.45em] text-slate-400">مشاوره ویژه</p>
            <h2 className="text-2xl font-semibold text-slate-900">نیاز به راهنمایی برای انتخاب روغن دارید؟</h2>
            <p className="text-sm text-slate-600">
              اطلاعات خودرو خود را ارسال کنید تا در کمتر از ۲ ساعت پیشنهاد دقیق دریافت کنید. امکان ثبت سفارش تلفنی و هماهنگی سرویس در محل نیز وجود دارد.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="tel:02632515631" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:text-sky-600">
              تماس مستقیم ۰۲۶-۳۲۵۱۵۶۳۱
            </Link>
            <Link href="/support" className="rounded-full bg-gradient-to-l from-sky-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              فرم درخواست آنلاین
            </Link>
          </div>
        </div>
      </section>
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
    <section className="layout-shell space-y-4">
      <div className="section-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-3">
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] max-w-[320px] flex-1">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Link href={href} className="text-sm text-sky-600 hover:text-sky-800">
          مشاهده تمام محصولات →
        </Link>
      </div>
    </section>
  );
}
