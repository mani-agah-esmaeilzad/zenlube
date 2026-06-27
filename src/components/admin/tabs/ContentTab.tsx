import Link from "next/link";
import { Children } from "react";
import type { ReactNode } from "react";
import { faDateFormatter, faNumberFormatter } from "@/lib/formatters";
import type { ContentTabData } from "@/services/admin/types";

const cmsSections = [
  { title: "بنرها و کمپین‌ها", status: "مدل فعال", detail: "MarketingBanner برای hero، بنر تبلیغاتی، CTA، زمان‌بندی و وضعیت فعال آماده است." },
  { title: "مقالات و راهنماها", status: "مدل فعال", detail: "BlogPost برای مدیریت مقاله، تگ، کاور، نویسنده، انتشار و زمان مطالعه وجود دارد." },
  { title: "رسانه‌ها", status: "مدل فعال", detail: "GalleryImage برای تصاویر عمومی، ترتیب نمایش و وضعیت فعال/غیرفعال آماده است." },
  { title: "تنظیمات سایت", status: "نیازمند مدل", detail: "نام سایت، لوگو، شبکه‌های اجتماعی، footer و announcement برای ذخیره پایدار به SiteSetting نیاز دارد." },
  { title: "منو و مگامنو", status: "نیازمند مدل", detail: "برای reorder و parent/child منو بهتر است NavigationItem اضافه شود." },
  { title: "کد تخفیف", status: "نیازمند مدل", detail: "Coupon/Campaign برای درصد، مبلغ ثابت، محدودیت مصرف و تاریخ انقضا لازم است." },
  { title: "ارسال و تحویل", status: "منطق ثابت", detail: "ShippingMethod در سفارش وجود دارد، اما تنظیم قیمت‌ها اکنون در منطق checkout ثابت است." },
  { title: "پیام‌های پشتیبانی", status: "نیازمند مدل", detail: "برای inbox پشتیبانی نیاز به ContactMessage یا Ticket وجود دارد." },
];

export function ContentTab({ data }: { data: ContentTabData }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="بنرها" value={data.banners.length} helper={`${data.banners.filter((item) => item.isActive).length} فعال`} />
        <MetricCard label="مقالات" value={data.posts.length} helper="راهنماها و محتوای آموزشی" />
        <MetricCard label="رسانه‌ها" value={data.galleryImages.length} helper={`${data.galleryImages.filter((item) => item.isActive).length} فعال`} />
      </section>

      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">مرکز مدیریت محتوای Oilbar</h2>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">
              این بخش وضعیت قابلیت‌های CMS را بر اساس مدل‌های فعلی دیتابیس نشان می‌دهد؛ موارد «نیازمند مدل» بدون migration امن، ذخیره‌سازی پایدار ندارند.
            </p>
          </div>
          <Link href="/admin?tab=products" className="btn-primary">افزودن محصول</Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cmsSections.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#111827]">{item.title}</h3>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === "مدل فعال" ? "bg-green-50 text-[#16A34A]" : item.status === "منطق ثابت" ? "bg-amber-50 text-[#F59E0B]" : "bg-slate-100 text-[#6B7280]"}`}>
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-xs leading-6 text-[#6B7280]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="بنرهای مارکتینگ" empty="بنری ثبت نشده است.">
          {data.banners.map((banner) => (
            <div key={banner.id} className="rounded-2xl border border-[#E5E7EB] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#111827]">{banner.title}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">{banner.position}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${banner.isActive ? "bg-green-50 text-[#16A34A]" : "bg-slate-100 text-[#6B7280]"}`}>
                  {banner.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
              {banner.subtitle && <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#6B7280]">{banner.subtitle}</p>}
            </div>
          ))}
        </Panel>

        <Panel title="مقالات و راهنماها" empty="مقاله‌ای ثبت نشده است.">
          {data.posts.slice(0, 8).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded-2xl border border-[#E5E7EB] p-4 transition hover:border-red-200">
              <p className="line-clamp-2 text-sm font-bold text-[#111827]">{post.title}</p>
              <p className="mt-2 text-xs text-[#6B7280]">
                {post.authorName} · {post.readMinutes.toLocaleString("fa-IR")} دقیقه · {faDateFormatter.format(post.publishedAt)}
              </p>
            </Link>
          ))}
        </Panel>

        <Panel title="کتابخانه رسانه" empty="رسانه‌ای ثبت نشده است.">
          {data.galleryImages.slice(0, 8).map((image) => (
            <div key={image.id} className="rounded-2xl border border-[#E5E7EB] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#111827]">{image.title}</p>
                <span className="text-xs text-[#6B7280]">#{image.orderIndex.toLocaleString("fa-IR")}</span>
              </div>
              <p className="mt-2 truncate text-xs text-[#6B7280]">{image.imageUrl}</p>
            </div>
          ))}
        </Panel>
      </section>
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5">
      <p className="text-sm font-bold text-[#6B7280]">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-[#111827]">{faNumberFormatter.format(value)}</p>
      <p className="mt-1 text-xs text-[#6B7280]">{helper}</p>
    </div>
  );
}

function Panel({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const hasChildren = Children.count(children) > 0;

  return (
    <section className="rounded-3xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-lg font-extrabold text-[#111827]">{title}</h2>
      <div className="mt-4 space-y-3">
        {hasChildren ? children : <p className="rounded-2xl border border-dashed border-[#E5E7EB] p-6 text-center text-sm text-[#6B7280]">{empty}</p>}
      </div>
    </section>
  );
}
