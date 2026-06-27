import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getAllProductsWithFilters, getBrandsWithProductCount, getHighlightedCategories } from "@/lib/data";
import type { ProductSort } from "@/lib/data";

type ProductsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const sorts: { value: ProductSort; label: string }[] = [
  { value: "bestseller", label: "پرفروش‌ترین" }, { value: "latest", label: "جدیدترین" }, { value: "price-asc", label: "ارزان‌ترین" }, { value: "price-desc", label: "گران‌ترین" }, { value: "rating", label: "مرتبط‌ترین" },
];
const oilFilters = ["0W-20", "5W-30", "5W-40", "10W-40", "تمام سنتتیک", "نیمه سنتتیک", "API SP", "ارسال فوری", "تخفیف‌دار"];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const brand = typeof params.brand === "string" ? params.brand : undefined;
  const car = typeof params.car === "string" ? params.car : undefined;
  const allowedSorts = sorts.map((s) => s.value);
  const sort = typeof params.sort === "string" && allowedSorts.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : "latest";
  const page = Number(params.page ?? "1") || 1;
  const [categories, brands, productsResult] = await Promise.all([getHighlightedCategories(), getBrandsWithProductCount(), getAllProductsWithFilters({ search, category, brand, car, sort, page })]);
  const { items, pageInfo } = productsResult;
  return (
    <div className="container-zen py-8">
      <nav className="mb-5 text-xs text-slate-500"><Link href="/">خانه</Link> / فروشگاه</nav>
      <div className="card-zen mb-6 overflow-hidden bg-[#0f2747] p-6 text-white"><h1 className="text-3xl font-black">فروشگاه تخصصی روغن موتور و فیلتر</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">بر اساس برند، ویسکوزیته، نوع روغن، استاندارد API و سازگاری خودرو فیلتر کنید. {pageInfo.total.toLocaleString("fa-IR")} کالا پیدا شد.</p></div>
      <form method="get" className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card-zen h-fit p-5 lg:sticky lg:top-44">
          <div className="flex items-center justify-between"><h2 className="font-black text-[#0f2747]">فیلترها</h2><Link href="/products" className="text-xs font-bold text-orange-600">حذف فیلترها</Link></div>
          <div className="mt-5 space-y-4">
            <label className="block text-xs font-bold text-slate-600">جستجو<input name="search" defaultValue={search} className="input-zen mt-2" placeholder="نام محصول، برند، مدل خودرو" /></label>
            <label className="block text-xs font-bold text-slate-600">دسته‌بندی<select name="category" defaultValue={category ?? ""} className="input-zen mt-2"><option value="">همه دسته‌ها</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></label>
            <label className="block text-xs font-bold text-slate-600">برند<select name="brand" defaultValue={brand ?? ""} className="input-zen mt-2"><option value="">همه برندها</option>{brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}</select></label>
            <label className="block text-xs font-bold text-slate-600">مناسب برای خودرو<input name="car" defaultValue={car} className="input-zen mt-2" placeholder="اسلاگ خودرو" /></label>
            <div><p className="mb-2 text-xs font-bold text-slate-600">فیلترهای سریع روغن</p><div className="flex flex-wrap gap-2">{oilFilters.map((f) => <Link key={f} href={`/products?search=${encodeURIComponent(f)}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-orange-300 hover:text-orange-600">{f}</Link>)}</div></div>
            <button className="btn-primary w-full">اعمال فیلتر</button>
          </div>
        </aside>
        <section>
          <div className="card-zen mb-5 flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap gap-2 text-xs">{[search, category, brand, car].filter(Boolean).map((x) => <span key={x} className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{x}</span>)}</div><label className="flex items-center gap-2 text-xs font-bold text-slate-600">مرتب‌سازی<select name="sort" defaultValue={sort} className="rounded-full border border-slate-200 bg-white px-3 py-2">{sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select><button className="btn-secondary !px-4 !py-2 text-xs">اعمال</button></label></div>
          {items.length ? <div className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="card-zen p-12 text-center"><p className="text-xl font-black text-slate-800">نتیجه‌ای پیدا نشد</p><p className="mt-2 text-sm text-slate-500">فیلترها را تغییر دهید یا از مشاوره انتخاب روغن کمک بگیرید.</p><Link href="/products" className="btn-primary mt-5">حذف فیلترها</Link></div>}
          {pageInfo.totalPages > 1 && <div className="mt-8 flex justify-center gap-3 text-sm">{pageInfo.hasPreviousPage && <Link className="btn-outline" href={{ pathname: "/products", query: { ...params, page: String(page - 1) } }}>قبلی</Link>}<span className="rounded-full bg-white px-4 py-2">صفحه {page} از {pageInfo.totalPages}</span>{pageInfo.hasNextPage && <Link className="btn-outline" href={{ pathname: "/products", query: { ...params, page: String(page + 1) } }}>بعدی</Link>}</div>}
        </section>
      </form>
    </div>
  );
}

function FilterField({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
      {label}
      {children}
    </label>
  );
}

const menuLinks = [
  { label: "خانه", href: "/" },
  { label: "محصولات", href: "/products" },
  { label: "صنایع", href: "/brands" },
  { label: "خدمات", href: "/support" },
  { label: "همکاری با ما", href: "/contact" },
];

const secondaryLinks = [
  { label: "راهنمای انتخاب محصول", href: "/products" },
  { label: "یافتن نمایندگی", href: "/support" },
  { label: "درخواست مشاوره", href: "/support" },
];

function CastrolMenu(props: HTMLAttributes<HTMLElement>) {
  const { className, ...rest } = props;
  return (
    <aside
      {...rest}
      className={`space-y-6 rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(0,122,61,0.08)] ${className ?? ""}`}
    >
      <div className="flex items-center gap-3">
        <LogoMark size={48} />
        <div className="text-right">
          <p className="text-xs text-slate-400">Oilbar Global</p>
          <p className="text-base font-semibold text-slate-900">ناوبری سریع</p>
        </div>
      </div>
      <nav className="space-y-2 text-sm font-semibold text-slate-700">
        {menuLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${
              link.href === "/products" ? "bg-emerald-600 text-white" : "hover:bg-slate-50"
            }`}
          >
            <span>{link.label}</span>
            <span className="text-xs">{link.href === "/products" ? "●" : "›"}</span>
          </Link>
        ))}
      </nav>
      <div className="space-y-3 text-xs text-slate-500">
        {secondaryLinks.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:border-emerald-200">
            <span>{link.label}</span>
            <span className="text-emerald-600">→</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
