"use client";

import Link from "next/link";
import { useState } from "react";

import { ProductFilterFields } from "@/components/catalog/product-filter-fields";
import { MobileSheet } from "@/components/ui/mobile-sheet";
import { cn } from "@/lib/utils";

type MobileProductsControlsProps = {
  activeFilters: string[];
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  viscosities: string[];
  oilTypes: string[];
  currentSortLabel: string;
  defaults: {
    brand?: string;
    car?: string;
    category?: string;
    viscosity?: string;
    oilType?: string;
    inStock: boolean;
    maxPrice?: number;
    minPrice?: number;
    minRating?: number;
    search?: string;
    sort: string;
  };
  resultsCount: number;
  sorts: Array<{ value: string; label: string }>;
};

export function MobileProductsControls({
  activeFilters,
  brands,
  categories,
  viscosities,
  oilTypes,
  currentSortLabel,
  defaults,
  resultsCount,
  sorts,
}: MobileProductsControlsProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-text-strong">{resultsCount.toLocaleString("fa-IR")} کالا</p>
          <p className="mt-1 text-xs text-text-muted">{currentSortLabel}</p>
        </div>
        {activeFilters.length ? (
          <Link className="text-xs font-bold text-primary-accent-strong" href="/products">
            پاکسازی فیلترها
          </Link>
        ) : null}
      </div>

      <div className="sticky top-[4.25rem] z-20 -mx-4 mt-3 flex gap-2 border-y border-border/80 bg-white/95 px-4 py-2 backdrop-blur-md sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <button className="btn-outline min-h-11 px-3 text-xs" onClick={() => setFiltersOpen(true)} type="button">
          فیلترها
          {activeFilters.length ? (
            <span className="rounded-full bg-primary px-2 py-1 text-[11px] text-white">
              {activeFilters.length.toLocaleString("fa-IR")}
            </span>
          ) : null}
        </button>
        <button className="btn-outline min-h-11 px-3 text-xs" onClick={() => setSortOpen(true)} type="button">
          مرتب‌سازی
        </button>
      </div>

      {activeFilters.length ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-3 scrollbar-none sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
          {activeFilters.map((item) => (
            <span key={item} className="chip-zen shrink-0 px-3 py-1.5 text-xs">
              {item}
            </span>
          ))}
        </div>
      ) : null}

      <MobileSheet
        footer={
          <div className="flex items-center justify-between gap-3">
            <Link className="text-link-zen inline-flex min-h-11 items-center px-2 text-xs font-bold" href="/products">
              حذف همه
            </Link>
            <button className="btn-primary" form="mobile-products-filter-form" type="submit">
              اعمال فیلتر
            </button>
          </div>
        }
        onClose={() => setFiltersOpen(false)}
        open={filtersOpen}
        title="فیلترهای فروشگاه"
      >
        <form action="/products" className="space-y-4" id="mobile-products-filter-form" method="get">
          <input name="page" type="hidden" value="1" />
          <input name="sort" type="hidden" value={defaults.sort} />
          <ProductFilterFields
            brands={brands}
            categories={categories}
            defaults={defaults}
            oilTypes={oilTypes}
            viscosities={viscosities}
          />
        </form>
      </MobileSheet>

      <MobileSheet
        footer={
          <div className="flex justify-end">
            <button className="btn-primary" form="mobile-products-sort-form" type="submit">
              اعمال مرتب‌سازی
            </button>
          </div>
        }
        onClose={() => setSortOpen(false)}
        open={sortOpen}
        title="مرتب‌سازی نتایج"
      >
        <form action="/products" className="space-y-3" id="mobile-products-sort-form" method="get">
          <input name="search" type="hidden" value={defaults.search ?? ""} />
          <input name="category" type="hidden" value={defaults.category ?? ""} />
          <input name="brand" type="hidden" value={defaults.brand ?? ""} />
          <input name="car" type="hidden" value={defaults.car ?? ""} />
          <input name="viscosity" type="hidden" value={defaults.viscosity ?? ""} />
          <input name="oilType" type="hidden" value={defaults.oilType ?? ""} />
          <input name="minPrice" type="hidden" value={defaults.minPrice ?? ""} />
          <input name="maxPrice" type="hidden" value={defaults.maxPrice ?? ""} />
          <input name="minRating" type="hidden" value={defaults.minRating ?? ""} />
          <input name="page" type="hidden" value="1" />
          {defaults.inStock ? <input name="inStock" type="hidden" value="1" /> : null}

          {sorts.map((item) => (
            <label
              key={item.value}
              className={cn(
                "flex min-h-12 cursor-pointer items-center justify-between border-b px-1 py-3 text-sm font-bold transition",
                defaults.sort === item.value
                  ? "border-primary-accent bg-surface-tint text-primary-accent-strong"
                  : "border-border bg-white text-text",
              )}
            >
              <span>{item.label}</span>
              <input className="size-4 accent-[#D97706]" defaultChecked={defaults.sort === item.value} name="sort" type="radio" value={item.value} />
            </label>
          ))}
        </form>
      </MobileSheet>
    </div>
  );
}
