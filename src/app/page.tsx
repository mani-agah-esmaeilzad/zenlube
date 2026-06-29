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
    <div className="space-y-10 pb-12 pt-4 md:pt-6">
      <section className="container-zen">
        <div className="relative overflow-hidden rounded-[36px] border border-[#ECEEF2] bg-white shadow-[0_25px_70px_rgba(17,24,39,0.08)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_18%_24%,rgba(17,24,39,0.06),transparent_22%),linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)]" />
          <div className="pointer-events-none absolute left-[38%] top-[18%] hidden h-[340px] w-[340px] rounded-full border border-[#EEF0F5] lg:block" />
          <div className="pointer-events-none absolute left-[41%] top-[23%] hidden h-[240px] w-[240px] rounded-full border border-[#F4F5F8] lg:block" />

          <div className="relative grid gap-8 px-5 py-6 md:px-8 md:py-8 lg:grid-cols-[330px_minmax(420px,1fr)_minmax(0,1.3fr)] lg:items-center lg:px-10 lg:py-10 xl:px-12">
            <div className="order-3 lg:order-1">
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

            <div className="order-2 flex min-h-[260px] items-center justify-center lg:min-h-[560px]">
              <div className="relative w-full max-w-[720px]">
                <div className="absolute inset-x-[14%] bottom-8 h-14 rounded-full bg-[radial-gradient(circle,rgba(17,24,39,0.18),transparent_65%)] blur-2xl" />
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
              <h1 className="max-w-[14ch] text-[2.3rem] font-black leading-[1.22] tracking-[-0.04em] text-[#171B23] md:text-[3.45rem]">
                روغن اصل، انتخاب دقیق، خرید مطمئن برای خودروی شما
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-9 text-[#667085] md:text-lg">
                بر اساس برند، ویسکوزیته، استاندارد API یا مدل خودرو جستجو کنید و محصولات سازگار را با ضمانت اصالت تحویل
                بگیرید.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link className="btn-primary min-w-[210px] rounded-[18px] text-base" href="/products">
                  <ChevronLeftIcon className="h-5 w-5" />
                  مشاهده محصولات
                </Link>
                <Link className="btn-outline min-w-[210px] rounded-[18px] border-[#171B23] text-base text-[#171B23]" href="/cars">
                  انتخاب روغن مناسب خودرو
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-[#EEF0F5] pt-5 text-sm font-bold text-[#344054]">
                {heroTrust.map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2">
                      {index === 0 ? <ShieldIcon className="h-5 w-5 text-[#171B23]" /> : null}
                      {index === 1 ? <TruckIcon className="h-5 w-5 text-[#171B23]" /> : null}
                      {index === 2 ? <HeadsetIcon className="h-5 w-5 text-[#171B23]" /> : null}
                      {item}
                    </span>
                    {index < heroTrust.length - 1 ? <span className="hidden h-6 w-px bg-[#E7E8EE] md:block" /> : null}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-[#667085]">جستجوهای پرتکرار:</span>
                {quickSearches.map((item) => (
                  <Link
                    key={item}
                    className="rounded-full border border-[#E7E8EE] bg-white px-4 py-2 text-sm font-semibold text-[#475467] transition hover:border-[#F5C56B] hover:bg-[#FFF9EC] hover:text-[#D97706]"
                    href={`/products?search=${encodeURIComponent(item)}`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-zen">
        <div className="grid gap-3 md:grid-cols-3">
          {trustCards.map((item, index) => (
            <div key={item.title} className="rounded-[24px] border border-[#E7E8EE] bg-white p-5 shadow-[0_12px_34px_rgba(17,24,39,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#171B23]">{item.title}</h2>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#171B23]">
                  {index === 0 ? <HeadsetIcon className="h-6 w-6" /> : null}
                  {index === 1 ? <TruckIcon className="h-6 w-6" /> : null}
                  {index === 2 ? <ShieldIcon className="h-6 w-6" /> : null}
                </span>
              </div>
              <p className="text-sm leading-7 text-[#667085]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-zen space-y-5">
        <SectionHeader href="/categories" subtitle="روغن، فیلتر و محصولات سرویس دوره‌ای" title="خرید بر اساس دسته‌بندی" />
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                className="group rounded-[24px] border border-[#E7E8EE] bg-white p-4 text-center shadow-[0_10px_26px_rgba(17,24,39,0.03)] transition hover:-translate-y-1 hover:border-[#F5C56B] hover:shadow-[0_18px_44px_rgba(17,24,39,0.08)]"
                href={`/categories/${category.slug}`}
              >
                <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#FFF8E8] text-lg font-extrabold text-[#D97706] transition group-hover:bg-[#FFE9B4]">
                  {category.name.trim().charAt(0)}
                </span>
                <span className="line-clamp-2 text-sm font-bold text-[#344054]">{category.name}</span>
                <span className="mt-2 block text-xs font-semibold text-[#667085]">{category._count.products} محصول</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState message="هنوز دسته‌بندی‌ای ثبت نشده است." />
        )}
      </section>

      <section className="container-zen grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[30px] border border-[#E7E8EE] bg-white p-6 shadow-[0_14px_34px_rgba(17,24,39,0.05)]">
          <SectionHeader href="/cars" subtitle="برای پیشنهاد دقیق‌تر، خودروی خود را انتخاب کنید" title="مناسب برای خودروی شما" />
          {cars.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {cars.slice(0, 4).map((car) => (
                <Link
                  key={car.id}
                  className="rounded-[20px] border border-[#E7E8EE] p-4 transition hover:border-[#F5C56B] hover:bg-[#FFF9EC]"
                  href={`/cars/${car.slug}`}
                >
                  <span className="text-sm font-bold text-[#171B23]">
                    {car.manufacturer} {car.model}
                  </span>
                  <span className="mt-1 block text-xs text-[#667085]">ویسکوزیته پیشنهادی: {car.viscosity ?? "مشاهده راهنما"}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState compact message="هنوز دفترچه یا خودرویی ثبت نشده است." />
          )}
        </div>

        <div className="rounded-[30px] bg-[#171B23] p-6 text-white shadow-[0_20px_50px_rgba(17,24,39,0.18)]">
          <h2 className="text-[1.7rem] font-extrabold leading-[1.5]">مطمئن نیستی چه روغنی بخری؟</h2>
          <p className="mt-3 text-sm leading-8 text-white/70">
            راهنمای انتخاب روغن بر اساس ویسکوزیته، استاندارد API، نوع موتور و شرایط رانندگی را بخوانید.
          </p>
          <Link className="btn-primary mt-6 rounded-[16px]" href="/blog">
            مطالعه راهنما
          </Link>
        </div>
      </section>

      {brands.length > 0 ? (
        <section className="container-zen space-y-5">
          <SectionHeader href="/brands" subtitle="برندهای ثبت‌شده در فروشگاه" title="برندهای محبوب" />
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
            {brands.slice(0, 14).map((brand) => (
              <Link
                key={brand.id}
                className="flex min-w-36 shrink-0 items-center justify-center rounded-[20px] border border-[#E7E8EE] bg-white px-5 py-4 text-sm font-extrabold text-[#344054] transition hover:border-[#F5C56B] hover:text-[#D97706]"
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
      className={`rounded-[20px] border border-dashed border-[#D0D5DD] bg-white text-center text-sm font-semibold text-[#667085] ${
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
        <Link className="text-sm font-bold text-[#D97706]" href={href}>
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
