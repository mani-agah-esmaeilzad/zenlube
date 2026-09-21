import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/seo/structured-data";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buildBreadcrumbStructuredData, buildPageMetadata, SITE_URL } from "@/lib/seo";

const PAGE_PATH = "/cars/mg-360";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const COVER_IMAGE = "/vehicles/mg/mg-360.webp";

const variants = [
  {
    title: "ام جی 360 دنده‌ای",
    href: "/cars/hyundai-65-mg-360-mt",
    engine: "۱.۵ لیتر تنفس طبیعی، ۴ سیلندر ۱۶ سوپاپ",
    power: "۱۱۰ اسب‌بخار",
    torque: "۱۳۵ نیوتن‌متر",
    gearbox: "۵ دنده دستی",
    oil: "5W-30، حجم سرویس ۴.۱ لیتر",
  },
  {
    title: "ام جی 360 اتومات",
    href: "/cars/hyundai-64-mg-360-at",
    engine: "۱.۵ لیتر تنفس طبیعی، ۴ سیلندر ۱۶ سوپاپ",
    power: "۱۱۰ اسب‌بخار",
    torque: "۱۳۵ نیوتن‌متر",
    gearbox: "۴ دنده اتوماتیک",
    oil: "5W-30، حجم سرویس ۴.۱ لیتر",
  },
  {
    title: "ام جی 360 توربو اتومات",
    href: "/cars/hyundai-63-mg-360-turbo-1-5t-at",
    engine: "۱.۵ لیتر توربوشارژ، ۴ سیلندر ۱۶ سوپاپ",
    power: "۱۳۰ اسب‌بخار",
    torque: "۲۱۰ نیوتن‌متر",
    gearbox: "۶ دنده اتوماتیک",
    oil: "5W-30 / 0W-30 / 10W-30، حجم سرویس ۴.۱ لیتر",
  },
] as const;

const generalSpecs = [
  ["نام خودرو", "MG 360 / ام جی 360"],
  ["کلاس بدنه", "سدان خانوادگی جمع‌وجور"],
  ["سال‌های عرضه در ایران", "۱۳۹۶ تا ۱۳۹۸"],
  ["حجم موتور", "۱۴۹۸ سی‌سی"],
  ["تعداد سیلندر و سوپاپ", "۴ سیلندر، ۱۶ سوپاپ"],
  ["محور محرک", "دیفرانسیل جلو"],
  ["حجم باک", "۵۵ لیتر"],
  ["حجم صندوق عقب", "۴۸۲ لیتر"],
  ["فاصله محوری", "۲۶۶۰ میلی‌متر"],
  ["ابعاد بدنه", "طول ۴۵۷۹، عرض ۱۸۰۴ و ارتفاع ۱۴۹۰ میلی‌متر"],
  ["سایز لاستیک", "205/55R16"],
] as const;

const commonEquipment = [
  "ترمز ABS و توزیع الکترونیکی نیروی ترمز EBD",
  "ترمز کمکی و کنترل ترمز در پیچ CBC",
  "فرمان برقی و تنظیم ارتفاع فرمان",
  "دو کیسه هوای جلو و اتصالات ISOFIX",
  "سنسور پارک و دوربین دید عقب در نسخه‌های مجهز",
  "نمایشگر ۸ اینچی، بلوتوث، USB و AUX",
  "رینگ ۱۶ اینچی و تایر 205/55R16",
  "سانروف برقی و تهویه مطبوع در نسخه‌های عرضه‌شده در ایران",
] as const;

const faqs = [
  {
    question: "تفاوت ام جی 360 توربو با نسخه اتومات معمولی چیست؟",
    answer:
      "نسخه توربو ۱۳۰ اسب‌بخار قدرت و ۲۱۰ نیوتن‌متر گشتاور دارد و از گیربکس ۶ سرعته اتوماتیک استفاده می‌کند. نسخه اتومات تنفس طبیعی ۱۱۰ اسب‌بخار است و گیربکس ۴ سرعته اتوماتیک دارد.",
  },
  {
    question: "ام جی 360 چند مدل دارد؟",
    answer:
      "در بازار ایران سه نسخه اصلی دنده‌ای، اتومات تنفس طبیعی و توربو اتومات شناخته می‌شود. موتور، گیربکس و بعضی تجهیزات این نسخه‌ها با هم متفاوت است.",
  },
  {
    question: "روغن موتور مناسب MG 360 چیست؟",
    answer:
      "برای نسخه‌های تنفس طبیعی، 5W-30 در دفترچه اویل‌بار ثبت شده است. برای نسخه توربو، 5W-30 انتخاب اصلی و 0W-30 یا 10W-30 بسته به شرایط دمایی ثبت شده‌اند. سطح کیفی و مدل دقیق خودرو باید از صفحه همان نسخه کنترل شود.",
  },
  {
    question: "حجم روغن موتور ام جی 360 چقدر است؟",
    answer:
      "حجم سرویس ثبت‌شده برای نسخه‌های MG 360 حدود ۴.۱ لیتر همراه با تعویض فیلتر است. سطح نهایی روغن پس از سرویس باید طبق روش دفترچه کنترل شود.",
  },
] as const;

const carStructuredData = {
  "@context": "https://schema.org",
  "@type": "Car",
  "@id": `${PAGE_URL}#car`,
  url: PAGE_URL,
  name: "ام جی 360",
  alternateName: ["MG 360", "ام‌جی ۳۶۰", "MG360"],
  image: `${SITE_URL}${COVER_IMAGE}`,
  description:
    "مشخصات فنی ام جی 360 و مقایسه نسخه‌های دنده‌ای، اتومات تنفس طبیعی و توربو اتومات در بازار ایران.",
  brand: { "@type": "Brand", name: "MG" },
  model: "360",
  bodyType: "سدان",
  fuelType: "بنزین",
  vehicleModelDate: "2017",
  vehicleTransmission: ["۵ دنده دستی", "۴ دنده اتوماتیک", "۶ دنده اتوماتیک"],
  seatingCapacity: 5,
  additionalProperty: generalSpecs.slice(3).map(([name, value]) => ({
    "@type": "PropertyValue",
    name,
    value,
  })),
};

export const metadata: Metadata = buildPageMetadata({
  pathname: PAGE_PATH,
  title: "مشخصات ام جی 360 | مقایسه دنده‌ای، اتومات و توربو",
  description:
    "مشخصات فنی ام جی 360، قدرت موتور، گیربکس، مصرف و ابعاد؛ مقایسه کامل نسخه‌های دنده‌ای، اتومات و توربو همراه روغن موتور و دفترچه هر مدل.",
  imageUrl: COVER_IMAGE,
});

export default function Mg360OverviewPage() {
  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: "خانه", url: SITE_URL },
          { name: "دفترچه خودروها", url: `${SITE_URL}/cars` },
          { name: "مشخصات ام جی 360", url: PAGE_URL },
        ])}
      />
      <StructuredData data={carStructuredData} />

      <Breadcrumb
        items={[
          { href: "/", label: "خانه" },
          { href: "/cars", label: "دفترچه خودروها" },
          { label: "مشخصات ام جی 360" },
        ]}
      />

      <article className="space-y-8">
        <header className="grid overflow-hidden border-y border-white/10 bg-primary text-white lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="flex flex-col justify-center p-5 sm:p-7 md:p-9">
            <p className="text-xs font-extrabold text-primary-accent">راهنمای جامع MG 360</p>
            <h1 className="mt-2 text-[1.8rem] font-black leading-[1.55] tracking-[-0.035em] md:text-4xl">
              مشخصات ام جی 360؛ مقایسه دنده‌ای، اتومات و توربو
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/75 md:text-base">
              ام جی 360 در ایران با سه ترکیب فنی دنده‌ای، اتومات تنفس طبیعی و توربو اتومات عرضه شد. این صفحه مشخصات فنی، تفاوت نسخه‌ها، امکانات و مسیر دسترسی به دفترچه سرویس دقیق هر مدل را یک‌جا جمع می‌کند.
            </p>
            <nav aria-label="دسترسی سریع نسخه‌های ام جی 360" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-extrabold">
              {variants.map((variant) => (
                <Link className="inline-flex min-h-11 items-center text-white/80 transition hover:text-white" href={variant.href} key={variant.href}>
                  {variant.title}
                </Link>
              ))}
            </nav>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="نمای سه رخ ام جی 360 زرد"
            className="aspect-[16/10] h-full w-full object-cover lg:aspect-auto"
            fetchPriority="high"
            src={COVER_IMAGE}
          />
        </header>

        <section aria-labelledby="mg360-summary-title" className="space-y-5">
          <div>
            <h2 className="section-title" id="mg360-summary-title">ام جی 360 در یک نگاه</h2>
            <p className="section-subtitle max-w-4xl">
              MG 360 یک سدان دیفرانسیل جلو با موتور ۱.۵ لیتری است. نسخه‌های معمولی روی مصرف و استفاده خانوادگی تمرکز دارند؛ نسخه توربو قدرت و گشتاور بیشتر را با گیربکس ۶ سرعته ارائه می‌دهد.
            </p>
          </div>
          <dl className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
            <QuickFact label="پیشرانه" value="۱.۵ لیتر تنفس طبیعی یا توربو" />
            <QuickFact label="قدرت" value="۱۱۰ یا ۱۳۰ اسب‌بخار" />
            <QuickFact label="گیربکس" value="دستی ۵، اتومات ۴ یا اتومات ۶ سرعته" />
            <QuickFact label="سال عرضه ایران" value="۱۳۹۶ تا ۱۳۹۸" />
          </dl>
        </section>

        <section aria-labelledby="mg360-variants-title" className="space-y-5">
          <div>
            <h2 className="section-title" id="mg360-variants-title">مقایسه مدل‌های ام جی 360</h2>
            <p className="section-subtitle">برای اطلاعات روغن، سرویس و قطعات مصرفی، دفترچه نسخه دقیق خودرو را باز کنید.</p>
          </div>
          <div className="overflow-x-auto border-y border-border">
            <table className="w-full min-w-[760px] border-collapse text-right text-sm">
              <thead className="bg-surface-muted text-xs text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-extrabold">نسخه</th>
                  <th className="px-4 py-3 font-extrabold">موتور</th>
                  <th className="px-4 py-3 font-extrabold">قدرت / گشتاور</th>
                  <th className="px-4 py-3 font-extrabold">گیربکس</th>
                  <th className="px-4 py-3 font-extrabold">روغن موتور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((variant) => (
                  <tr key={variant.href}>
                    <th className="px-4 py-4 align-top font-extrabold text-text-strong">
                      <Link className="text-link-zen" href={variant.href}>{variant.title}</Link>
                    </th>
                    <td className="px-4 py-4 align-top leading-7 text-text-muted">{variant.engine}</td>
                    <td className="px-4 py-4 align-top leading-7 text-text-muted">{variant.power} / {variant.torque}</td>
                    <td className="px-4 py-4 align-top font-bold leading-7 text-text-strong">{variant.gearbox}</td>
                    <td className="px-4 py-4 align-top leading-7 text-text-muted">{variant.oil}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="mg360-specs-title" className="space-y-5">
          <div>
            <h2 className="section-title" id="mg360-specs-title">جدول مشخصات فنی ام جی 360</h2>
            <p className="section-subtitle">اعداد ابعاد و فضای بار براساس کاتالوگ MG 360 بازار خاورمیانه ثبت شده‌اند.</p>
          </div>
          <dl className="grid border-y border-border md:grid-cols-2 md:gap-x-8">
            {generalSpecs.map(([label, value]) => (
              <div className="grid grid-cols-[minmax(110px,0.7fr)_minmax(0,1.3fr)] gap-3 border-b border-border py-3 last:border-b-0 md:last:border-b" key={label}>
                <dt className="text-sm font-bold text-text-muted">{label}</dt>
                <dd className="text-sm font-extrabold leading-7 text-text-strong">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid gap-8 border-y border-border py-6 lg:grid-cols-2">
          <div>
            <h2 className="section-title">امکانات و تجهیزات مهم</h2>
            <ul className="mt-4 divide-y divide-border">
              {commonEquipment.map((item) => (
                <li className="py-3 text-sm leading-7 text-text-muted" key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="section-title">کدام نسخه مناسب‌تر است؟</h2>
            <div className="mt-4 space-y-4 text-sm leading-8 text-text-muted">
              <p><strong className="text-text-strong">دنده‌ای:</strong> ساختار ساده‌تر و کنترل مستقیم‌تر دارد و برای کسی مناسب است که گیربکس دستی را ترجیح می‌دهد.</p>
              <p><strong className="text-text-strong">اتومات تنفس طبیعی:</strong> برای استفاده روزمره شهری آرام‌تر است، اما گیربکس چهارسرعته و توان ۱۱۰ اسب‌بخاری آن با نسخه توربو یکسان نیست.</p>
              <p><strong className="text-text-strong">توربو اتومات:</strong> با قدرت ۱۳۰ اسب‌بخار، گشتاور ۲۱۰ نیوتن‌متر و گیربکس شش‌سرعته، عملکرد قوی‌تری دارد و نسبت به کیفیت روغن و سرویس منظم حساس‌تر است.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="mg360-service-title" className="space-y-5">
          <div>
            <h2 className="section-title" id="mg360-service-title">روغن و سرویس ام جی 360</h2>
            <p className="section-subtitle max-w-4xl">
              مشخصات سرویس را با مدل گیربکس اشتباه نگیرید. انتخاب روغن موتور و روغن گیربکس باید از دفترچه نسخه دقیق انجام شود.
            </p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {variants.map((variant) => (
              <Link className="group flex items-center justify-between gap-4 py-4" href={variant.href} key={variant.href}>
                <span>
                  <span className="block font-extrabold text-text-strong transition group-hover:text-primary-accent-strong">دفترچه {variant.title}</span>
                  <span className="mt-1 block text-xs leading-6 text-text-muted">روغن موتور، حجم سرویس، روغن گیربکس و محصولات سازگار</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-primary-accent-strong">←</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="mg360-faq-title" className="border-t border-border pt-6">
          <h2 className="section-title" id="mg360-faq-title">سوالات پرتکرار درباره ام جی 360</h2>
          <div className="mt-5 divide-y divide-border border-y border-border">
            {faqs.map((item) => (
              <details className="py-4" key={item.question}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-extrabold text-text-strong">{item.question}</summary>
                <p className="mt-3 max-w-4xl text-sm leading-8 text-text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="mg360-related-title" className="border-t border-border pt-6">
          <h2 className="section-title" id="mg360-related-title">راهنمای مدل‌های دیگر MG</h2>
          <nav aria-label="راهنمای مدل‌های دیگر ام جی" className="mt-4 flex flex-wrap gap-2">
            {[
              ["/cars/mg-5", "ام جی 5"],
              ["/cars/mg-6", "ام جی 6"],
              ["/cars/mg-gs", "ام جی GS"],
              ["/cars/mg-rx5", "ام جی RX5"],
            ].map(([href, label]) => (
              <Link className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-xs font-extrabold text-text transition hover:border-primary-accent-strong hover:text-primary-accent-strong" href={href} key={href}>
                مشخصات {label}
              </Link>
            ))}
          </nav>
        </section>

        <footer className="border-t border-border pt-5 text-xs leading-7 text-text-subtle">
          <p>
            منابع فنی: اطلاعات دفترچه‌های ثبت‌شده هر سه نسخه در اویل‌بار و کاتالوگ MG 360 بازار خاورمیانه. تجهیزات ممکن است با توجه به تیپ و سری مونتاژ متفاوت باشند.
          </p>
          <p className="mt-1">آخرین بازبینی: شهریور ۱۴۰۵</p>
        </footer>
      </article>
    </div>
  );
}

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-4 py-4 last:border-b-0 sm:border-l sm:last:border-l-0 lg:border-b-0">
      <dt className="text-xs font-bold text-text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-extrabold leading-7 text-text-strong">{value}</dd>
    </div>
  );
}
