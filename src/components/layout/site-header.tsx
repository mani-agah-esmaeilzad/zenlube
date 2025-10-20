import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CartIndicator } from "@/components/layout/cart-indicator";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const links = [
    { href: "/products", label: "محصولات" },
    { href: "/categories", label: "دسته‌بندی‌ها" },
    { href: "/brands", label: "برندها" },
    { href: "/blog", label: "وبلاگ" },
    { href: "/cars", label: "لیست ماشین‌ها" },
    { href: "/account", label: "حساب کاربری" },
  ];

  if (session?.user?.role === "ADMIN") {
    links.push({ href: "/admin", label: "پنل ادمین", highlight: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="border-b border-white/10 bg-black/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs text-white/60">
          <span>ارسال رایگان سفارش‌های بالای ۳ میلیون تومان • مشاوره تخصصی: ۰۲۱-۱۲۳۴۵۶۷۸</span>
          <Link href="/support" className="text-purple-200 hover:text-purple-100">
            پشتیبانی آنلاین
          </Link>
        </div>
      </div>
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold text-white">
            ZenLube
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/80 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-white ${link.highlight ? "font-semibold text-purple-300 hover:text-purple-200" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <form
          action="/products"
          className="hidden flex-1 items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white/70 shadow-inner shadow-black/30 focus-within:border-purple-300 focus-within:text-white md:flex"
        >
          <input
            name="search"
            placeholder="جستجوی محصول، برند یا استاندارد..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
          <button
            type="submit"
            className="rounded-full bg-purple-500 px-4 py-1 text-xs font-semibold text-white hover:bg-purple-400"
          >
            جستجو
          </button>
        </form>
        <div className="flex items-center gap-3">
          <MobileNav links={links} isAuthenticated={Boolean(session)} />
          <CartIndicator />
          {session ? <SignOutButton /> : <SignInButton />}
        </div>
      </div>
    </header>
  );
}
