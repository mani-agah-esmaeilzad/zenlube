import Link from "next/link";
import { notFound } from "next/navigation";
import type { SVGProps } from "react";

import { requireAdminUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  getBrandsTabData,
  getCarsTabData,
  getCategoriesTabData,
  getContentTabData,
  getMaintenanceTabData,
  getOverviewTabData,
  getProductsTabData,
  getQuestionsTabData,
  getReportsTabData,
  getUsersTabData,
} from "@/services/admin/overview";
import { getOrdersTabData } from "@/services/admin/orders";
import { BrandsTab } from "@/components/admin/tabs/BrandsTab";
import { CarsTab } from "@/components/admin/tabs/CarsTab";
import { CategoriesTab } from "@/components/admin/tabs/CategoriesTab";
import { ContentTab } from "@/components/admin/tabs/ContentTab";
import { MaintenanceTab } from "@/components/admin/tabs/MaintenanceTab";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { OrdersTab } from "@/components/admin/tabs/OrdersTab";
import { ProductsTab } from "@/components/admin/tabs/ProductsTab";
import { QuestionsTab } from "@/components/admin/tabs/QuestionsTab";
import { ReportsTab } from "@/components/admin/tabs/ReportsTab";
import { UsersTab } from "@/components/admin/tabs/UsersTab";
import type { OrdersTabData } from "@/services/admin/types";

export const revalidate = 0;

const tabs = [
  {
    id: "overview",
    label: "نمای کلی",
    description: "شاخص‌های اصلی فروشگاه، سلامت عملیات، موجودی و سفارش‌ها را یکجا ببینید.",
    icon: HomeIcon,
  },
  {
    id: "products",
    label: "محصولات",
    description: "کاتالوگ، موجودی، قیمت‌گذاری و ارتباط محصولات با خودروها را مدیریت کنید.",
    icon: BoxIcon,
  },
  {
    id: "orders",
    label: "سفارش‌ها",
    description: "وضعیت سفارش، پرداخت، ارسال و پیامک مشتریان را از یک جریان کاری منظم کنترل کنید.",
    icon: CartIcon,
  },
  {
    id: "cars",
    label: "خودروها",
    description: "دفترچه‌های خودرو، اطلاعات فنی و پیشنهادهای سازگار را نگه دارید.",
    icon: CarIcon,
  },
  {
    id: "maintenance",
    label: "نگهداری",
    description: "برنامه‌های سرویس دوره‌ای و پیشنهادهای نگهداری را به‌روز کنید.",
    icon: WrenchIcon,
  },
  {
    id: "questions",
    label: "پرسش‌ها",
    description: "پرسش‌های محصولات و خودروها را سریع پاسخ دهید و صف پاسخ‌گویی را خلوت نگه دارید.",
    icon: MessageIcon,
  },
  {
    id: "content",
    label: "محتوا و تنظیمات",
    description: "محتوا، ساختار صفحات و تنظیمات نمایشی را مدیریت کنید.",
    icon: SlidersIcon,
  },
  {
    id: "brands",
    label: "برندها",
    description: "دارایی‌های برند و معرفی برندهای همکار فروشگاه را یکدست نگه دارید.",
    icon: TagIcon,
  },
  {
    id: "categories",
    label: "دسته‌بندی‌ها",
    description: "طبقه‌بندی محصولات را بازبینی کنید تا جستجو و نمایش فروشگاه دقیق‌تر بماند.",
    icon: GridIcon,
  },
  {
    id: "users",
    label: "کاربران",
    description: "نقش‌ها، رشد کاربران و مشتریان فعال را با کنترل بیشتر مدیریت کنید.",
    icon: UsersIcon,
  },
  {
    id: "reports",
    label: "گزارش‌ها",
    description: "رفتارهای تعاملی، مقایسه‌ها و بازدیدهای دفترچه‌ای را از زاویه تصمیم‌گیری بررسی کنید.",
    icon: ChartIcon,
  },
] as const;

type TabKey = (typeof tabs)[number]["id"];
type AdminSearchParams = Record<string, string | string[] | undefined>;

type AdminPageProps = {
  searchParams: Promise<AdminSearchParams>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { userId } = await requireAdminUser();
  const params = await searchParams;

  const requestedTabParam = params.tab;
  const requestedTab = Array.isArray(requestedTabParam) ? requestedTabParam[0] : requestedTabParam;
  const activeTab: TabKey = tabs.some((tab) => tab.id === requestedTab)
    ? (requestedTab as TabKey)
    : "overview";

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const ActiveTabIcon = activeTabMeta.icon;
  const todayLabel = new Intl.DateTimeFormat("fa-IR", { dateStyle: "full" }).format(new Date());
  const content = await renderActiveTab(activeTab, userId, params);

  return (
    <div className="admin-app-bg py-6 md:py-8">
      <div className="container-zen">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_292px]">
          <main className="order-2 min-w-0 space-y-6 xl:order-1">
            <header className="admin-panel p-5 md:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="admin-chip admin-chip-active">
                      <ActiveTabIcon className="h-4 w-4" />
                      {activeTabMeta.label}
                    </span>
                    <span className="admin-chip">{todayLabel}</span>
                    <span className="admin-chip">{tabs.length.toLocaleString("fa-IR")} بخش مدیریتی</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-[-0.03em] text-[#111827] md:text-[2rem]">
                      پیشخوان مدیریتی Oilbar
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-[#667085] md:text-[15px]">
                      {activeTabMeta.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                  <Link href="/" className="btn-secondary">
                    مشاهده فروشگاه
                  </Link>
                  <Link href={createHref(activeTab)} className="btn-outline">
                    تازه‌سازی این بخش
                  </Link>
                </div>
              </div>

              <nav className="scrollbar-none mt-6 flex gap-2 overflow-x-auto xl:hidden">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTab;
                  const TabIcon = tab.icon;
                  return (
                    <Link
                      key={tab.id}
                      href={createHref(tab.id)}
                      className={cn("admin-tab-chip shrink-0", isActive && "admin-tab-chip-active")}
                    >
                      <TabIcon className="h-4 w-4" />
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            </header>

            <div className="admin-workspace min-w-0">{content}</div>
          </main>

          <aside className="order-1 xl:order-2">
            <div className="admin-sidebar xl:sticky xl:top-6">
              <div className="border-b border-white/10 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.22em] text-white/45">OILBAR ADMIN</p>
                    <h2 className="mt-2 text-xl font-black text-white">داشبورد مدیریت</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <LogoDropIcon className="h-7 w-7 text-[#F59E0B]" />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-6 text-white/60">
                  عملیات فروشگاه، موجودی، سفارش‌ها و محتوای Oilbar از این فضای یکپارچه کنترل می‌شود.
                </p>
              </div>

              <nav className="hidden px-3 py-3 xl:block">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTab;
                  const TabIcon = tab.icon;
                  return (
                    <Link
                      key={tab.id}
                      href={createHref(tab.id)}
                      className={cn("admin-nav-link", isActive && "admin-nav-link-active")}
                    >
                      <span className="flex items-center gap-3">
                        <TabIcon className="h-4 w-4" />
                        {tab.label}
                      </span>
                      <ChevronLeftIcon className="h-4 w-4 opacity-60" />
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 px-5 py-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold text-white/60">بخش فعال</p>
                  <p className="mt-2 text-base font-black text-white">{activeTabMeta.label}</p>
                  <p className="mt-2 text-xs leading-6 text-white/55">{activeTabMeta.description}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

async function renderActiveTab(
  activeTab: TabKey,
  sessionUserId: string | null,
  searchParams: AdminSearchParams,
) {
  switch (activeTab) {
    case "overview": {
      const data = await getOverviewTabData();
      return <OverviewTab data={data} />;
    }
    case "products": {
      const data = await getProductsTabData({
        page: typeof searchParams?.page === "string" ? Number(searchParams.page) : undefined,
        perPage: typeof searchParams?.perPage === "string" ? Number(searchParams.perPage) : undefined,
        search: typeof searchParams?.search === "string" ? searchParams.search : null,
        brandId: typeof searchParams?.brandId === "string" ? searchParams.brandId : null,
        categoryId: typeof searchParams?.categoryId === "string" ? searchParams.categoryId : null,
        stockStatus: typeof searchParams?.stockStatus === "string" ? searchParams.stockStatus : null,
      });
      return <ProductsTab data={data} />;
    }
    case "orders": {
      const statusParam = typeof searchParams?.status === "string" ? searchParams.status : undefined;
      const normalizedStatus = statusParam &&
        ["all", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(statusParam)
        ? (statusParam as OrdersTabData["filters"]["status"])
        : undefined;
      const data = await getOrdersTabData({
        page: typeof searchParams?.page === "string" ? Number(searchParams.page) : undefined,
        perPage: typeof searchParams?.perPage === "string" ? Number(searchParams.perPage) : undefined,
        status: normalizedStatus,
        query: typeof searchParams?.query === "string" ? searchParams.query : null,
      });
      return <OrdersTab data={data} />;
    }
    case "cars": {
      const data = await getCarsTabData();
      return <CarsTab data={data} />;
    }
    case "maintenance": {
      const data = await getMaintenanceTabData();
      return <MaintenanceTab data={data} />;
    }
    case "questions": {
      const data = await getQuestionsTabData();
      return <QuestionsTab data={data} />;
    }
    case "content": {
      const data = await getContentTabData();
      return <ContentTab data={data} />;
    }
    case "brands": {
      const data = await getBrandsTabData();
      return <BrandsTab data={data} />;
    }
    case "categories": {
      const data = await getCategoriesTabData();
      return <CategoriesTab data={data} />;
    }
    case "users": {
      const data = await getUsersTabData();
      return <UsersTab data={data} sessionUserId={sessionUserId} />;
    }
    case "reports": {
      const data = await getReportsTabData();
      return <ReportsTab data={data} />;
    }
    default:
      notFound();
  }
}

function createHref(tabId: TabKey) {
  return tabId === "overview" ? "/admin" : `/admin?tab=${tabId}`;
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  );
}

function BoxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 12 4 7.5" />
      <path d="M12 12l8-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <circle cx={9} cy={20} r={1} />
      <circle cx={17} cy={20} r={1} />
      <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 8H7" />
    </svg>
  );
}

function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M5 16v2a1 1 0 0 0 1 1h1" />
      <path d="M17 19h1a1 1 0 0 0 1-1v-2" />
      <path d="M3 13.5 5.2 8a2 2 0 0 1 1.86-1.25h9.88A2 2 0 0 1 18.8 8l2.2 5.5" />
      <path d="M4 13h16a1 1 0 0 1 1 1v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5V14a1 1 0 0 1 1-1Z" />
      <circle cx={7.5} cy={15.5} r={1} />
      <circle cx={16.5} cy={15.5} r={1} />
    </svg>
  );
}

function WrenchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="m14.5 6.5 3 3" />
      <path d="m11 10 7.5-7.5a3.5 3.5 0 0 1 3 6L14 16l-3-3Z" />
      <path d="m5 9 10 10" />
      <path d="M4 20a2 2 0 1 1 2.83-2.83L9 19.34A2 2 0 0 1 6.17 22L4 20Z" />
    </svg>
  );
}

function MessageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M7 18 3 21V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

function SlidersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M4 6h6" />
      <path d="M14 6h6" />
      <path d="M4 18h10" />
      <path d="M18 18h2" />
      <path d="M10 3v6" />
      <path d="M16 15v6" />
      <path d="M4 12h2" />
      <path d="M10 12h10" />
      <path d="M8 9v6" />
    </svg>
  );
}

function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="m20 10-8.5 8.5a2 2 0 0 1-2.83 0L3 12.83V4h8.83L20 10Z" />
      <circle cx={8.5} cy={8.5} r={1} />
    </svg>
  );
}

function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <rect x={4} y={4} width={6} height={6} rx={1.2} />
      <rect x={14} y={4} width={6} height={6} rx={1.2} />
      <rect x={4} y={14} width={6} height={6} rx={1.2} />
      <rect x={14} y={14} width={6} height={6} rx={1.2} />
    </svg>
  );
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <circle cx={9} cy={8} r={3} />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx={17} cy={9} r={2.2} />
      <path d="M15.5 20a4.6 4.6 0 0 1 5.5-4.5" />
    </svg>
  );
}

function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="M4 19h16" />
      <path d="M7 16v-5" />
      <path d="M12 16V8" />
      <path d="M17 16v-9" />
    </svg>
  );
}

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" {...props}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

function LogoDropIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2c1.5 2.7 5.5 6.2 5.5 10.7A5.5 5.5 0 1 1 6.5 12.7C6.5 8.2 10.5 4.7 12 2Zm-.1 5.2c-.8 1.3-2.4 3-2.4 5.2a2.7 2.7 0 1 0 5.4 0c0-2.2-1.7-3.9-3-5.2Z" />
    </svg>
  );
}
