import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StructuredData } from "@/components/seo/structured-data";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buildBreadcrumbStructuredData, buildPageMetadata, SITE_URL } from "@/lib/seo";

const guideLinks = [
  {
    href: "/blog/fuel-system-revival-guide",
    title: "راهنمای کامل احیای سیستم سوخت",
    description: "تشخیص اولیه ناک، افت شتاب، بدکارکردن و انتخاب مسیر درست سرویس",
  },
  {
    href: "/blog/xado-atomex-energy-drive-guide",
    title: "مکمل سوخت زادو Energy Drive چیست؟",
    description: "کاربرد، روش مصرف و تفاوت نسخه بنزینی با شوینده‌ها و اکتان بوسترها",
  },
  {
    href: "/blog/octane-booster-vs-fuel-system-cleaner",
    title: "اکتان بوستر یا انژکتورشوی؟",
    description: "جدول تصمیم‌گیری برای انتخاب مکمل متناسب با نشانه‌های خودرو",
  },
  {
    href: "/blog/best-octane-booster-for-turbo-cars",
    title: "انتخاب اکتان بوستر برای خودروهای توربو",
    description: "نکات مهم درباره کیفیت بنزین، ناک و موتورهای پرفشار",
  },
] as const;

const faqItems = [
  {
    question: "احیای سیستم سوخت یعنی چه؟",
    answer:
      "احیای سیستم سوخت یک نام کلی برای تشخیص و برطرف‌کردن افت کیفیت احتراق، رسوب انژکتور یا مسیر سوخت و مشکلات ناشی از بنزین نامناسب است. این کار ممکن است از یک سرویس ساده شروع شود، اما در خرابی مکانیکی به تعمیر تخصصی نیاز دارد.",
  },
  {
    question: "برای افت شتاب اکتان بوستر بهتر است یا انژکتورشوی؟",
    answer:
      "اگر افت عملکرد همراه ناک و وابسته به کیفیت بنزین باشد، اکتان بوستر می‌تواند مرتبط‌تر باشد. اگر نشانه‌ها به رسوب و پاشش نامناسب انژکتور مربوط باشند، شوینده سیستم سوخت کاربرد متفاوتی دارد. تشخیص فنی همیشه مقدم بر خرید مکمل است.",
  },
  {
    question: "Energy Drive زادو اکتان بوستر است؟",
    answer:
      "Energy Drive نسخه بنزینی یک مکمل بهبود احتراق و عملکرد سوخت است. با وجود ادعای سازنده درباره بهبود مقاومت سوخت در برابر ناک، کاربرد و فرمول آن را نباید دقیقاً معادل هر اکتان بوستر یا انژکتورشوی دانست.",
  },
  {
    question: "آیا مکمل سوخت جای تعمیر خودرو را می‌گیرد؟",
    answer:
      "خیر. خرابی شمع، کویل، پمپ بنزین، سنسورها، انژکتور معیوب یا افت کمپرس باید به‌صورت فنی بررسی و تعمیر شود. مکمل سوخت فقط در محدوده کاربرد درج‌شده روی محصول قابل استفاده است.",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: "احیای سیستم سوخت خودرو | راهنمای اکتان، شوینده و Energy Drive",
  description:
    "راهنمای تخصصی احیای سیستم سوخت؛ تشخیص ناک، افت شتاب و رسوب، تفاوت اکتان بوستر و انژکتورشوی و معرفی مکمل زادو Energy Drive.",
  pathname: "/fuel-system-revival",
  imageUrl: "/blog/covers/xado-atomex-energy-drive-guide.png",
});

export default function FuelSystemRevivalPage() {
  return (
    <div className="container-zen py-5 sm:py-6 md:py-8">
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: "خانه", url: SITE_URL },
          { name: "احیای سیستم سوخت", url: `${SITE_URL}/fuel-system-revival` },
        ])}
      />
      <StructuredData data={buildFaqStructuredData()} />
      <StructuredData data={buildItemListStructuredData()} />

      <div className="mx-auto max-w-6xl space-y-10 text-text-strong">
        <Breadcrumb items={[{ href: "/", label: "خانه" }, { label: "احیای سیستم سوخت" }]} />

        <section className="grid items-center gap-7 border-b border-border pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <p className="text-xs font-black tracking-wide text-primary-accent-strong">مرکز راهنمای تخصصی اویل‌بار</p>
            <h1 className="mt-3 text-3xl font-black leading-[1.55] sm:text-4xl lg:text-5xl">
              احیای سیستم سوخت؛ اول تشخیص، بعد انتخاب مکمل
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-text-muted sm:text-base">
              ناک موتور، افت شتاب و مصرف بالا همیشه یک علت ندارند. این صفحه کمک می‌کند تفاوت اکتان بوستر،
              شوینده انژکتور، مکمل بهبود احتراق و سرویس مکانیکی را بشناسید و بی‌دلیل چند افزودنی را با هم ترکیب نکنید.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/blog/fuel-system-revival-guide">
                شروع راهنمای مرحله‌ای
              </Link>
              <Link className="btn-secondary" href="/support">
                مشاوره فنی رایگان
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[32px] border border-border bg-white p-6 shadow-sm">
            <Image
              alt="مکمل سوخت زادو AtomEX Energy Drive حجم ۲۵۰ میلی‌لیتر"
              className="object-contain p-5"
              fill
              priority
              sizes="(max-width: 1024px) 384px, 34vw"
              src="/products/xado/energy-drive-250ml.jpg"
            />
          </div>
        </section>

        <section aria-labelledby="diagnosis-title">
          <div className="max-w-3xl">
            <p className="text-xs font-black text-primary-accent-strong">تصمیم براساس نشانه</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl" id="diagnosis-title">
              هر مشکل، مکمل مخصوص خودش را ندارد
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-muted">
              نشانه‌های مشابه ممکن است از سوخت، رسوب یا خرابی قطعه باشند. مسیر زیر برای غربالگری اولیه است و جای عیب‌یابی تعمیرکار را نمی‌گیرد.
            </p>
          </div>
          <div className="mt-6 grid gap-x-8 border-t border-border md:grid-cols-2">
            {diagnosisItems.map((item) => (
              <article className="border-b border-border py-5" key={item.title}>
                <h3 className="font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-text-muted">{item.description}</p>
                <p className="mt-3 text-xs font-extrabold text-primary-accent-strong">نقطه شروع: {item.firstStep}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-y border-border py-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-black text-primary-accent-strong">تمرکز ویژه</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">AtomEX Energy Drive بنزینی</h2>
            <p className="mt-4 text-sm leading-8 text-text-muted">
              Energy Drive زادو یک مکمل ۲۵۰ میلی‌لیتری برای موتورهای بنزینی است. سازنده آن را برای کمک به کیفیت احتراق،
              پاسخ موتور و مقاومت بهتر سوخت در برابر ناک معرفی می‌کند؛ نتیجه واقعی به سلامت خودرو، کیفیت سوخت و مصرف دقیق طبق برچسب بستگی دارد.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/blog/xado-atomex-energy-drive-guide">
                راهنمای کامل Energy Drive
              </Link>
              <Link className="btn-secondary" href="/products/xado-atomex-energy-drive-250ml">
                مشاهده محصول
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {energyDriveFacts.map((fact) => (
              <div className="border-r-2 border-primary-accent-strong pr-4" key={fact.title}>
                <h3 className="text-sm font-black">{fact.title}</h3>
                <p className="mt-2 text-xs leading-6 text-text-muted">{fact.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="guides-title">
          <h2 className="text-2xl font-black" id="guides-title">راهنماهای احیای سوخت و اکتان</h2>
          <div className="mt-5 grid border-t border-border md:grid-cols-2 md:gap-x-8">
            {guideLinks.map((guide) => (
              <Link className="group flex items-center justify-between gap-4 border-b border-border py-5" href={guide.href} key={guide.href}>
                <span>
                  <span className="block font-black transition group-hover:text-primary-accent-strong">{guide.title}</span>
                  <span className="mt-1 block text-xs leading-6 text-text-muted">{guide.description}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-primary-accent-strong">←</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq-title" className="rounded-[28px] border border-border bg-surface p-5 sm:p-7">
          <h2 className="text-xl font-black" id="faq-title">پرسش‌های پرتکرار احیای سیستم سوخت</h2>
          <div className="mt-4 divide-y divide-border">
            {faqItems.map((item) => (
              <details className="group py-4" key={item.question}>
                <summary className="cursor-pointer list-none text-sm font-extrabold">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const diagnosisItems = [
  {
    title: "صدای ناک زیر بار یا در سربالایی",
    description: "اگر صدا با بنزین ضعیف تشدید می‌شود، کیفیت سوخت و اکتان موردنیاز موتور را بررسی کنید؛ ادامه ناک شدید می‌تواند آسیب‌زا باشد.",
    firstStep: "بررسی سوخت، خطاهای موتور و عدد اکتان توصیه‌شده",
  },
  {
    title: "بدکارکردن یا لرزش در دور آرام",
    description: "رسوب انژکتور فقط یکی از علت‌هاست. شمع، کویل، نشتی هوا و سنسورها نیز می‌توانند نشانه مشابه ایجاد کنند.",
    firstStep: "دیاگ و بررسی سیستم جرقه پیش از مصرف شوینده",
  },
  {
    title: "افت پاسخ پدال و شتاب",
    description: "مکمل بهبود احتراق مثل Energy Drive فقط در خودروی سالم و مصرف درست معنا دارد و خرابی مکانیکی را برطرف نمی‌کند.",
    firstStep: "کنترل سرویس‌های پایه، فیلترها و کیفیت سوخت",
  },
  {
    title: "مصرف سوخت یا آلایندگی غیرعادی",
    description: "این نشانه ممکن است از سنسور اکسیژن، انژکتور، فشار باد، ترموستات یا سبک رانندگی باشد؛ نتیجه را به یک افزودنی نسبت ندهید.",
    firstStep: "اندازه‌گیری و عیب‌یابی قبل از هزینه برای مکمل",
  },
] as const;

const energyDriveFacts = [
  {
    title: "کاربرد اصلی",
    description: "کمک به احتراق و پاسخ موتور بنزینی طبق توضیحات سازنده؛ نه تعمیر قطعات معیوب.",
  },
  {
    title: "روش مصرف",
    description: "یک بطری طبق حجم باک و دستور روی برچسب همان نسخه محصول؛ بیشتر ریختن بهتر نیست.",
  },
  {
    title: "تفاوت مهم",
    description: "نسخه بنزینی با Energy Drive Diesel و با شوینده AtomEX Multi Cleaner یک محصول نیست.",
  },
] as const;

function buildFaqStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function buildItemListStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "راهنماهای احیای سیستم سوخت اویل‌بار",
    itemListElement: guideLinks.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: guide.title,
      url: `${SITE_URL}${guide.href}`,
    })),
  };
}
