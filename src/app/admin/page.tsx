import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  getBrandsTabData,
  getCarsTabData,
  getCategoriesTabData,
  getMaintenanceTabData,
  getOverviewTabData,
  getProductsTabData,
  getQuestionsTabData,
  getReportsTabData,
  getUsersTabData,
} from "@/services/admin/overview";
import { BrandsTab } from "@/components/admin/tabs/BrandsTab";
import { CarsTab } from "@/components/admin/tabs/CarsTab";
import { CategoriesTab } from "@/components/admin/tabs/CategoriesTab";
import { MaintenanceTab } from "@/components/admin/tabs/MaintenanceTab";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { ProductsTab } from "@/components/admin/tabs/ProductsTab";
import { QuestionsTab } from "@/components/admin/tabs/QuestionsTab";
import { ReportsTab } from "@/components/admin/tabs/ReportsTab";
import { UsersTab } from "@/components/admin/tabs/UsersTab";

export const revalidate = 0;

const tabs = [
  { id: "overview", label: "نمای کلی" },
  { id: "products", label: "محصولات" },
  { id: "cars", label: "خودروها" },
  { id: "maintenance", label: "نگهداری" },
  { id: "questions", label: "پرسش‌ها" },
  { id: "brands", label: "برندها" },
  { id: "categories", label: "دسته‌بندی‌ها" },
  { id: "users", label: "کاربران" },
  { id: "reports", label: "گزارش‌ها" },
] as const;

type TabKey = (typeof tabs)[number]["id"];

type AdminPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { userId } = await requireAdminUser();

  const requestedTabParam = searchParams?.tab;
  const requestedTab = Array.isArray(requestedTabParam) ? requestedTabParam[0] : requestedTabParam;
  const activeTab: TabKey = tabs.some((tab) => tab.id === requestedTab)
    ? (requestedTab as TabKey)
    : "overview";

  const content = await renderActiveTab(activeTab, userId, searchParams);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">پیشخوان مدیریتی زن‌لوب</h1>
          <p className="text-sm text-slate-500">
            در این بخش می‌توانید محصولات، برندها، خودروها و فعالیت‌های کاربران را مدیریت کنید.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-500/10">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={tab.id === "overview" ? "/admin" : `/admin?tab=${tab.id}`}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  isActive
                    ? "bg-sky-500 text-slate-900"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <section>{content}</section>
    </div>
  );
}

async function renderActiveTab(
  activeTab: TabKey,
  sessionUserId: string | null,
  searchParams: AdminPageProps["searchParams"],
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
