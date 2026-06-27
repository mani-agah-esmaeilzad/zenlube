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
import { getOrdersTabData } from "@/services/admin/orders";
import { BrandsTab } from "@/components/admin/tabs/BrandsTab";
import { CarsTab } from "@/components/admin/tabs/CarsTab";
import { CategoriesTab } from "@/components/admin/tabs/CategoriesTab";
import { MaintenanceTab } from "@/components/admin/tabs/MaintenanceTab";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { ProductsTab } from "@/components/admin/tabs/ProductsTab";
import { OrdersTab } from "@/components/admin/tabs/OrdersTab";
import type { OrdersTabData } from "@/services/admin/types";
import { QuestionsTab } from "@/components/admin/tabs/QuestionsTab";
import { ReportsTab } from "@/components/admin/tabs/ReportsTab";
import { UsersTab } from "@/components/admin/tabs/UsersTab";

export const revalidate = 0;

const tabs = [
  { id: "overview", label: "نمای کلی" },
  { id: "products", label: "محصولات" },
  { id: "orders", label: "سفارش‌ها" },
  { id: "cars", label: "خودروها" },
  { id: "maintenance", label: "نگهداری" },
  { id: "questions", label: "پرسش‌ها" },
  { id: "brands", label: "برندها" },
  { id: "categories", label: "دسته‌بندی‌ها" },
  { id: "users", label: "کاربران" },
  { id: "reports", label: "گزارش‌ها" },
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

  const content = await renderActiveTab(activeTab, userId, params);

  return (
    <div className="container-zen space-y-6 py-6 md:py-8">
      <header className="rounded-3xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-red-600">پنل مدیریت</p>
            <h1 className="mt-2 text-2xl font-extrabold text-[#111827] md:text-3xl">پیشخوان مدیریتی ZenLube</h1>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">
              محصولات، سفارش‌ها، برندها، خودروها و فعالیت کاربران را از یک فضای منظم مدیریت کنید.
            </p>
          </div>
          <Link href="/" className="btn-outline">مشاهده فروشگاه</Link>
        </div>
        <nav className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] p-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={tab.id === "overview" ? "/admin" : `/admin?tab=${tab.id}`}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-bold transition",
                  isActive
                    ? "bg-[#111827] text-white"
                    : "text-[#6B7280] hover:bg-white hover:text-[#111827]",
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
