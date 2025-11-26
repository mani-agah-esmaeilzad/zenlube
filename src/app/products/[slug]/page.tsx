import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { QuestionForm } from "@/components/forms/question-form";
import { QuestionList } from "@/components/questions/question-list";
import { EngagementTracker } from "@/components/analytics/engagement-tracker";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!product) {
    return {
      title: "محصول یافت نشد",
    };
  }

  return {
    title: `${product.name} | Oilbar`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      carMappings: {
        include: {
          car: true,
        },
      },
      questions: {
        where: {
          status: {
            not: "ARCHIVED",
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 3,
    include: {
      brand: true,
    },
  });

  const technicalSpecs = (product.technicalSpecs as Record<string, string | number> | null) ?? null;
  const technicalSpecEntries = technicalSpecs ? Object.entries(technicalSpecs) : [];
  const questionItems = (product.questions ?? []).map((question) => ({
    id: question.id,
    authorName: question.authorName,
    question: question.question,
    answer: question.answer,
    status: question.status,
    createdAt: question.createdAt,
    answeredAt: question.answeredAt,
  }));
  const isAvailable = product.stock > 0;
  const highlightBadges = [
    { label: "برند", value: product.brand.name, href: `/brands?slug=${product.brand.slug}` },
    { label: "دسته‌بندی", value: product.category.name, href: `/categories?slug=${product.category.slug}` },
    product.viscosity ? { label: "ویسکوزیته", value: product.viscosity } : null,
    product.oilType ? { label: "نوع روغن", value: product.oilType } : null,
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  const detailSpecs = [
    { label: "کد کالا", value: product.sku },
    { label: "کشور سازنده", value: product.originCountry },
    { label: "تاییدیه‌ها", value: product.approvals },
    { label: "بازه دمایی", value: product.temperatureRange },
    product.packagingSizeLit ? { label: "حجم بسته‌بندی", value: `${Number(product.packagingSizeLit).toFixed(1)} لیتر` } : null,
    { label: "گارانتی", value: product.warranty },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec?.value));

  return (
    <div className="space-y-12 bg-slate-50 pb-16">
      <section className="layout-shell space-y-10 pt-10">
        <EngagementTracker entityType="product" entityId={product.id} eventType="product_view" metadata={{ slug: product.slug }} />

        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">تصویر در دسترس نیست</div>
              )}
              <div className="absolute left-6 right-6 top-6 flex flex-wrap gap-2 text-xs text-white">
                {product.isBestseller ? <span className="rounded-full bg-sky-500/90 px-3 py-1 font-semibold">پرفروش</span> : null}
                {product.viscosity ? <span className="rounded-full bg-black/60 px-3 py-1">ویسکوزیته {product.viscosity}</span> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {highlightBadges.map((badge) =>
                badge.href ? (
                  <Link key={badge.label} href={badge.href} className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-sky-200 hover:text-sky-800">
                    {badge.label}: {badge.value}
                  </Link>
                ) : (
                  <span key={badge.label} className="rounded-full border border-slate-200 px-3 py-1">
                    {badge.label}: {badge.value}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-slate-900">{product.name}</h1>
              {product.description ? <p className="text-sm leading-7 text-slate-600">{product.description}</p> : null}
            </div>
            <div className="mt-6 grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs text-slate-400">قیمت آنلاین</span>
                  <span className="text-3xl font-bold text-slate-900">{formatPrice(product.price)}</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                  {isAvailable ? `موجود (${product.stock} عدد)` : "ناموجود"}
                </span>
              </div>
              <div className="grid gap-3 text-xs sm:grid-cols-2">
                {detailSpecs.map((spec) => (
                  <div key={spec.label} className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2">
                    <p className="text-[10px] text-slate-400">{spec.label}</p>
                    <p className="mt-1 text-slate-700">{spec.value}</p>
                  </div>
                ))}
              </div>
              <AddToCartButton productId={product.id} className="w-full" disabled={!isAvailable} />
              <Link href="/products/compare" className="text-center text-xs font-semibold text-sky-600 transition hover:text-sky-800">
                مقایسه این محصول با سایر روغن‌ها →
              </Link>
            </div>
            <ul className="mt-6 space-y-3 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">✓</span>
                ارسال سریع تهران و کرج در کمتر از ۲۴ ساعت
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">✓</span>
                تضمین اصالت کالا و تاریخ تولید جدید
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">✓</span>
                امکان نصب و تعویض در محل با هماهنگی قبلی
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <div className="wp-section space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">معرفی محصول</h2>
              {product.description ? <p className="text-sm leading-7 text-slate-600">{product.description}</p> : <p className="text-sm text-slate-500">توضیحاتی برای این محصول ثبت نشده است.</p>}
              {technicalSpecEntries.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {technicalSpecEntries.map(([key, value]) => (
                    <div key={key} className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600">
                      <p className="text-xs font-semibold text-slate-400">{key}</p>
                      <p className="mt-1 text-slate-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            {product.carMappings.length > 0 ? (
              <div className="wp-section space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">خودروهای سازگار</h3>
                <ul className="grid gap-3 text-sm text-slate-600">
                  {product.carMappings.map(({ car }) => (
                    <li key={car.id} className="rounded-2xl border border-slate-100 bg-white/80 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link href={`/cars#${car.slug}`} className="font-semibold text-slate-800 transition hover:text-sky-700">
                          {car.manufacturer} {car.model}
                        </Link>
                        {car.viscosity ? <span className="text-xs text-slate-500">ویسکوزیته پیشنهادی: {car.viscosity}</span> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="layout-shell space-y-4">
          <div className="section-heading">
            <h2>محصولات مشابه</h2>
            <p>انتخاب‌های هم‌دسته برای مقایسه سریع.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-500">{item.brand.name}</span>
                  <span className="text-base font-semibold text-slate-900">{item.name}</span>
                  <span className="text-xs text-slate-500">{formatPrice(item.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="layout-shell grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="wp-section">
          <QuestionForm type="product" slug={product.slug} title={`پرسش درباره ${product.brand.name} ${product.name}`} />
        </div>
        <div className="wp-section">
          <QuestionList items={questionItems} emptyMessage="هنوز پرسشی برای این محصول ثبت نشده است. تجربه خود را در قالب پرسش مطرح کنید." />
        </div>
      </section>
    </div>
  );
}
