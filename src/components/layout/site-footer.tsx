import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">ZenLube</p>
          <p className="mt-2 max-w-md leading-6 text-slate-600">
            فروشگاه تخصصی روغن موتور برای خودروهای مدرن و کلاسیک با تمرکز بر سادگی، سرعت و
            تجربه کاربری مینیمال.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-slate-600">
          <Link href="/policy" className="transition hover:text-slate-900">
            حریم خصوصی
          </Link>
          <Link href="/terms" className="transition hover:text-slate-900">
            قوانین استفاده
          </Link>
          <Link href="/support" className="transition hover:text-slate-900">
            پشتیبانی
          </Link>
        </div>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} ZenLube - همه حقوق محفوظ است.</p>
      </div>
    </footer>
  );
}
