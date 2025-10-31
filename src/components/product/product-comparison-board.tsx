"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ComparisonProduct = {
  id: string;
  name: string;
  slug: string;
  viscosity: string | null;
  oilType: string | null;
  approvals: string | null;
  averageRating: number | null;
  reviewCount: number;
  price: number;
  tags: string[];
  brand: { name: string };
  category: { name: string };
};

type ProductComparisonBoardProps = {
  products: ComparisonProduct[];
};

const highlightRows = [
  { key: "viscosity", label: "ویسکوزیته" },
  { key: "approvals", label: "استاندارد سازنده" },
  { key: "price", label: "قیمت" },
] as const;

const highlightTokens: Record<
  (typeof highlightRows)[number]["key"],
  { background: string; button: string }
> = {
  viscosity: {
    background: "bg-sky-50",
    button:
      "bg-sky-500 text-white shadow-lg shadow-sky-300/40 hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
  },
  approvals: {
    background: "bg-emerald-50",
    button:
      "bg-emerald-500 text-white shadow-lg shadow-emerald-300/40 hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200",
  },
  price: {
    background: "bg-amber-50",
    button:
      "bg-amber-500 text-white shadow-lg shadow-amber-300/40 hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
  },
};

export function ProductComparisonBoard({ products }: ProductComparisonBoardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState<(typeof highlightRows)[number]["key"]>("viscosity");
  const [pendingSelection, setPendingSelection] = useState("");

  const filteredProducts = useMemo(() => {
    if (!search.trim()) {
      return products;
    }
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const haystack = `${product.brand.name} ${product.name} ${product.viscosity ?? ""} ${product.approvals ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [products, search]);

  const selectedProducts = selectedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is ComparisonProduct => Boolean(product));

  const handleAddProduct = () => {
    if (!pendingSelection || selectedIds.includes(pendingSelection)) {
      return;
    }
    if (selectedIds.length >= 3) {
      setSelectedIds((ids) => [...ids.slice(1), pendingSelection]);
    } else {
      setSelectedIds((ids) => [...ids, pendingSelection]);
    }

    void fetch("/api/engagement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityType: "product",
        entityId: pendingSelection,
        eventType: "comparison_add",
      }),
    }).catch(() => {
      /* no-op */
    });
  };

  const handleRemove = (id: string) => {
    setSelectedIds((ids) => ids.filter((item) => item !== id));
  };

  const formatNumeric = (value: number | null | string) => {
    if (value == null) {
      return "—";
    }
    if (typeof value === "number") {
      return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value);
    }
    return value;
  };

  return (
    <div className="space-y-6 rounded-[40px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-500/10">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 text-slate-700 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">مقایسه تخصصی روغن موتور</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              حداکثر سه محصول را انتخاب کنید تا مشخصات فنی، استانداردها و قیمت آن‌ها را در کنار هم
              بررسی کنید. برای برجسته‌سازی معیارها، یکی از گزینه‌های ویسکوزیته، استاندارد یا قیمت را
              انتخاب کنید.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {highlightRows.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setHighlight(item.key)}
                className={
                  highlight === item.key
                    ? `rounded-full px-4 py-2 text-xs font-semibold transition ${highlightTokens[item.key].button}`
                    : "rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-sky-200 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس برند، نام یا ویسکوزیته"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          />
          <div className="flex items-center gap-2">
            <select
              value={pendingSelection}
              onChange={(event) => setPendingSelection(event.target.value)}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            >
              <option value="">انتخاب محصول برای مقایسه</option>
              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.brand.name} · {product.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddProduct}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-300/40 transition hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            >
              افزودن
            </button>
          </div>
        </div>
        {selectedProducts.length ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {selectedProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleRemove(product.id)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                {product.brand.name} · {product.name}
                <span className="text-[10px]">×</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            هنوز محصولی انتخاب نشده است. ابتدا از لیست بالا محصول را اضافه کنید.
          </p>
        )}
      </header>

      {selectedProducts.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-right">پارامتر</th>
                {selectedProducts.map((product) => (
                  <th key={product.id} className="px-4 py-3 text-right">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sky-600 hover:text-sky-700"
                    >
                      {product.brand.name} · {product.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[
                {
                  key: "viscosity",
                  label: "ویسکوزیته",
                  render: (product: ComparisonProduct) => product.viscosity ?? "نامشخص",
                },
                {
                  key: "approvals",
                  label: "استاندارد سازنده",
                  render: (product: ComparisonProduct) => product.approvals ?? "نامشخص",
                },
                {
                  key: "oilType",
                  label: "نوع پایه روغن",
                  render: (product: ComparisonProduct) => product.oilType ?? "نامشخص",
                },
                {
                  key: "price",
                  label: "قیمت",
                  render: (product: ComparisonProduct) =>
                    new Intl.NumberFormat("fa-IR").format(product.price),
                },
                {
                  key: "averageRating",
                  label: "میانگین امتیاز",
                  render: (product: ComparisonProduct) => formatNumeric(product.averageRating),
                },
                {
                  key: "reviewCount",
                  label: "تعداد بازخورد",
                  render: (product: ComparisonProduct) =>
                    new Intl.NumberFormat("fa-IR").format(product.reviewCount),
                },
                {
                  key: "category",
                  label: "دسته‌بندی",
                  render: (product: ComparisonProduct) => product.category.name,
                },
                {
                  key: "tags",
                  label: "ویژگی‌ها",
                  render: (product: ComparisonProduct) =>
                    product.tags.length ? product.tags.join("، ") : "—",
                },
              ].map((row) => (
                <tr
                  key={row.key}
                  className={row.key === highlight ? highlightTokens[row.key].background : "bg-transparent"}
                >
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                    {row.label}
                  </th>
                  {selectedProducts.map((product) => (
                    <td key={product.id} className="px-4 py-3 text-right text-sm">
                      {row.render(product)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          ابتدا محصولی را انتخاب کنید تا جدول مقایسه نمایش داده شود.
        </div>
      )}
    </div>
  );
}
