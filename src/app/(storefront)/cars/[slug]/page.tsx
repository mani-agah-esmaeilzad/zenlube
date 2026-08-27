import Link from "next/link";
import { notFound } from "next/navigation";
import { CarNotebook } from "@/components/catalog/car-notebook";
import { QuestionForm } from "@/components/forms/question-form";
import { QuestionList } from "@/components/questions/question-list";
import { EngagementTracker } from "@/components/analytics/engagement-tracker";
import { ProductCard } from "@/components/product/product-card";
import {
  buildNotebookData,
  buildNotebookProductPanels,
} from "@/lib/car-notebook";
import { resolveCarOilCapacityLabel } from "@/lib/car-manual-overrides";
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
    description: `روغن مناسب، حجم روغن و فیلترهای سازگار ${car.manufacturer} ${car.model} در Oilbar.`,
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
  const oilCapacity = resolveCarOilCapacityLabel(car);
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

  const notebook = buildNotebookData({
    title,
    years,
    oilCapacity,
    car: {
      manufacturer: car.manufacturer,
      model: car.model,
      engineType: car.engineType,
      engineCode: car.engineCode,
      viscosity: car.viscosity,
      specification: car.specification,
      overviewDetails: car.overviewDetails,
      engineDetails: car.engineDetails,
      gearboxDetails: car.gearboxDetails,
      maintenanceInfo: car.maintenanceInfo,
      notebookSections: car.notebookSections,
    },
    maintenanceTasks,
    recommendedProductsCount: recommendedProducts.length,
  });
  const notebookProductPanels = buildNotebookProductPanels({
    carSlug: car.slug,
    carName: title,
    pages: notebook.pages,
    products: recommendedProducts,
  });
  const engineOilPage = notebook.pages.find((page) => page.id === "engine-oil");
  const gearboxOilPage = notebook.pages.find((page) => page.id === "gearbox-oil");
  const quickHighlights = [
    {
      title: "روغن موتور پیشنهادی",
      value: engineOilPage?.highlights?.find((item) => item.label === "ویسکوزیته")?.value ?? car.viscosity ?? "ثبت نشده",
      helper:
        engineOilPage?.highlights?.find((item) => item.label === "استاندارد")?.value ??
        car.specification ??
        "استاندارد API/ACEA هنوز ثبت نشده است.",
    },
    {
      title: "حجم روغن موتور",
      value: oilCapacity,
      helper: "مقدار سرویس را همراه با فیلتر روغن چک کنید.",
    },
    {
      title: "خلاصه گیربکس",
      value:
        gearboxOilPage?.highlights?.find((item) => item.label === "نوع گیربکس")?.value ??
        gearboxOilPage?.highlights?.find((item) => item.label === "بازه سرویس")?.value ??
        "در حال تکمیل",
      helper: "جزئیات کامل‌تر و محصولات سازگار را در تب روغن گیربکس ببینید.",
    },
    {
      title: "محصولات سازگار",
      value: `${recommendedProducts.length.toLocaleString("fa-IR")} مورد`,
      helper: "کالاهای متصل‌شده به این خودرو را از همین صفحه یا لیست محصولات ببینید.",
    },
  ];

  const faqs = [
    ["چه روغنی برای این خودرو مناسب است؟", car.viscosity ? `روغن با ویسکوزیته ${car.viscosity} و استاندارد ${car.specification ?? "مطابق دفترچه خودرو"} پیشنهاد می‌شود.` : "برای این خودرو هنوز ویسکوزیته پیشنهادی ثبت نشده است."],
    ["حجم روغن موتور چقدر است؟", `حجم روغن موتور برای این مدل ${oilCapacity} ثبت شده است.`],
    ["هر چند کیلومتر روغن باید تعویض شود؟", "برای رانندگی شهری معمولاً هر ۸ تا ۱۰ هزار کیلومتر یا سالی یک‌بار بررسی و تعویض روغن پیشنهاد می‌شود."],
  ];

  return (
    <div className="container-zen space-y-8 py-6 md:py-8">
      <EngagementTracker entityType="car" entityId={car.id} eventType="notebook_view" metadata={{ slug: car.slug }} />

      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-text-subtle">
        <Link href="/" className="text-link-zen">خانه</Link>
        <span>/</span>
        <Link href="/cars" className="text-link-zen">دفترچه خودروها</Link>
        <span>/</span>
        <span className="line-clamp-1 min-w-0">{title}</span>
      </nav>

      <section className="relative grid gap-5 overflow-hidden rounded-2xl bg-primary p-5 text-white sm:p-6 md:p-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <span className="chip-zen-dark inline-flex">دفترچه راهنمای خودرو</span>
          <h1 className="mt-3 text-[1.65rem] font-extrabold leading-[1.6] md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/75">
            اطلاعات فنی، روغن موتور مناسب، حجم روغن، فیلترهای سازگار و محصولات پیشنهادی این خودرو را یک‌جا ببینید.
          </p>
          <div className="mt-6 flex flex-col gap-3 min-[390px]:flex-row min-[390px]:flex-wrap">
            <Link href={`/products?car=${car.slug}`} className="btn-primary w-full min-[390px]:w-auto">مشاهده محصولات سازگار</Link>
            <Link href="/support" className="btn-outline w-full !border-white/20 !bg-white/10 !text-white min-[390px]:w-auto">مشاوره تخصصی</Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          {car.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={car.imageUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl font-black">{car.manufacturer.slice(0, 1)}</div>
          )}
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <span className="chip-zen-warning inline-flex">
                دفترچه هوشمند خودرو
              </span>
              <h2 className="mt-3 section-title">دفترچه تخصصی این خودرو</h2>
              <p className="section-subtitle">
                بخش بالایی ساده شد تا کاربر مستقیم وارد دفترچه شود. هر تب فقط اطلاعات همان سیستم خودرو را نشان می‌دهد و در
                موبایل هم راحت‌تر خوانده می‌شود.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {notebook.pages.map((page) => (
                <span
                  key={page.id}
                  className="chip-zen-muted"
                >
                  {page.title}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 min-[390px]:grid-cols-2 xl:grid-cols-4">
            {quickHighlights.map((item) => (
              <QuickHighlightCard key={item.title} title={item.title} value={item.value} helper={item.helper} />
            ))}
          </div>

          <div className="panel-zen-tint mt-5 flex flex-col gap-3 rounded-[24px] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-7 text-text-muted">
              برای انتخاب سریع، از تب‌های دفترچه شروع کنید؛ برای خرید مستقیم هم محصولات سازگار همین خودرو در دسترس است.
            </p>
            <Link href={`/products?car=${car.slug}`} className="btn-primary w-full sm:w-auto sm:shrink-0">
              مشاهده محصولات سازگار
            </Link>
          </div>
        </div>
        <CarNotebook pages={notebook.pages} productPanels={notebookProductPanels} />
      </section>

      {recommendedProducts.length > 0 && (
        <section className="space-y-5">
          <div className="section-heading">
            <div>
              <h2 className="section-title">محصولات مناسب این خودرو</h2>
              <p className="section-subtitle">روغن‌ها و فیلترهای متصل‌شده به دفترچه فنی {title}</p>
            </div>
            <Link href={`/products?car=${car.slug}`} className="text-link-zen text-sm font-bold">مشاهده همه</Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {recommendedProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      <section className="panel-zen rounded-[30px] p-5 sm:p-6">
        <h2 className="section-title">سوالات پرتکرار</h2>
        <div className="mt-5 space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="panel-zen-muted rounded-[24px] p-4">
              <summary className="cursor-pointer text-sm font-bold text-text-strong">{question}</summary>
              <p className="mt-3 text-sm leading-7 text-text-muted">{answer}</p>
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
              <Link key={post.id} href={`/blog/${post.slug}`} className="panel-zen interactive-lift rounded-[26px] p-5">
                <span className="text-xs text-text-subtle">{dateFormatter.format(post.publishedAt)}</span>
                <h3 className="mt-2 line-clamp-2 text-base font-bold leading-7 text-text-strong">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-text-muted">{post.excerpt}</p>
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
              <Link key={sibling.id} href={`/cars/${sibling.slug}`} className="panel-zen interactive-lift rounded-[26px] p-5">
                <p className="font-bold text-text-strong">{sibling.manufacturer} {sibling.model}</p>
                <p className="mt-2 text-xs leading-6 text-text-muted">{sibling.generation ?? "نسل ثبت نشده"} · {sibling.viscosity ?? "ویسکوزیته نامشخص"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function QuickHighlightCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="metric-zen rounded-[22px] p-4">
      <p className="text-[11px] font-bold text-text-subtle">{title}</p>
      <p className="mt-2 text-base font-extrabold leading-7 text-text-strong">{value}</p>
      <p className="mt-1 text-xs leading-6 text-text-muted">{helper}</p>
    </div>
  );
}
