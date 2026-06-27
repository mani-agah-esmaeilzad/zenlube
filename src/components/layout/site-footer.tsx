import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  { title: "دسته‌بندی‌ها", links: [["روغن موتور", "/products?category=engine-oil"], ["فیلتر روغن", "/products?search=فیلتر روغن"], ["ضدیخ", "/products?search=ضدیخ"], ["روغن گیربکس", "/products?search=گیربکس"]] },
  { title: "خدمات مشتریان", links: [["پیگیری سفارش", "/account"], ["پشتیبانی", "/support"], ["قوانین", "/terms"], ["حریم خصوصی", "/policy"]] },
  { title: "راهنما", links: [["راهنمای انتخاب روغن", "/blog"], ["انتخاب بر اساس خودرو", "/cars"], ["برندها", "/brands"], ["مقایسه محصولات", "/products/compare"]] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#0f2747] text-white">
      <div className="container-zen grid gap-10 py-12 lg:grid-cols-[1.4fr_2fr_1fr]">
        <div>
          <p className="text-2xl font-black">ZenLube</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">فروشگاه تخصصی روغن موتور، فیلتر و روانکار خودرو با تمرکز بر کالای اصل، انتخاب فنی دقیق و تجربه خرید سریع و مطمئن.</p>
          <div className="mt-5 space-y-2 text-sm text-white/80"><p>پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</p><p>تهران، مرکز پردازش سفارش ZenLube</p></div>
        </div>
        <div className="grid gap-7 sm:grid-cols-3">
          {footerGroups.map((group) => <div key={group.title}><h3 className="font-bold text-white">{group.title}</h3><ul className="mt-4 space-y-3 text-sm text-white/65">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-orange-300">{label}</Link></li>)}</ul></div>)}
        </div>
        <div>
          <h3 className="font-bold">خبرنامه و اعتماد</h3>
          <form className="mt-4 flex overflow-hidden rounded-2xl bg-white p-1"><input aria-label="ایمیل خبرنامه" placeholder="ایمیل شما" className="min-w-0 flex-1 px-3 text-sm text-slate-900 outline-none" /><button className="rounded-xl bg-orange-500 px-3 text-xs font-bold text-white">عضویت</button></form>
          <Link href="#" className="mt-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-white p-3" aria-label="نماد اعتماد الکترونیکی"><Image src="/enamad-placeholder.svg" alt="محل قرارگیری نماد اعتماد" width={80} height={80} className="h-full w-full object-contain" /></Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/55">© {new Date().getFullYear()} ZenLube - همه حقوق محفوظ است.</div>
    </footer>
  );
}
