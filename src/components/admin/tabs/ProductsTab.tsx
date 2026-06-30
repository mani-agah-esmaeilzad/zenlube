import Link from "next/link";

import { deleteProductFormAction } from "@/actions/admin";
import { ProductCreateForm, ProductEditForm } from "@/components/admin/forms/ProductForm";
import { faNumberFormatter } from "@/lib/formatters";
import { formatPrice } from "@/lib/utils";
import type { ProductsTabData } from "@/services/admin/types";

export function ProductsTab({ data }: { data: ProductsTabData }) {
  const { categories, brands, cars, products, filters, pagination, lowStock } = data;

  const featuredCount = products.filter((product) => product.isFeatured).length;
  const outOfStockCount = products.filter((product) => product.stock <= 0).length;
  const mappedCarsCount = new Set(
    products.flatMap((product) => product.carMappings.map(({ car }) => car.id)),
  ).size;
  const visibleInventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

  const metrics = [
    {
      label: "کالاهای فیلترشده",
      value: faNumberFormatter.format(pagination.total),
      helper: `${faNumberFormatter.format(pagination.page)} از ${faNumberFormatter.format(pagination.totalPages)} صفحه`,
    },
    {
      label: "کم‌موجودی",
      value: faNumberFormatter.format(lowStock.count),
      helper: `${faNumberFormatter.format(outOfStockCount)} کالا ناموجود`,
    },
    {
      label: "محصولات ویژه",
      value: faNumberFormatter.format(featuredCount),
      helper: `${faNumberFormatter.format(mappedCarsCount)} خودروی مپ شده`,
    },
    {
      label: "ارزش موجودی این نما",
      value: formatPrice(visibleInventoryValue),
      helper: `${faNumberFormatter.format(products.length)} محصول در جدول`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="admin-kpi">
            <p className="admin-kpi-label">{metric.label}</p>
            <p className="admin-kpi-value">{metric.value}</p>
            <p className="admin-kpi-helper">{metric.helper}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          {lowStock.count ? (
            <section className="admin-panel p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-[#111827]">هشدار موجودی کم</h2>
                  <p className="mt-1 text-xs leading-6 text-[#667085]">
                    {faNumberFormatter.format(lowStock.count)} محصول کمتر از {lowStock.threshold.toLocaleString("fa-IR")} عدد موجودی دارند.
                  </p>
                </div>
                <Link href="/admin?tab=products&stockStatus=low" className="admin-chip">
                  فقط کم‌موجودی‌ها
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {lowStock.preview.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="rounded-full border border-[#F5C56B] bg-[#FFF7E8] px-3 py-1.5 text-xs font-bold text-[#D97706]"
                  >
                    {product.name} · {faNumberFormatter.format(product.stock)}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="admin-panel p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#111827]">مدیریت محصولات</h2>
                <p className="mt-1 text-sm leading-7 text-[#667085]">
                  جستجو، فیلتر، ویرایش سریع و بررسی ارتباط محصولات با خودروها از همین پنل انجام می‌شود.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-[#667085]">
                <span className="admin-chip">برندها: {faNumberFormatter.format(brands.length)}</span>
                <span className="admin-chip">دسته‌ها: {faNumberFormatter.format(categories.length)}</span>
                <span className="admin-chip">خودروها: {faNumberFormatter.format(cars.length)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
              <ProductsFilterForm
                categories={categories}
                brands={brands}
                filters={filters}
                pagination={pagination}
                lowStockThreshold={lowStock.threshold}
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-[#E6EAF2] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EAF2] px-5 py-4">
                <div>
                  <p className="text-sm font-black text-[#111827]">فهرست محصولات</p>
                  <p className="mt-1 text-xs text-[#667085]">
                    {faNumberFormatter.format(pagination.total)} نتیجه · صفحه {faNumberFormatter.format(pagination.page)} از{" "}
                    {faNumberFormatter.format(pagination.totalPages)}
                  </p>
                </div>
                <span className="admin-chip">نمای جدولی</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[980px] divide-y divide-[#E6EAF2] text-sm text-[#475467]">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-right">محصول</th>
                      <th className="px-4 py-3 text-right">برند</th>
                      <th className="px-4 py-3 text-right">دسته‌بندی</th>
                      <th className="px-4 py-3 text-right">قیمت</th>
                      <th className="px-4 py-3 text-right">موجودی</th>
                      <th className="px-4 py-3 text-right">خودروهای مرتبط</th>
                      <th className="px-4 py-3 text-right">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6EAF2]">
                    {products.length ? (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-4 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-sm font-black text-white">
                                {product.name.slice(0, 1)}
                              </div>
                              <div>
                                <p className="font-black text-[#111827]">{product.name}</p>
                                <p className="mt-1 text-[11px] text-[#98A2B3]">{product.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{product.brand.name}</td>
                          <td className="px-4 py-4">{product.category.name}</td>
                          <td className="px-4 py-4 font-bold text-[#111827]">{formatPrice(product.price)}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                product.stock <= 0
                                  ? "bg-[#FFF1F3] text-[#D92D20]"
                                  : product.stock < lowStock.threshold
                                  ? "bg-[#FFF7E8] text-[#D97706]"
                                  : "bg-[#ECFDF3] text-[#027A48]"
                              }`}
                            >
                              {faNumberFormatter.format(product.stock)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs">
                            {product.carMappings.length ? (
                              <div className="flex flex-wrap gap-2">
                                {product.carMappings.slice(0, 3).map(({ car }) => (
                                  <span key={car.id} className="rounded-full border border-[#E6EAF2] bg-[#F8FAFC] px-3 py-1">
                                    {car.manufacturer} {car.model}
                                  </span>
                                ))}
                                {product.carMappings.length > 3 ? (
                                  <span className="rounded-full border border-[#E6EAF2] bg-white px-3 py-1 text-[#667085]">
                                    +{faNumberFormatter.format(product.carMappings.length - 3)}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-[#98A2B3]">ثبت نشده</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-3 text-xs">
                              <details className="group">
                                <summary className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#E6EAF2] bg-white px-4 py-2 font-bold text-[#111827] transition group-open:border-[#F5C56B] group-open:text-[#D97706]">
                                  ویرایش محصول
                                </summary>
                                <div className="mt-3 rounded-[24px] border border-[#E6EAF2] bg-[#FBFCFE] p-4">
                                  <ProductEditForm product={product} categories={categories} brands={brands} cars={cars} />
                                </div>
                              </details>
                              <form action={deleteProductFormAction}>
                                <input type="hidden" name="productId" value={product.id} />
                                <button
                                  type="submit"
                                  className="rounded-full border border-[#FECACA] px-4 py-2 font-bold text-[#D92D20] transition hover:bg-[#FFF1F3]"
                                >
                                  حذف
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#667085]">
                          موردی مطابق فیلترهای فعلی پیدا نشد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <ProductsPagination filters={filters} pagination={pagination} />
          </section>
        </section>

        <aside className="space-y-4">
          <section className="admin-panel p-5 md:sticky md:top-6 md:p-6">
            <div>
              <h2 className="text-xl font-black text-[#111827]">افزودن محصول جدید</h2>
              <p className="mt-1 text-sm leading-7 text-[#667085]">
                محصول جدید را با برند، دسته‌بندی، موجودی و خودروهای سازگار ثبت کنید.
              </p>
            </div>
            <div className="mt-6">
              <ProductCreateForm categories={categories} brands={brands} cars={cars} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

type FilterFormProps = {
  categories: ProductsTabData["categories"];
  brands: ProductsTabData["brands"];
  filters: ProductsTabData["filters"];
  pagination: ProductsTabData["pagination"];
  lowStockThreshold: number;
};

function ProductsFilterForm({ categories, brands, filters, pagination, lowStockThreshold }: FilterFormProps) {
  const lowStockLabel = `کمتر از ${faNumberFormatter.format(lowStockThreshold)} عدد`;

  return (
    <form className="grid gap-3 lg:grid-cols-[1.25fr_repeat(3,minmax(0,1fr))] xl:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))]" method="get">
      <input type="hidden" name="tab" value="products" />
      <input type="hidden" name="page" value="1" />

      <label className="flex flex-col gap-2 text-xs font-bold text-[#667085]">
        جستجو
        <input name="search" defaultValue={filters.search ?? ""} placeholder="نام یا SKU محصول" />
      </label>

      <label className="flex flex-col gap-2 text-xs font-bold text-[#667085]">
        برند
        <select name="brandId" defaultValue={filters.brandId ?? ""}>
          <option value="">همه برندها</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-xs font-bold text-[#667085]">
        دسته‌بندی
        <select name="categoryId" defaultValue={filters.categoryId ?? ""}>
          <option value="">همه دسته‌ها</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-xs font-bold text-[#667085]">
        وضعیت موجودی
        <select name="stockStatus" defaultValue={filters.stockStatus}>
          <option value="all">همه</option>
          <option value="low">{lowStockLabel}</option>
          <option value="out">ناموجود</option>
          <option value="in">موجودی مطلوب</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-xs font-bold text-[#667085]">
        تعداد در هر صفحه
        <select name="perPage" defaultValue={String(pagination.perPage)}>
          {[10, 20, 30, 40, 50].map((value) => (
            <option key={value} value={value}>
              {faNumberFormatter.format(value)} مورد
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="btn-primary lg:self-end">
        اعمال فیلتر
      </button>
    </form>
  );
}

function ProductsPagination({
  filters,
  pagination,
}: {
  filters: ProductsTabData["filters"];
  pagination: ProductsTabData["pagination"];
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const createHref = (page: number) => {
    const params = new URLSearchParams();
    params.set("tab", "products");
    params.set("page", String(page));
    params.set("perPage", String(pagination.perPage));
    if (filters.search) params.set("search", filters.search);
    if (filters.brandId) params.set("brandId", filters.brandId);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.stockStatus && filters.stockStatus !== "all") params.set("stockStatus", filters.stockStatus);
    return `/admin?${params.toString()}`;
  };

  const pages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1);

  return (
    <nav className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#E6EAF2] bg-white px-4 py-3 text-xs text-[#667085]">
      <div className="flex flex-wrap gap-2">
        {pages.map((page) => {
          const isActive = page === pagination.page;
          return (
            <Link
              key={page}
              href={createHref(page)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 font-bold transition ${
                isActive ? "bg-[#111827] text-white" : "border border-[#E6EAF2] text-[#475467] hover:border-[#F5C56B]"
              }`}
            >
              {faNumberFormatter.format(page)}
            </Link>
          );
        })}
      </div>
      <p>
        نمایش {faNumberFormatter.format(productsRangeStart(pagination))} تا {faNumberFormatter.format(productsRangeEnd(pagination))} از{" "}
        {faNumberFormatter.format(pagination.total)}
      </p>
    </nav>
  );
}

function productsRangeStart(pagination: ProductsTabData["pagination"]) {
  return pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.perPage + 1;
}

function productsRangeEnd(pagination: ProductsTabData["pagination"]) {
  return Math.min(pagination.page * pagination.perPage, pagination.total);
}
