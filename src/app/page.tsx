import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { BlogCard } from "@/components/blog/blog-card";
import { getBestsellerProducts, getBrandsWithProductCount, getFeaturedProducts, getLatestBlogPosts, getPopularCars } from "@/lib/data";

export const revalidate = 0;

const categories = [
  ["روغن موتور", "engine-oil", "M"],
  ["فیلتر روغن", "فیلتر روغن", "O"],
  ["فیلتر هوا", "فیلتر هوا", "A"],
  ["فیلتر کابین", "فیلتر کابین", "C"],
  ["روغن گیربکس", "روغن گیربکس", "G"],
  ["واسکازین", "واسکازین", "W"],
  ["ضدیخ", "ضدیخ", "F"],
  ["مکمل سوخت", "مکمل سوخت", "B"],
];

const trust = ["ضمانت اصالت کالا", "ارسال سریع", "مشاوره تخصصی", "پرداخت امن", "پشتیبانی واقعی"];

const guideCards = [
  ["فرق 5W-30 و 10W-40 چیست؟", "راهنمای سریع انتخاب ویسکوزیته مناسب برای آب‌وهوا و موتور خودرو."],
  ["روغن تمام سنتتیک بهتر است یا نیمه سنتتیک؟", "تفاوت عملکرد، قیمت و زمان تعویض را ساده و کاربردی بخوانید."],
  ["چه زمانی باید روغن موتور را عوض کنیم؟", "نشانه‌ها، کیلومتر مناسب و خطاهای رایج نگهداری موتور."],
  ["چطور روغن مناسب خودرو را انتخاب کنیم؟", "بر اساس دفترچه خودرو، استاندارد API و پیشنهادهای فنی."],
];

export default async function Home() {
  const [featuredProducts, bestsellerProducts, brands, cars, posts] = await Promise.all([
    getFeaturedProducts(8),
    getBestsellerProducts(8),
    getBrandsWithProductCount(),
    getPopularCars(4),
    getLatestBlogPosts(3),
  ]);

  return (
    <div className="space-y-10 pb-12">
      <section className="bg-white">
        <div className="container-zen grid gap-6 py-6 lg:grid-cols-[1.35fr_.65fr]">
          <div className="relative overflow-hidden rounded-3xl bg-[#111827] p-6 text-white md:p-9">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white">فروشگاه تخصصی روغن موتور و فیلتر خودرو</span>
              <h1 className="mt-5 text-2xl font-extrabold leading-[1.8] md:text-4xl">
                روغن اصل، انتخاب دقیق، خرید مطمئن برای خودروی شما
              </h1>
              <p className="mt-4 text-sm leading-8 text-white/75 md:text-base">
                بر اساس برند، ویسکوزیته، استاندارد API یا مدل خودرو جستجو کنید و محصولات سازگار را با ضمانت اصالت تحویل بگیرید.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/products?sort=bestseller" className="btn-primary">مشاهده پیشنهادها</Link>
                <Link href="/cars" className="btn-outline !border-white/20 !bg-white/10 !text-white hover:!border-white/40">انتخاب روغن مناسب خودرو</Link>
              </div>
            </div>
            <div className="absolute left-6 top-8 hidden w-72 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur lg:block">
              <p className="text-xs font-bold text-white/70">پیشنهاد فنی امروز</p>
              <p className="mt-3 text-3xl font-extrabold">5W-30</p>
              <p className="mt-2 text-sm leading-7 text-white/70">مناسب خودروهای جدید با رانندگی شهری و مصرف روزانه</p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                <span className="rounded-xl bg-white/10 px-3 py-2">تمام سنتتیک</span>
                <span className="rounded-xl bg-white/10 px-3 py-2">API SP</span>
              </div>
            </div>
          </div>

          <VehicleFinder />
        </div>
      </section>

      <section className="container-zen">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {trust.map((item) => (
            <div key={item} className="flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center text-sm font-bold text-[#374151]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="container-zen space-y-5">
        <SectionHeader title="خرید بر اساس دسته‌بندی" subtitle="روغن، فیلتر و محصولات سرویس دوره‌ای" href="/categories" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          {categories.map(([label, query, initial]) => (
            <Link
              key={label}
              href={label === "روغن موتور" ? `/products?category=${query}` : `/products?search=${encodeURIComponent(query)}`}
              className="group rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center transition hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_14px_34px_rgba(17,24,39,0.08)]"
            >
              <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#F3F4F6] text-lg font-extrabold text-[#111827] transition group-hover:bg-red-50 group-hover:text-red-600">
                {initial}
              </span>
              <span className="text-sm font-bold text-[#374151]">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {!!featuredProducts.length && (
        <section className="container-zen space-y-5">
          <SectionHeader title="پیشنهاد ویژه امروز" subtitle="کالاهای منتخب با ضمانت اصالت و ارسال سریع" href="/products?sort=bestseller" />
          <div className="rounded-3xl bg-[#EF394E] p-3 md:p-5">
            <div className="mb-4 flex items-center justify-between px-1 text-white">
              <h2 className="text-lg font-extrabold">فروش ویژه</h2>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">زمان محدود</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {!!bestsellerProducts.length && (
        <section className="container-zen space-y-5">
          <SectionHeader title="پرفروش‌ترین محصولات" subtitle="انتخاب‌های محبوب راننده‌ها و تعمیرکارها" href="/products?sort=bestseller" />
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {bestsellerProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      <section className="container-zen grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6">
          <SectionHeader title="مناسب برای خودروی شما" subtitle="برای پیشنهاد دقیق‌تر، خودروی خود را انتخاب کنید" href="/cars" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {cars.map((car) => (
              <Link key={car.id} href={`/cars/${car.slug}`} className="rounded-2xl border border-[#E5E7EB] p-4 transition hover:border-red-200 hover:bg-red-50">
                <span className="text-sm font-bold text-[#111827]">{car.manufacturer} {car.model}</span>
                <span className="mt-1 block text-xs text-[#6B7280]">ویسکوزیته پیشنهادی: {car.viscosity ?? "مشاهده راهنما"}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#111827] p-6 text-white">
          <h2 className="text-xl font-extrabold">مطمئن نیستی چه روغنی بخری؟</h2>
          <p className="mt-3 text-sm leading-8 text-white/70">
            راهنمای انتخاب روغن بر اساس ویسکوزیته، استاندارد API، نوع موتور و شرایط رانندگی را بخوانید.
          </p>
          <Link href="/blog" className="btn-primary mt-6">مطالعه راهنما</Link>
        </div>
      </section>

      <section className="container-zen space-y-5">
        <SectionHeader title="برندهای محبوب" subtitle="برندهای پرفروش و قابل اعتماد بازار" href="/brands" />
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
          {brands.slice(0, 14).map((brand) => (
            <Link key={brand.id} href={`/products?brand=${brand.slug}`} className="flex min-w-36 shrink-0 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-sm font-extrabold text-[#374151] transition hover:border-red-200 hover:text-red-600">
              {brand.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-zen space-y-5">
        <SectionHeader title="راهنمای خرید و نگهداری" subtitle="مطالب کاربردی برای انتخاب و تعویض روغن" href="/blog" />
        {!!posts.length ? (
          <div className="grid gap-5 md:grid-cols-3">{posts.map((post) => <BlogCard key={post.id} post={post} />)}</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-4">
            {guideCards.map(([title, excerpt]) => (
              <Link key={title} href="/blog" className="rounded-2xl border border-[#E5E7EB] bg-white p-5 transition hover:border-red-200">
                <span className="text-base font-bold leading-7 text-[#111827]">{title}</span>
                <p className="mt-3 text-sm leading-7 text-[#6B7280]">{excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
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
      {href ? <Link href={href} className="text-sm font-bold text-red-600">مشاهده همه</Link> : null}
    </div>
  );
}

function VehicleFinder() {
  return (
    <section className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_28px_rgba(17,24,39,0.06)]">
      <h2 className="text-xl font-extrabold text-[#111827]">روغن مناسب ماشینت رو سریع پیدا کن</h2>
      <p className="mt-2 text-sm leading-7 text-[#6B7280]">اطلاعات خودرو را انتخاب کن تا محصولات سازگار نمایش داده شوند.</p>
      <form action="/products" className="mt-5 grid gap-3">
        {["برند خودرو", "مدل خودرو", "سال ساخت", "نوع موتور"].map((label) => (
          <select key={label} className="input-zen" aria-label={label}>
            <option>{label}</option>
          </select>
        ))}
        <button className="btn-primary w-full">جستجوی روغن مناسب</button>
      </form>
    </section>
  );
}
