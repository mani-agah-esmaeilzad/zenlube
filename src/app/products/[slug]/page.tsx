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
export async function generateMetadata({ params }: ProductPageProps) { const { slug } = await params; const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } }); return product ? { title: `${product.name} | ZenLube`, description: product.description ?? undefined } : { title: "محصول یافت نشد" }; }

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { brand: true, category: true, carMappings: { include: { car: true } }, questions: { where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" } } } });
  if (!product) notFound();
  const relatedProducts = await prisma.product.findMany({ where: { categoryId: product.categoryId, id: { not: product.id } }, take: 4, include: { brand: true, category: true, carMappings: { include: { car: true } } } });
  const specs = [["ویسکوزیته", product.viscosity], ["حجم", product.packagingSizeLit ? `${Number(product.packagingSizeLit).toLocaleString("fa-IR")} لیتر` : null], ["نوع روغن", product.oilType], ["سطح کیفیت API", product.approvals], ["کشور سازنده", product.originCountry], ["کد کالا", product.sku]].filter(([, v]) => Boolean(v));
  const questionItems = (product.questions ?? []).map((q) => ({ id: q.id, authorName: q.authorName, question: q.question, answer: q.answer, status: q.status, createdAt: q.createdAt, answeredAt: q.answeredAt }));
  return (
    <div className="container-zen py-8">
      <EngagementTracker entityType="product" entityId={product.id} eventType="product_view" metadata={{ slug: product.slug }} />
      <nav className="mb-5 text-xs text-slate-500"><Link href="/">خانه</Link> / <Link href="/products">فروشگاه</Link> / {product.name}</nav>
      <section className="grid gap-6 lg:grid-cols-[.9fr_1.3fr_.8fr]">
        <div className="card-zen p-4"><div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">{product.imageUrl ? <Image src={product.imageUrl} alt={`تصویر ${product.name}`} fill className="object-cover" sizes="(max-width:768px) 100vw, 34vw" /> : <div className="flex h-full items-center justify-center text-slate-400">تصویر در دسترس نیست</div>}</div><div className="mt-3 grid grid-cols-4 gap-2">{[1,2,3,4].map((i)=><div key={i} className="aspect-square rounded-xl border border-slate-200 bg-slate-50" />)}</div></div>
        <div className="card-zen p-6"><div className="flex flex-wrap gap-2 text-xs"><Link href={`/products?brand=${product.brand.slug}`} className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{product.brand.name}</Link><Link href={`/products?category=${product.category.slug}`} className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600">{product.category.name}</Link><span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">اصل</span><span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700">ارسال سریع</span></div><h1 className="mt-4 text-2xl font-black leading-10 text-[#0f2747] md:text-3xl">{product.name}</h1><p className="mt-3 text-sm text-slate-500">کد کالا: {product.sku ?? product.id.slice(0, 8)} • امتیاز {product.averageRating ? Number(product.averageRating).toFixed(1) : "جدید"}</p>{product.description && <p className="mt-5 text-sm leading-8 text-slate-700">{product.description}</p>}<div className="mt-6 grid gap-3 sm:grid-cols-2">{specs.map(([k, v]) => <div key={k} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs text-slate-500">{k}</span><p className="mt-1 font-bold text-slate-900">{v}</p></div>)}</div></div>
        <aside className="card-zen h-fit p-5 lg:sticky lg:top-44"><p className="text-sm font-bold text-slate-500">قیمت فروش</p><p className="mt-2 text-3xl font-black text-[#0f2747]">{formatPrice(product.price)}</p><p className={`mt-3 text-sm font-bold ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>{product.stock > 0 ? `${product.stock.toLocaleString("fa-IR")} عدد موجود` : "ناموجود"}</p><div className="my-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600"><p>✓ ضمانت اصالت و سلامت فیزیکی</p><p>✓ مشاوره تخصصی قبل از خرید</p><p>✓ ارسال سریع با بسته‌بندی امن</p></div><AddToCartButton productId={product.id} /><Link href="/products/compare" className="btn-outline mt-3 w-full">افزودن به مقایسه</Link></aside>
      </section>
      {product.carMappings.length > 0 && <section className="card-zen mt-6 p-6"><h2 className="text-xl font-black text-[#0f2747]">این روغن برای چه خودروهایی مناسب است؟</h2><div className="mt-4 flex flex-wrap gap-2">{product.carMappings.map(({ car }) => <Link key={car.id} href={`/cars/${car.slug}`} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700">{car.manufacturer} {car.model}</Link>)}</div></section>}
      <section className="card-zen mt-6 p-6"><div className="mb-5 flex gap-2 overflow-x-auto text-sm font-bold"><span className="rounded-full bg-[#0f2747] px-4 py-2 text-white">توضیحات محصول</span><span className="rounded-full bg-slate-100 px-4 py-2">مشخصات فنی</span><span className="rounded-full bg-slate-100 px-4 py-2">نظرات کاربران</span><span className="rounded-full bg-slate-100 px-4 py-2">پرسش و پاسخ</span><span className="rounded-full bg-slate-100 px-4 py-2">راهنمای انتخاب روغن</span></div><p className="text-sm leading-8 text-slate-700">این محصول با تمرکز بر سازگاری فنی، اصالت کالا و تجربه خرید مطمئن ارائه می‌شود. برای انتخاب دقیق‌تر به ویسکوزیته، استاندارد API و دفترچه راهنمای خودرو توجه کنید.</p></section>
      {relatedProducts.length > 0 && <section className="mt-8 space-y-4"><h2 className="text-2xl font-black text-[#0f2747]">محصولات مرتبط</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
      <section className="mt-8 grid gap-6 lg:grid-cols-2"><QuestionForm type="product" slug={product.slug} title={`پرسش درباره ${product.brand.name} ${product.name}`} /><QuestionList items={questionItems} emptyMessage="هنوز پرسشی برای این محصول ثبت نشده است." /></section>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-2xl lg:hidden"><AddToCartButton productId={product.id} /></div>
    </div>
  );
}
