import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import { QuestionForm } from "@/components/forms/question-form";
import { QuestionList } from "@/components/questions/question-list";
import { EngagementTracker } from "@/components/analytics/engagement-tracker";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } });
  return product ? { title: `${product.name} | Oilbar`, description: product.description ?? undefined } : { title: "محصول یافت نشد" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      carMappings: { include: { car: true } },
      questions: { where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: { brand: true, category: true, carMappings: { include: { car: true } } },
  });

  const specs = [
    ["ویسکوزیته", product.viscosity],
    ["حجم", product.packagingSizeLit ? `${Number(product.packagingSizeLit).toLocaleString("fa-IR")} لیتر` : null],
    ["نوع روغن", product.oilType],
    ["استاندارد API / تاییدیه‌ها", product.approvals],
    ["کشور سازنده", product.originCountry],
    ["کد کالا", product.sku],
  ].filter(([, value]) => Boolean(value));
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

  return (
    <div className="container-zen py-6 md:py-8">
      <EngagementTracker entityType="product" entityId={product.id} eventType="product_view" metadata={{ slug: product.slug }} />

      <nav className="mb-4 text-xs font-medium text-[#6B7280]">
        <Link href="/" className="hover:text-red-600">خانه</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-red-600">فروشگاه</Link>
        <span className="mx-2">/</span>
        {product.name}
      </nav>

      <section className="grid gap-6 lg:grid-cols-[.95fr_1.35fr_.85fr]">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F7F7F8]">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={`تصویر ${product.name}`} fill className="object-contain p-6" sizes="(max-width:768px) 100vw, 34vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-[#9CA3AF]">تصویر در دسترس نیست</div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-square rounded-xl border border-[#E5E7EB] bg-[#F7F7F8]" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 md:p-6">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <Link href={`/products?brand=${product.brand.slug}`} className="rounded-full bg-red-50 px-3 py-1.5 text-red-600">{product.brand.name}</Link>
            <Link href={`/products?category=${product.category.slug}`} className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[#374151]">{product.category.name}</Link>
            <span className="rounded-full bg-green-50 px-3 py-1.5 text-[#16A34A]">ضمانت اصالت</span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold leading-[1.8] text-[#111827] md:text-3xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
            <span>کد کالا: {product.sku ?? product.id.slice(0, 8)}</span>
            <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
            <span>امتیاز: {product.averageRating ? Number(product.averageRating).toLocaleString("fa-IR") : "جدید"}</span>
            <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
            <span>{product.reviewCount.toLocaleString("fa-IR")} نظر</span>
          </div>
          {product.description && <p className="mt-5 text-sm leading-8 text-[#374151]">{product.description}</p>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {specs.map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
                <span className="text-xs font-medium text-[#6B7280]">{key}</span>
                <p className="mt-1 text-sm font-bold text-[#111827]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_28px_rgba(17,24,39,0.06)] lg:sticky lg:top-40">
          <p className="text-sm font-bold text-[#6B7280]">قیمت فروش</p>
          <p className="mt-2 text-3xl font-extrabold text-[#111827]">{formatPrice(product.price)}</p>
          <p className={`mt-3 text-sm font-bold ${isAvailable ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {isAvailable ? `${product.stock.toLocaleString("fa-IR")} عدد موجود` : "ناموجود"}
          </p>
          <div className="my-5 space-y-2 rounded-2xl bg-[#F7F7F8] p-4 text-xs leading-6 text-[#374151]">
            <p>ضمانت اصالت و سلامت فیزیکی کالا</p>
            <p>مشاوره تخصصی قبل از خرید</p>
            <p>ارسال سریع با بسته‌بندی امن</p>
          </div>
          <AddToCartButton productId={product.id} disabled={!isAvailable} />
          <Link href="/products/compare" className="btn-outline mt-3 w-full">افزودن به مقایسه</Link>
        </aside>
      </section>

      {product.carMappings.length > 0 && (
        <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="section-title">مناسب برای چه خودروهایی است؟</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.carMappings.map(({ car }) => (
              <Link key={car.id} href={`/cars/${car.slug}`} className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-bold text-[#374151] hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                {car.manufacturer} {car.model}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto text-sm font-bold">
          {["توضیحات محصول", "مشخصات فنی", "نظرات کاربران", "پرسش و پاسخ", "راهنمای انتخاب روغن"].map((tab, index) => (
            <span key={tab} className={`shrink-0 rounded-xl px-4 py-2 ${index === 0 ? "bg-[#111827] text-white" : "bg-[#F3F4F6] text-[#374151]"}`}>
              {tab}
            </span>
          ))}
        </div>
        <p className="text-sm leading-8 text-[#374151]">
          این محصول با تمرکز بر سازگاری فنی، اصالت کالا و تجربه خرید مطمئن ارائه می‌شود. برای انتخاب دقیق‌تر به ویسکوزیته، استاندارد API و دفترچه راهنمای خودرو توجه کنید.
        </p>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-8 space-y-4">
          <div className="section-heading">
            <h2 className="section-title">محصولات مرتبط</h2>
            <Link href="/products" className="text-sm font-bold text-red-600">مشاهده همه</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <QuestionForm type="product" slug={product.slug} title={`پرسش درباره ${product.brand.name} ${product.name}`} />
        <QuestionList items={questionItems} emptyMessage="هنوز پرسشی برای این محصول ثبت نشده است." />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E7EB] bg-white p-3 shadow-2xl lg:hidden">
        <AddToCartButton productId={product.id} disabled={!isAvailable} />
      </div>
    </div>
  );
}
