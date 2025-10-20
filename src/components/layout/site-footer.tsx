import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">ZenLube</p>
          <p className="mt-2 max-w-md leading-6">
            فروشگاه تخصصی روغن موتور برای خودروهای مدرن و کلاسیک با تمرکز بر سادگی، سرعت و
            تجربه کاربری مینیمال.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/policy" className="transition hover:text-white">
            حریم خصوصی
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            قوانین استفاده
          </Link>
          <Link href="/support" className="transition hover:text-white">
            پشتیبانی
          </Link>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} ZenLube - همه حقوق محفوظ است.</p>
      </div>
    </footer>
  );
}
