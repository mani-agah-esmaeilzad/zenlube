import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import { faNumberFormatter } from "@/lib/formatters";
import type { ProductsTabData } from "@/services/admin/types";
import { deleteProductFormAction } from "@/actions/admin";
import { ProductCreateForm, ProductEditForm } from "@/components/admin/forms/ProductForm";

export function ProductsTab({ data }: { data: ProductsTabData }) {
  const { categories, brands, cars, products, filters, pagination, lowStock } = data;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">افزودن محصول جدید</h2>
        <p className="mt-2 text-xs text-slate-500">
          پس از ثبت محصول، خودروهای سازگار را انتخاب کنید تا در صفحه خودروها و پیشنهادها نمایش داده شود.
        </p>
        <ProductCreateForm categories={categories} brands={brands} cars={cars} />
      </section>

      {lowStock.count ? (
        <section className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
          <h3 className="text-sm font-semibold text-slate-900">محصولات کم‌موجودی</h3>
          <p className="mt-1 text-xs text-slate-600">
            {faNumberFormatter.format(lowStock.count)} محصول کمتر از {lowStock.threshold} عدد موجودی دارند.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lowStock.preview.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="rounded-full border border-yellow-400/40 px-3 py-1 text-xs text-yellow-100 transition hover:border-yellow-300"
              >
                {product.name} ({faNumberFormatter.format(product.stock)})
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <header className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">مدیریت محصولات</h2>
            <p className="mt-1 text-xs text-slate-500">
              با جستجو و فیلتر نتایج، محصولات مورد نظر را پیدا کنید و از فرم ویرایش برای بروزرسانی سریع جزئیات استفاده کنید.
            </p>
          </div>
          <ProductsFilterForm
            categories={categories}
            brands={brands}
            filters={filters}
            pagination={pagination}
            lowStockThreshold={lowStock.threshold}
          />
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-slate-500">
            <span>
              {faNumberFormatter.format(pagination.total)} محصول یافت شد — صفحه {faNumberFormatter.format(pagination.page)} از {" "}
              {faNumberFormatter.format(pagination.totalPages)}
            </span>
          </div>
        </header>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
            <thead className="bg-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 text-right">نام</th>
                <th className="px-4 py-3 text-right">برند</th>
                <th className="px-4 py-3 text-right">دسته‌بندی</th>
                <th className="px-4 py-3 text-right">قیمت</th>
                <th className="px-4 py-3 text-right">موجودی</th>
                <th className="px-4 py-3 text-right">خودروها</th>
                <th className="px-4 py-3 text-right">اقدامات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-slate-50">
              {products.length ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 text-slate-900">{product.name}</td>
                    <td className="px-4 py-3">{product.brand.name}</td>
                    <td className="px-4 py-3">{product.category.name}</td>
                    <td className="px-4 py-3">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">{faNumberFormatter.format(product.stock)}</td>
                    <td className="px-4 py-3 text-xs">
                      {product.carMappings.length ? (
                        <div className="flex flex-wrap gap-2">
                          {product.carMappings.map(({ car }) => (
                            <span key={car.id} className="rounded-full border border-slate-200 px-2 py-1">
                              {car.manufacturer} {car.model}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">ثبت‌نشده</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-3 text-xs">
                        <details className="group">
                          <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-slate-500 transition group-open:border-sky-400 group-open:text-sky-600">
                            ویرایش
                          </summary>
                          <div className="mt-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                            <ProductEditForm product={product} categories={categories} brands={brands} cars={cars} />
                          </div>
                        </details>
                        <form action={deleteProductFormAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <button
                            type="submit"
                            className="w-full rounded-full border border-red-400/40 px-3 py-1 text-red-200 transition hover:border-red-300 hover:text-red-100"
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
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">
                    موردی مطابق جستجو و فیلترهای فعلی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ProductsPagination filters={filters} pagination={pagination} />
      </section>
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
    <form className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4" method="get">
      <input type="hidden" name="tab" value="products" />
      <input type="hidden" name="page" value="1" />
      <label className="flex flex-col gap-2 text-xs text-slate-500">
        جستجو
        <input
          name="search"
          defaultValue={filters.search ?? ""}
          placeholder="نام یا SKU محصول"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs text-slate-500">
        برند
        <select
          name="brandId"
          defaultValue={filters.brandId ?? ""}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
        >
          <option value="">همه برندها</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-xs text-slate-500">
        دسته‌بندی
        <select
          name="categoryId"
          defaultValue={filters.categoryId ?? ""}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
        >
          <option value="">همه دسته‌ها</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-col gap-2 text-xs text-slate-500">
        <span>وضعیت موجودی</span>
        <div className="grid grid-cols-2 gap-2">
          <select
            name="stockStatus"
            defaultValue={filters.stockStatus}
            className="col-span-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
          >
            <option value="all">همه</option>
            <option value="low">{lowStockLabel}</option>
            <option value="out">ناموجود</option>
            <option value="in">موجودی مطلوب</option>
          </select>
          <select
            name="perPage"
            defaultValue={String(pagination.perPage)}
            className="col-span-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
          >
            {[10, 20, 30, 40, 50].map((value) => (
              <option key={value} value={value}>
                {faNumberFormatter.format(value)} مورد در هر صفحه
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-span-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600"
          >
            اعمال فیلتر
          </button>
        </div>
      </div>
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
    if (filters.stockStatus && filters.stockStatus !== "all") {
      params.set("stockStatus", filters.stockStatus);
    }
    return `/admin?${params.toString()}`;
  };

  const pages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {pages.map((page) => {
        const isActive = page === pagination.page;
        return (
          <Link
            key={page}
            href={createHref(page)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              isActive ? "bg-sky-500 text-slate-900" : "border border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {faNumberFormatter.format(page)}
          </Link>
        );
      })}
    </nav>
  );
}
