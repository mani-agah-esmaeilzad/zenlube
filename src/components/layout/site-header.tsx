import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CartIndicator } from "@/components/layout/cart-indicator";
import { CategoryDropdown } from "@/components/layout/category-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getAllCategoriesLite } from "@/lib/data";
import { getAppSession } from "@/lib/session";

export async function SiteHeader() {
  const [rawSession, categories] = await Promise.all([getAppSession(), getAllCategoriesLite()]);
  const sessionUser = (rawSession as { user?: { id?: string; role?: string | null } } | null)?.user;
  const isAuthenticated = Boolean(sessionUser?.id);
  type NavLink = { href: string; label: string; highlight?: boolean };
  const links: NavLink[] = [
    { href: "/products", label: "فروشگاه" },
    { href: "/products/compare", label: "مقایسه" },
    { href: "/brands", label: "برندها" },
    { href: "/cars", label: "انتخاب خودرو" },
    { href: "/blog", label: "راهنمای خرید" },
    { href: "/support", label: "مشاوره" },
  ];
  if (sessionUser?.role === "ADMIN") links.push({ href: "/admin", label: "پنل ادمین", highlight: true });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur">
      <div className="hidden border-b border-slate-100 bg-[#0f2747] text-white md:block">
        <div className="container-zen flex items-center justify-between py-2 text-xs">
          <span>ارسال سریع تهران و شهرستان • ضمانت اصالت روغن و فیلتر</span>
          <div className="flex items-center gap-5 text-white/85">
            <Link href="tel:02112345678" className="hover:text-white">مشاوره تخصصی: ۰۲۱-۱۲۳۴۵۶۷۸</Link>
            <Link href={isAuthenticated ? "/account" : "/sign-in"} className="hover:text-white">ورود / حساب کاربری</Link>
          </div>
        </div>
      </div>
      <div className="container-zen grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 lg:gap-6">
        <MobileNav links={links} isAuthenticated={isAuthenticated} categories={categories} />
        <Link href="/" className="flex items-center gap-2" aria-label="ZenLube خانه">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#0f2747] text-lg font-black text-orange-400">Z</span>
          <span className="hidden text-2xl font-black tracking-tight text-[#0f2747] sm:block">ZenLube</span>
        </Link>
        <form action="/products" className="relative order-4 col-span-3 lg:order-none lg:col-span-1">
          <input name="search" className="input-zen h-12 bg-slate-50 pr-12 text-sm" placeholder="جستجو در روغن موتور، فیلتر، برند، مدل خودرو…" aria-label="جستجوی محصول" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
          <button className="absolute left-1.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-orange-500 px-5 py-2 text-xs font-bold text-white md:block">جستجو</button>
        </form>
        <div className="flex items-center justify-end gap-2">
          <div className="hidden lg:block">{isAuthenticated ? <SignOutButton /> : <SignInButton />}</div>
          <CartIndicator />
        </div>
      </div>
      <nav className="hidden border-t border-slate-100 bg-white lg:block">
        <div className="container-zen flex items-center gap-7 py-2.5 text-sm text-slate-600">
          <CategoryDropdown categories={categories} />
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`transition hover:text-orange-600 ${link.highlight ? "font-bold text-orange-600" : ""}`}>{link.label}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
