import Image from "next/image";
import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { HeroVehicleFinder } from "@/components/layout/hero-vehicle-finder";
import {
  getBrandsWithProductCount,
  getHighlightedCategories,
  getLatestBlogPosts,
  getPopularCars,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const heroTrust = ["ضمانت اصالت کالا", "ارسال سریع", "مشاوره تخصصی"];
const quickSearches = ["5W-30", "فیلتر روغن", "API SP", "ضدیخ"];
const homeShortcuts = [
  { href: "/products", title: "جستجوی کالا", subtitle: "روغن و فیلتر", icon: SearchIcon, tone: "bg-[#FFF4E8] text-[#D97706]" },
  { href: "/categories", title: "دسته‌بندی", subtitle: "خرید سریع", icon: GridIcon, tone: "bg-[#EEF4FF] text-[#2563EB]" },
  { href: "/brands", title: "برندها", subtitle: "اصل و معتبر", icon: BadgeIcon, tone: "bg-[#ECFDF3] text-[#16A34A]" },
  { href: "/cars", title: "براساس خودرو", subtitle: "انتخاب دقیق", icon: CarIcon, tone: "bg-[#F4F3FF] text-[#7C3AED]" },
];
const trustCards = [
  {
    description: "پاسخ‌گویی دقیق برای خودروهای شما",
    title: "مشاوره تخصصی رایگان",
  },
  {
    description: "ارسال در سریع‌ترین زمان با بسته‌بندی امن",
    title: "ارسال سریع به سراسر کشور",
  },
  {
    description: "کلیه محصولات با ضمانت اصالت از منابع معتبر",
    title: "ضمانت اصالت کالا",
  },
];

export default async function Home() {
  const [categories, brands, cars, posts] = await Promise.all([
    getHighlightedCategories().catch(() => []),
    getBrandsWithProductCount().catch(() => []),
    getPopularCars(8).catch(() => []),
    getLatestBlogPosts(3).catch(() => []),
  ]);

  return (
    <div className="space-y-10 pb-14 pt-4 md:space-y-12 md:pt-6">
      <section className="container-zen">
        <div className="panel-zen relative overflow-hidden rounded-[32px] md:rounded-[36px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_28%,rgba(245,158,11,0.15),transparent_24%),radial-gradient(circle_at_18%_22%,rgba(17,24,39,0.07),transparent_18%),linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] bg-[radial-gradient(circle_at_35%_45%,rgba(17,24,39,0.08),transparent_56%)] lg:block" />
          <div className="pointer-events-none absolute left-[38%] top-[18%] hidden h-[340px] w-[340px] rounded-full border border-[#EEF0F5] lg:block" />
          <div className="pointer-events-none absolute left-[41%] top-[23%] hidden h-[240px] w-[240px] rounded-full border border-[#F4F5F8] lg:block" />

          <div className="relative grid gap-5 px-3 py-4 sm:px-5 sm:py-5 md:px-8 md:py-8 lg:grid-cols-[330px_minmax(420px,1fr)_minmax(0,1.3fr)] lg:items-center lg:gap-8 lg:px-10 lg:py-10 xl:px-12">
            <div className="order-4 lg:order-1">
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
              />
            </div>

            <div className="order-2 flex min-h-[180px] items-center justify-center sm:min-h-[260px] lg:min-h-[560px]">
              <div className="relative w-full max-w-[720px]">
                <div className="absolute inset-x-[14%] bottom-8 h-14 rounded-full bg-[radial-gradient(circle,rgba(17,24,39,0.2),transparent_65%)] blur-2xl" />
                <Image
                  alt="محصولات ویژه Oilbar"
                  className="relative z-10 h-auto w-full object-contain drop-shadow-[0_30px_60px_rgba(17,24,39,0.18)]"
                  height={1024}
                  priority
                  src="/generated/oilbar-hero-products.png"
                  width={1536}
                />
              </div>
            </div>

            <div className="order-1 flex flex-col justify-center lg:order-3">
              <h1 className="max-w-[13ch] text-[1.78rem] font-black leading-[1.4] tracking-[-0.04em] text-text-strong sm:text-[2.45rem] md:text-[3.05rem] lg:text-[3.45rem]">
                روغن اصل، انتخاب دقیق، خرید مطمئن برای خودروی شما
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-8 text-text-muted sm:text-base md:text-lg">
                بر اساس برند، ویسکوزیته، استاندارد API یا مدل خودرو جستجو کنید و محصولات سازگار را با ضمانت اصالت تحویل
                بگیرید.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link className="btn-primary w-full rounded-[18px] text-sm sm:min-w-[210px] sm:w-auto sm:text-base" href="/products">
                  <ChevronLeftIcon className="h-5 w-5" />
                  مشاهده محصولات
                </Link>
                <Link className="btn-outline w-full rounded-[18px] border-primary/20 text-sm text-text-strong sm:min-w-[210px] sm:w-auto sm:text-base" href="/cars">
                  انتخاب روغن مناسب خودرو
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-[11px] font-bold text-[#344054] sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:text-sm sm:pt-5">
                {heroTrust.map((item, index) => (
                  <div key={item} className="rounded-2xl bg-surface-elevated px-3 py-2 sm:bg-transparent sm:px-0 sm:py-0">
                    <span className="inline-flex items-center gap-2">
                      {index === 0 ? <ShieldIcon className="h-5 w-5 text-[#171B23]" /> : null}
                      {index === 1 ? <TruckIcon className="h-5 w-5 text-[#171B23]" /> : null}
                      {index === 2 ? <HeadsetIcon className="h-5 w-5 text-[#171B23]" /> : null}
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <span className="mb-2 block text-sm font-semibold text-text-muted">جستجوهای پرتکرار</span>
                <div className="flex flex-wrap gap-2">
                  {quickSearches.map((item) => (
                    <Link
                      key={item}
                      className="chip-zen-muted interactive-lift rounded-full border bg-white px-4 py-2 text-sm font-semibold text-[#475467]"
                      href={`/products?search=${encodeURIComponent(item)}`}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-zen lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {homeShortcuts.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                className="panel-zen interactive-lift rounded-[22px] p-3 text-center"
                href={item.href}
              >
                <span className={`mx-auto flex size-11 items-center justify-center rounded-2xl ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-3 block text-xs font-extrabold text-[#171B23]">{item.title}</span>
                <span className="mt-1 block text-[11px] text-[#667085]">{item.subtitle}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-zen">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {trustCards.map((item, index) => (
            <div key={item.title} className="panel-zen-muted rounded-[24px] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-text-strong">{item.title}</h2>
                <span className="icon-shell flex size-11 items-center justify-center rounded-2xl text-[#171B23]">
                  {index === 0 ? <HeadsetIcon className="h-6 w-6" /> : null}
                  {index === 1 ? <TruckIcon className="h-6 w-6" /> : null}
                  {index === 2 ? <ShieldIcon className="h-6 w-6" /> : null}
                </span>
              </div>
              <p className="text-sm leading-7 text-text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-zen space-y-5">
        <SectionHeader href="/categories" subtitle="روغن، فیلتر و محصولات سرویس دوره‌ای" title="خرید بر اساس دسته‌بندی" />
        {categories.length > 0 ? (
          <div className="grid grid-cols-4 gap-2.5 md:grid-cols-4 md:gap-3 lg:grid-cols-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                className="panel-zen interactive-lift group rounded-[22px] p-3 text-center sm:p-4"
                href={`/categories/${category.slug}`}
              >
                <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-2xl bg-[#FFF8E8] text-base font-extrabold text-[#D97706] transition group-hover:bg-[#FFE9B4] sm:mb-3 sm:size-12 sm:text-lg">
                  {category.name.trim().charAt(0)}
                </span>
                <span className="line-clamp-2 text-[11px] font-bold leading-5 text-[#344054] sm:text-sm">{category.name}</span>
                <span className="mt-1 hidden text-xs font-semibold text-text-muted sm:block">{category._count.products} محصول</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState message="هنوز دسته‌بندی‌ای ثبت نشده است." />
        )}
      </section>

      <section className="container-zen grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="panel-zen rounded-[30px] p-6">
          <SectionHeader href="/cars" subtitle="برای پیشنهاد دقیق‌تر، خودروی خود را انتخاب کنید" title="مناسب برای خودروی شما" />
          {cars.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {cars.slice(0, 4).map((car) => (
                <Link
                  key={car.id}
                  className="interactive-lift rounded-[20px] border border-border bg-white p-4"
                  href={`/cars/${car.slug}`}
                >
                  <span className="text-sm font-bold text-text-strong">
                    {car.manufacturer} {car.model}
                  </span>
                  <span className="mt-1 block text-xs text-text-muted">ویسکوزیته پیشنهادی: {car.viscosity ?? "مشاهده راهنما"}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState compact message="هنوز دفترچه یا خودرویی ثبت نشده است." />
          )}
        </div>

        <div className="panel-zen-dark rounded-[30px] p-6">
          <h2 className="text-[1.55rem] font-extrabold leading-[1.6] sm:text-[1.7rem]">مطمئن نیستی چه روغنی بخری؟</h2>
          <p className="mt-3 text-sm leading-8 text-white/70">
            بر اساس برند خودرو، نوع موتور و ویسکوزیته، سریع‌تر به کالای سازگار برسید و انتخاب اشتباه را کم کنید.
          </p>
          <Link className="btn-primary mt-6 rounded-[16px]" href="/cars">
            شروع انتخاب بر اساس خودرو
          </Link>
        </div>
      </section>

      {brands.length > 0 ? (
        <section className="container-zen space-y-5">
          <SectionHeader href="/brands" subtitle="برندهای ثبت‌شده در فروشگاه" title="برندهای محبوب" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
            {brands.slice(0, 14).map((brand) => (
              <Link
                key={brand.id}
                className="panel-zen interactive-lift flex min-h-14 items-center justify-center rounded-[20px] px-4 py-4 text-center text-sm font-extrabold text-[#344054]"
                href={`/products?brand=${brand.slug}`}
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {!!posts.length && (
        <section className="container-zen space-y-5">
          <SectionHeader href="/blog" subtitle="مطالب کاربردی برای انتخاب و تعویض روغن" title="راهنمای خرید و نگهداری" />
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

function EmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      className={`panel-zen-muted rounded-[20px] border-dashed text-center text-sm font-semibold text-text-muted ${
        compact ? "mt-5 p-5" : "p-8"
      }`}
    >
      {message}
    </div>
  );
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle: string; href?: string }) {
  return (
    <div className="section-heading">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      {href ? (
        <Link className="text-sm font-bold text-primary-accent-strong" href={href}>
          مشاهده همه
        </Link>
      ) : null}
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="m14 6-6 6 6 6" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M12 3 5 6v6c0 4.5 2.8 7.9 7 9 4.2-1.1 7-4.5 7-9V6l-7-3Z" />
      <path d="m9.5 12.5 1.8 1.8 3.7-4.3" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M10 17H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h7v11h-3Z" />
      <path d="M13 10h4l3 3v2a2 2 0 0 1-2 2h-1" />
      <circle cx={7.5} cy={17.5} r={1.5} />
      <circle cx={17.5} cy={17.5} r={1.5} />
    </svg>
  );
}

function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M4 13a8 8 0 1 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
      <path d="M9 21h6" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M4 4h6v6H4z" />
      <path d="M14 4h6v6h-6z" />
      <path d="M4 14h6v6H4z" />
      <path d="M14 14h6v6h-6z" />
    </svg>
  );
}

function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M12 3 6 6v6c0 4.5 2.8 7.9 6 9 3.2-1.1 6-4.5 6-9V6l-6-3Z" />
      <path d="m9.5 12.2 1.6 1.6 3.4-3.9" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M5 15V9.8a2 2 0 0 1 1.4-1.9l4-1.3a5 5 0 0 1 3.2 0l4 1.3A2 2 0 0 1 19 9.8V15" />
      <path d="M4 15h16" />
      <path d="M7 15v2.5" />
      <path d="M17 15v2.5" />
      <circle cx={8} cy={15.5} r={1.1} />
      <circle cx={16} cy={15.5} r={1.1} />
    </svg>
  );
}
