import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { BlogCard } from "@/components/blog/blog-card";
import { getBestsellerProducts, getBrandsWithProductCount, getFeaturedProducts, getLatestBlogPosts, getPopularCars } from "@/lib/data";

export const revalidate = 0;

const quickCats = ["روغن موتور", "فیلتر روغن", "فیلتر هوا", "فیلتر کابین", "ضدیخ", "مکمل سوخت", "واسکازین", "روغن گیربکس"];
const trust = ["ضمانت اصالت کالا", "ارسال سریع", "مشاوره تخصصی انتخاب روغن", "پرداخت امن", "مرجوعی آسان"];

export default async function Home() {
  const [featuredProducts, bestsellerProducts, brands, cars, posts] = await Promise.all([
    getFeaturedProducts(8), getBestsellerProducts(8), getBrandsWithProductCount(), getPopularCars(4), getLatestBlogPosts(3),
  ]);
  return (
    <div className="space-y-10 pb-14">
      <section className="bg-[#0f2747] text-white">
        <div className="container-zen grid gap-8 py-10 lg:grid-cols-[1.2fr_.8fr] lg:py-14">
          <div className="flex flex-col justify-center">
            <span className="mb-4 w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-orange-200">فروشگاه تخصصی روغن موتور و فیلتر</span>
            <h1 className="text-3xl font-black leading-tight md:text-5xl">روغن اصل، انتخاب دقیق، خرید مطمئن برای خودروی شما</h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/75 md:text-base">با انتخاب خودرو یا جستجوی برند و ویسکوزیته، محصولات سازگار را سریع‌تر پیدا کنید. مناسب راننده‌های حرفه‌ای، تعمیرگاه‌ها و مصرف‌کننده‌هایی که اصالت برایشان مهم است.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/products" className="btn-primary">مشاهده محصولات</Link><Link href="/cars" className="btn-outline !border-white/20 !bg-white/10 !text-white hover:!text-orange-200">انتخاب خودرو</Link></div>
          </div>
          <div className="card-zen !border-white/10 !bg-white/10 p-5 shadow-none backdrop-blur">
            <h2 className="text-xl font-extrabold">ماشینت رو انتخاب کن</h2>
            <p className="mt-2 text-sm text-white/70">تا روغن و فیلتر سازگار را پیشنهاد کنیم.</p>
            <form action="/products" className="mt-5 grid gap-3 sm:grid-cols-2">
              {["برند خودرو", "مدل", "سال", "نوع موتور"].map((label) => <select key={label} className="input-zen bg-white text-slate-700" aria-label={label}><option>{label}</option></select>)}
              <button className="btn-primary sm:col-span-2">یافتن محصولات سازگار</button>
            </form>
          </div>
        </div>
      </section>

      <section className="container-zen grid grid-cols-2 gap-3 md:grid-cols-5">
        {trust.map((item) => <div key={item} className="card-zen p-4 text-center text-sm font-bold text-slate-700"><span className="mb-2 block text-2xl">✓</span>{item}</div>)}
      </section>

      <section className="container-zen space-y-5">
        <div className="flex items-end justify-between"><div><h2 className="text-2xl font-black text-[#0f2747]">خرید بر اساس دسته‌بندی</h2><p className="mt-1 text-sm text-slate-500">روغن، فیلتر و محصولات سرویس دوره‌ای</p></div><Link href="/categories" className="text-sm font-bold text-orange-600">همه دسته‌ها</Link></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">{quickCats.map((cat) => <Link key={cat} href={`/products?search=${encodeURIComponent(cat)}`} className="card-zen p-4 text-center transition hover:-translate-y-1 hover:border-orange-200"><span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-xl">⛽</span><span className="text-sm font-bold text-slate-700">{cat}</span></Link>)}</div>
      </section>

      {!!featuredProducts.length && <section className="container-zen space-y-5"><div className="flex items-end justify-between"><div><h2 className="text-2xl font-black text-[#0f2747]">پیشنهاد ویژه امروز</h2><p className="mt-1 text-sm text-slate-500">کالاهای منتخب با ضمانت اصالت و ارسال سریع</p></div><Link href="/products?sort=bestseller" className="text-sm font-bold text-orange-600">مشاهده همه</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>}
      {!!bestsellerProducts.length && <section className="container-zen space-y-5"><h2 className="text-2xl font-black text-[#0f2747]">پرفروش‌ترین روغن موتورها</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{bestsellerProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>}

      <section className="container-zen grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="card-zen bg-[#0f2747] p-7 text-white"><h2 className="text-2xl font-black">کدام روغن موتور مناسب ماشین من است؟</h2><p className="mt-3 text-sm leading-7 text-white/75">راهنمای انتخاب ویسکوزیته، API و نوع روغن را بخوانید یا از کارشناسان ما کمک بگیرید.</p><Link href="/blog" className="btn-primary mt-5">مطالعه راهنما</Link></div>
        <div className="card-zen p-7"><h2 className="text-2xl font-black text-[#0f2747]">مناسب خودروی شما</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{cars.map((car) => <Link key={car.id} href={`/cars/${car.slug}`} className="rounded-2xl border border-slate-200 p-4 text-sm font-bold hover:border-orange-300">{car.manufacturer} {car.model}<span className="mt-1 block text-xs font-normal text-slate-500">ویسکوزیته پیشنهادی: {car.viscosity ?? "مشاهده"}</span></Link>)}</div></div>
      </section>

      <section className="container-zen space-y-5"><h2 className="text-2xl font-black text-[#0f2747]">برندهای محبوب</h2><div className="flex gap-3 overflow-x-auto pb-2">{brands.slice(0, 12).map((b) => <Link key={b.id} href={`/products?brand=${b.slug}`} className="shrink-0 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-orange-300">{b.name}</Link>)}</div></section>
      {!!posts.length && <section className="container-zen space-y-5"><h2 className="text-2xl font-black text-[#0f2747]">راهنمای خرید و نگهداری</h2><div className="grid gap-5 md:grid-cols-3">{posts.map((post) => <BlogCard key={post.id} post={post} />)}</div></section>}
    </div>
  );
}
