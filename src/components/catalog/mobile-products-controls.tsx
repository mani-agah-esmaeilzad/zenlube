"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileSheet } from "@/components/ui/mobile-sheet";
import { cn } from "@/lib/utils";

type MobileProductsControlsProps = {
  activeFilters: string[];
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  currentSortLabel: string;
  defaults: {
    brand?: string;
    car?: string;
    category?: string;
    inStock: boolean;
    maxPrice?: number;
    minPrice?: number;
    minRating?: number;
    search?: string;
    sort: string;
  };
  quickFilters: string[];
  resultsCount: number;
  sorts: Array<{ value: string; label: string }>;
};

export function MobileProductsControls({
  activeFilters,
  brands,
  categories,
  currentSortLabel,
  defaults,
  quickFilters,
  resultsCount,
  sorts,
}: MobileProductsControlsProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="space-y-3 lg:hidden">
      <div className="panel-zen rounded-[24px] p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary-accent-strong">جستجوی فروشگاه</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-base font-black text-text-strong">{resultsCount.toLocaleString("fa-IR")} کالا</span>
              <span className="chip-zen-muted px-2.5 py-1 text-[11px]">
                {currentSortLabel}
              </span>
            </div>
          </div>
          {activeFilters.length ? (
            <Link className="chip-zen shrink-0 px-3 py-2 text-[11px]" href="/products">
              پاکسازی
            </Link>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickFilters.map((item) => (
            <Link
              key={item}
              className="chip-zen-muted rounded-full border bg-[#F7F8FA] px-3 py-1.5 text-xs font-bold text-[#475467]"
              href={`/products?search=${encodeURIComponent(item)}`}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn-outline !min-h-12 flex-1 rounded-2xl px-4 text-sm"
          onClick={() => setFiltersOpen(true)}
          type="button"
        >
          فیلترها
          {activeFilters.length ? (
            <span className="rounded-full bg-[#171B23] px-2 py-1 text-[11px] text-white">
              {activeFilters.length.toLocaleString("fa-IR")}
            </span>
          ) : null}
        </button>
        <button
          className="btn-outline !min-h-12 flex-1 rounded-2xl px-4 text-sm"
          onClick={() => setSortOpen(true)}
          type="button"
        >
          مرتب‌سازی
        </button>
      </div>

      {activeFilters.length ? (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((item) => (
            <span
              key={item}
              className="chip-zen px-3 py-1.5 text-xs"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      <MobileSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="فیلترهای فروشگاه"
        footer={
          <div className="grid gap-2 min-[360px]:grid-cols-2">
            <Link className="btn-outline w-full rounded-2xl" href="/products">
              حذف همه فیلترها
            </Link>
            <button className="btn-primary w-full rounded-2xl" form="mobile-products-filter-form" type="submit">
              اعمال فیلتر
            </button>
          </div>
        }
      >
        <form action="/products" className="space-y-4" id="mobile-products-filter-form" method="get">
          <input name="page" type="hidden" value="1" />

          <Field label="جستجو">
            <input
              autoComplete="off"
              className="input-zen mt-2"
              defaultValue={defaults.search}
              name="search"
              placeholder="نام محصول، برند، مدل خودرو"
            />
          </Field>

          <Field label="دسته‌بندی">
            <select className="input-zen mt-2" defaultValue={defaults.category ?? ""} name="category">
              <option value="">همه دسته‌ها</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="برند">
            <select className="input-zen mt-2" defaultValue={defaults.brand ?? ""} name="brand">
              <option value="">همه برندها</option>
              {brands.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="مناسب برای خودرو">
            <input
              className="input-zen mt-2"
              defaultValue={defaults.car}
              name="car"
              placeholder="اسلاگ یا مدل خودرو"
            />
          </Field>

          <div className="grid gap-3 min-[360px]:grid-cols-2">
            <Field label="حداقل قیمت">
              <input
                className="input-zen mt-2"
                defaultValue={defaults.minPrice}
                inputMode="numeric"
                name="minPrice"
                placeholder="مثلاً 500000"
              />
            </Field>
            <Field label="حداکثر قیمت">
              <input
                className="input-zen mt-2"
                defaultValue={defaults.maxPrice}
                inputMode="numeric"
                name="maxPrice"
                placeholder="مثلاً 5000000"
              />
            </Field>
          </div>

          <label className="panel-zen-muted flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-bold text-[#374151]">
            فقط کالاهای موجود
            <input className="size-4 accent-[#F59E0B]" defaultChecked={defaults.inStock} name="inStock" type="checkbox" value="1" />
          </label>

          <Field label="حداقل امتیاز">
            <select className="input-zen mt-2" defaultValue={defaults.minRating ?? ""} name="minRating">
              <option value="">همه امتیازها</option>
              <option value="4">۴ ستاره و بیشتر</option>
              <option value="3">۳ ستاره و بیشتر</option>
            </select>
          </Field>

          <div>
            <p className="mb-2 text-xs font-bold text-[#374151]">فیلترهای سریع روغن</p>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((item) => (
                <Link
                  key={item}
                  className="chip-zen-muted interactive-lift rounded-full border px-3 py-1.5 text-xs font-semibold text-text-muted"
                  href={`/products?search=${encodeURIComponent(item)}`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </form>
      </MobileSheet>

      <MobileSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="مرتب‌سازی نتایج"
        footer={
          <button className="btn-primary w-full rounded-2xl" form="mobile-products-sort-form" type="submit">
            اعمال مرتب‌سازی
          </button>
        }
      >
        <form action="/products" className="space-y-3" id="mobile-products-sort-form" method="get">
          <input name="search" type="hidden" value={defaults.search ?? ""} />
          <input name="category" type="hidden" value={defaults.category ?? ""} />
          <input name="brand" type="hidden" value={defaults.brand ?? ""} />
          <input name="car" type="hidden" value={defaults.car ?? ""} />
          <input name="minPrice" type="hidden" value={defaults.minPrice ?? ""} />
          <input name="maxPrice" type="hidden" value={defaults.maxPrice ?? ""} />
          <input name="minRating" type="hidden" value={defaults.minRating ?? ""} />
          <input name="page" type="hidden" value="1" />
          {defaults.inStock ? <input name="inStock" type="hidden" value="1" /> : null}

          {sorts.map((item) => (
            <label
              key={item.value}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 text-sm font-bold transition",
                defaults.sort === item.value
                  ? "border-[rgba(245,158,11,0.26)] bg-surface-tint text-primary-accent-strong"
                  : "border-border bg-white text-[#374151]",
              )}
            >
              <span>{item.label}</span>
              <input
                className="size-4 accent-[#F59E0B]"
                defaultChecked={defaults.sort === item.value}
                name="sort"
                type="radio"
                value={item.value}
              />
            </label>
          ))}
        </form>
      </MobileSheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-[#374151]">
      {label}
      {children}
    </label>
  );
}
