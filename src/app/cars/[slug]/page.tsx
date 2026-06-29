import Link from "next/link";
import { notFound } from "next/navigation";
import { MaintenanceTimeline } from "@/components/catalog/maintenance-timeline";
import { QuestionForm } from "@/components/forms/question-form";
import { QuestionList } from "@/components/questions/question-list";
import { EngagementTracker } from "@/components/analytics/engagement-tracker";
import { ProductCard } from "@/components/product/product-card";
import { getCarBySlug, getRelatedBlogPostsForCar, getSiblingCars } from "@/lib/data";

type CarPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: CarPageProps) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);

  if (!car) return { title: "خودرو یافت نشد" };

  return {
    title: `${car.manufacturer} ${car.model} | دفترچه راهنمای خودرو در Oilbar`,
    description: `روغن مناسب، حجم روغن، فیلترهای سازگار و نکات نگهداری ${car.manufacturer} ${car.model} در Oilbar.`,
  };
}

export default async function CarDetailPage({ params }: CarPageProps) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) notFound();

  const recommendedProducts = car.productMappings.map((mapping) => mapping.product);
  const siblings = await getSiblingCars(car.manufacturer, car.slug, 4);
  const relatedPosts = await getRelatedBlogPostsForCar(car.manufacturer, car.model, 3);
  const title = `${car.manufacturer} ${car.model}${car.generation ? ` ${car.generation}` : ""}`;
  const years = car.yearFrom || car.yearTo ? `${car.yearFrom ?? "نامشخص"} تا ${car.yearTo ?? "نامشخص"}` : "نامشخص";
  const oilCapacity = car.oilCapacityLit ? `${car.oilCapacityLit.toString()} لیتر` : "نامشخص";
  const productLookup = new Map(car.productMappings.map(({ product }) => [product.slug, product] as const));
  const dateFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" });

  const maintenanceTasks = (car.maintenanceTasks ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    intervalKm: task.intervalKm ?? null,
    intervalMonths: task.intervalMonths ?? null,
    priority: task.priority,
    recommendedProducts: (task.recommendedProductSlugs ?? []).map((productSlug) => {
      const product = productLookup.get(productSlug);
      return {
        slug: productSlug,
        name: product?.name ?? productSlug,
        brandName: product?.brand.name,
        price: product ? Number(product.price) : undefined,
      };
    }),
  }));

  const questionItems = (car.questions ?? []).map((question) => ({
    id: question.id,
    authorName: question.authorName,
    question: question.question,
    answer: question.answer,
    status: question.status,
    createdAt: question.createdAt,
    answeredAt: question.answeredAt,
  }));

  const specs = [
    ["برند خودرو", car.manufacturer],
    ["مدل", car.model],
    ["سال ساخت", years],
    ["نوع موتور", car.engineType ?? "نامشخص"],
    ["کد موتور", car.engineCode ?? "نامشخص"],
    ["حجم روغن موتور", oilCapacity],
    ["ویسکوزیته پیشنهادی", car.viscosity ?? "ثبت نشده"],
    ["استاندارد API/ACEA", car.specification ?? "ثبت نشده"],
  ];

  const faqs = [
    ["چه روغنی برای این خودرو مناسب است؟", car.viscosity ? `روغن با ویسکوزیته ${car.viscosity} و استاندارد ${car.specification ?? "مطابق دفترچه خودرو"} پیشنهاد می‌شود.` : "برای این خودرو هنوز ویسکوزیته پیشنهادی ثبت نشده است."],
    ["حجم روغن موتور چقدر است؟", `حجم روغن موتور برای این مدل ${oilCapacity} ثبت شده است.`],
    ["هر چند کیلومتر روغن باید تعویض شود؟", "برای رانندگی شهری معمولاً هر ۸ تا ۱۰ هزار کیلومتر یا سالی یک‌بار بررسی و تعویض روغن پیشنهاد می‌شود."],
  ];

  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <EngagementTracker entityType="car" entityId={car.id} eventType="notebook_view" metadata={{ slug: car.slug }} />

      <nav className="text-xs font-medium text-[#6B7280]">
        <Link href="/" className="hover:text-[#D97706]">خانه</Link>
        <span className="mx-2">/</span>
        <Link href="/cars" className="hover:text-[#D97706]">دفترچه خودروها</Link>
        <span className="mx-2">/</span>
        {title}
      </nav>

      <section className="grid gap-6 rounded-3xl bg-[#111827] p-5 text-white md:p-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-bold text-white/70">دفترچه راهنمای خودرو</p>
          <h1 className="mt-3 text-2xl font-extrabold leading-[1.7] md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/75">
            اطلاعات فنی، روغن موتور مناسب، حجم روغن، فیلترهای سازگار، برنامه نگهداری و محصولات پیشنهادی این خودرو را یک‌جا ببینید.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/products?car=${car.slug}`} className="btn-primary">مشاهده محصولات سازگار</Link>
            <Link href="/support" className="btn-outline !border-white/20 !bg-white/10 !text-white">مشاوره تخصصی</Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white/10">
          {car.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={car.imageUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl font-black">{car.manufacturer.slice(0, 1)}</div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="section-title">اطلاعات فنی این خودرو</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB]">
            {specs.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[160px_1fr] border-b border-[#E5E7EB] last:border-b-0">
                <div className="bg-[#F7F7F8] px-4 py-3 text-sm font-bold text-[#6B7280]">{label}</div>
                <div className="px-4 py-3 text-sm font-bold text-[#111827]">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard title="روغن موتور مناسب این خودرو" value={car.viscosity ?? "ثبت نشده"} helper={car.specification ?? "استاندارد API/ACEA ثبت نشده است."} />
            <InfoCard title="حجم روغن موتور" value={oilCapacity} helper="همراه با فیلتر روغن بررسی شود." />
            <InfoCard title="فیلترهای سازگار" value={`${recommendedProducts.length.toLocaleString("fa-IR")} محصول`} helper="از محصولات پایین صفحه انتخاب کنید." />
            <InfoCard title="برنامه نگهداری پیشنهادی" value={`${maintenanceTasks.length.toLocaleString("fa-IR")} مورد`} helper="بر اساس کیلومتر یا زمان سرویس." />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-[#FDE7B0] bg-[#FFF8E8] p-5">
            <h2 className="text-lg font-extrabold text-[#111827]">روغن مناسب، خرید مطمئن</h2>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">Oilbar محصولات سازگار با این خودرو را بر اساس داده‌های فنی و نگهداری نمایش می‌دهد.</p>
            <Link href={`/products?car=${car.slug}`} className="btn-primary mt-4 w-full">خرید محصولات مناسب این خودرو</Link>
          </div>
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-sm font-extrabold text-[#111827]">نکات نگهداری</h3>
            <p className="mt-3 text-sm leading-7 text-[#6B7280]">
              {car.maintenanceInfo ?? "روغن موتور و فیلتر روغن را بر اساس شرایط رانندگی و دفترچه خودرو در بازه مناسب تعویض کنید."}
            </p>
          </div>
        </aside>
      </section>

      <MaintenanceTimeline carName={title} tasks={maintenanceTasks} />

      {recommendedProducts.length > 0 && (
        <section className="space-y-5">
          <div className="section-heading">
            <div>
              <h2 className="section-title">محصولات مناسب این خودرو</h2>
              <p className="section-subtitle">روغن‌ها و فیلترهای متصل‌شده به دفترچه فنی {title}</p>
            </div>
            <Link href={`/products?car=${car.slug}`} className="text-sm font-bold text-[#D97706]">مشاهده همه</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {recommendedProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="section-title">سوالات پرتکرار</h2>
        <div className="mt-5 space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="rounded-2xl border border-[#E5E7EB] p-4">
              <summary className="cursor-pointer text-sm font-bold text-[#111827]">{question}</summary>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <QuestionForm type="car" slug={car.slug} title={`سوالات شما درباره ${title}`} />
        <QuestionList items={questionItems} emptyMessage="هنوز سوالی برای این خودرو ثبت نشده است." />
      </section>

      {relatedPosts.length > 0 && (
        <section className="space-y-5">
          <h2 className="section-title">مطالب مرتبط با نگهداری {title}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 transition hover:border-[#F5C56B]">
                <span className="text-xs text-[#6B7280]">{dateFormatter.format(post.publishedAt)}</span>
                <h3 className="mt-2 line-clamp-2 text-base font-bold leading-7 text-[#111827]">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#6B7280]">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="space-y-5">
          <h2 className="section-title">مدل‌های دیگر {car.manufacturer}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {siblings.map((sibling) => (
              <Link key={sibling.id} href={`/cars/${sibling.slug}`} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 transition hover:border-[#F5C56B]">
                <p className="font-bold text-[#111827]">{sibling.manufacturer} {sibling.model}</p>
                <p className="mt-2 text-xs text-[#6B7280]">{sibling.generation ?? "نسل ثبت نشده"} · {sibling.viscosity ?? "ویسکوزیته نامشخص"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
      <p className="text-xs font-bold text-[#6B7280]">{title}</p>
      <p className="mt-2 text-lg font-extrabold text-[#111827]">{value}</p>
      <p className="mt-1 text-xs leading-6 text-[#6B7280]">{helper}</p>
    </div>
  );
}
