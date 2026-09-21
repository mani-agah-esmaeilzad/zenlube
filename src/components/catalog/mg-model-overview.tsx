import Link from "next/link";

import { StructuredData } from "@/components/seo/structured-data";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { MgModelHub } from "@/lib/mg-model-hubs";
import { buildBreadcrumbStructuredData, SITE_URL } from "@/lib/seo";

const otherModels = [
  { href: "/cars/mg-360", label: "ام جی 360" },
  { href: "/cars/mg-5", label: "ام جی 5" },
  { href: "/cars/mg-6", label: "ام جی 6" },
  { href: "/cars/mg-gs", label: "ام جی GS" },
  { href: "/cars/mg-rx5", label: "ام جی RX5" },
] as const;

export function MgModelOverview({ hub }: { hub: MgModelHub }) {
  const pagePath = `/cars/${hub.slug}`;
  const pageUrl = `${SITE_URL}${pagePath}`;
  const carStructuredData = {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${pageUrl}#car`,
    url: pageUrl,
    name: hub.name,
    alternateName: [hub.latinName, hub.name.replaceAll(" ", "")],
    image: `${SITE_URL}${hub.image}`,
    description: hub.description,
    brand: { "@type": "Brand", name: "MG" },
    model: hub.latinName.replace(/^MG\s*/i, ""),
    bodyType: hub.bodyType,
    fuelType: "بنزین",
    vehicleTransmission: hub.variants.map((variant) => variant.gearbox),
    additionalProperty: hub.specifications.slice(2).map(([name, value]) => ({
      "@type": "PropertyValue",
      name,
      value,
    })),
  };
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: hub.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <StructuredData data={buildBreadcrumbStructuredData([
        { name: "خانه", url: SITE_URL },
        { name: "دفترچه خودروها", url: `${SITE_URL}/cars` },
        { name: `مشخصات ${hub.name}`, url: pageUrl },
      ])} />
      <StructuredData data={carStructuredData} />
      <StructuredData data={faqStructuredData} />

      <Breadcrumb items={[
        { href: "/", label: "خانه" },
        { href: "/cars", label: "دفترچه خودروها" },
        { label: `مشخصات ${hub.name}` },
      ]} />

      <article className="space-y-8">
        <header className="grid overflow-hidden border-y border-white/10 bg-primary text-white lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="flex flex-col justify-center p-5 sm:p-7 md:p-9">
            <p className="text-xs font-extrabold text-primary-accent">راهنمای جامع {hub.latinName}</p>
            <h1 className="mt-2 text-[1.8rem] font-black leading-[1.55] tracking-[-0.035em] md:text-4xl">
              {hub.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/75 md:text-base">{hub.intro}</p>
            <nav aria-label={`دسترسی سریع نسخه‌های ${hub.name}`} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-extrabold">
              {hub.variants.map((variant) => (
                <Link className="inline-flex min-h-11 items-center text-white/80 transition hover:text-white" href={variant.href} key={variant.href}>
                  دفترچه {variant.title}
                </Link>
              ))}
            </nav>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={hub.imageAlt} className="aspect-[16/10] h-full w-full bg-white object-contain lg:aspect-auto" fetchPriority="high" src={hub.image} />
        </header>

        <section aria-labelledby={`${hub.slug}-summary-title`} className="space-y-5">
          <div>
            <h2 className="section-title" id={`${hub.slug}-summary-title`}>{hub.name} در یک نگاه</h2>
            <p className="section-subtitle max-w-4xl">{hub.overview}</p>
          </div>
          <dl className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
            <QuickFact label="پیشرانه" value={hub.engineSummary} />
            <QuickFact label="قدرت" value={hub.powerSummary} />
            <QuickFact label="گیربکس" value={hub.gearboxSummary} />
            <QuickFact label="سال یا نسخه" value={hub.years} />
          </dl>
        </section>

        <section aria-labelledby={`${hub.slug}-variants-title`} className="space-y-5">
          <div>
            <h2 className="section-title" id={`${hub.slug}-variants-title`}>{hub.variants.length > 1 ? `مقایسه مدل‌های ${hub.name}` : `نسخه بررسی‌شده ${hub.name}`}</h2>
            <p className="section-subtitle">برای اطلاعات کامل سرویس و محصولات سازگار، دفترچه نسخه دقیق خودرو را باز کنید.</p>
          </div>
          <div className="overflow-x-auto border-y border-border">
            <table className="w-full min-w-[820px] border-collapse text-right text-sm">
              <thead className="bg-surface-muted text-xs text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-extrabold">نسخه</th>
                  <th className="px-4 py-3 font-extrabold">سال</th>
                  <th className="px-4 py-3 font-extrabold">موتور</th>
                  <th className="px-4 py-3 font-extrabold">قدرت / گشتاور</th>
                  <th className="px-4 py-3 font-extrabold">گیربکس</th>
                  <th className="px-4 py-3 font-extrabold">روغن موتور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hub.variants.map((variant) => (
                  <tr key={variant.href}>
                    <th className="px-4 py-4 align-top font-extrabold text-text-strong">
                      <Link className="text-link-zen" href={variant.href}>{variant.title}</Link>
                    </th>
                    <td className="px-4 py-4 align-top leading-7 text-text-muted">{variant.years}</td>
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

        <section aria-labelledby={`${hub.slug}-specs-title`} className="space-y-5">
          <div>
            <h2 className="section-title" id={`${hub.slug}-specs-title`}>جدول مشخصات فنی {hub.name}</h2>
            <p className="section-subtitle">مشخصات سرویس بر اساس نسخه‌های ثبت‌شده در دفترچه خودروهای اویل‌بار تنظیم شده است.</p>
          </div>
          <dl className="grid border-y border-border md:grid-cols-2 md:gap-x-8">
            {hub.specifications.map(([label, value]) => (
              <div className="grid grid-cols-[minmax(120px,0.75fr)_minmax(0,1.25fr)] gap-3 border-b border-border py-3 last:border-b-0 md:last:border-b" key={label}>
                <dt className="text-sm font-bold text-text-muted">{label}</dt>
                <dd className="text-sm font-extrabold leading-7 text-text-strong">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby={`${hub.slug}-ownership-title`} className="space-y-5 border-y border-border py-6">
          <div>
            <h2 className="section-title" id={`${hub.slug}-ownership-title`}>نکات مهم برای مالک {hub.name}</h2>
            <p className="section-subtitle">مواردی که پیش از خرید روغن یا شروع سرویس باید مشخص باشند.</p>
          </div>
          <div className="grid gap-x-8 md:grid-cols-3">
            {hub.ownershipNotes.map((item) => (
              <div className="border-b border-border py-4 md:border-b-0 md:border-l md:px-5 md:first:pr-0 md:last:border-l-0" key={item.title}>
                <h3 className="text-sm font-extrabold text-text-strong">{item.title}</h3>
                <p className="mt-2 text-sm leading-8 text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby={`${hub.slug}-service-title`} className="space-y-5">
          <div>
            <h2 className="section-title" id={`${hub.slug}-service-title`}>روغن و سرویس {hub.name}</h2>
            <p className="section-subtitle max-w-4xl">{hub.serviceIntro}</p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {hub.variants.map((variant) => (
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

        <section aria-labelledby={`${hub.slug}-faq-title`} className="border-t border-border pt-6">
          <h2 className="section-title" id={`${hub.slug}-faq-title`}>سوالات پرتکرار درباره {hub.name}</h2>
          <div className="mt-5 divide-y divide-border border-y border-border">
            {hub.faqs.map((item) => (
              <details className="py-4" key={item.question}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-extrabold text-text-strong">{item.question}</summary>
                <p className="mt-3 max-w-4xl text-sm leading-8 text-text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby={`${hub.slug}-related-title`} className="border-t border-border pt-6">
          <h2 className="section-title" id={`${hub.slug}-related-title`}>راهنمای مدل‌های دیگر MG</h2>
          <nav aria-label="راهنمای مدل‌های دیگر ام جی" className="mt-4 flex flex-wrap gap-2">
            {otherModels.filter((model) => model.href !== pagePath).map((model) => (
              <Link className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-xs font-extrabold text-text transition hover:border-primary-accent-strong hover:text-primary-accent-strong" href={model.href} key={model.href}>
                مشخصات {model.label}
              </Link>
            ))}
          </nav>
        </section>

        <footer className="border-t border-border pt-5 text-xs leading-7 text-text-subtle">
          <p>{hub.sourceNote} اعداد ممکن است با توجه به بازار، تیپ و سری تولید تفاوت داشته باشند؛ دفترچه همان خودرو مرجع نهایی سرویس است.</p>
          <p className="mt-1">آخرین بازبینی: مهر ۱۴۰۵</p>
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
