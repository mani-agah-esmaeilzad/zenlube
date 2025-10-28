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
  averageRating: unknown;
  reviewCount: number;
  price: unknown;
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
];

export function ProductComparisonBoard({ products }: ProductComparisonBoardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState<string>("viscosity");
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

  const formatNumeric = (value: unknown) => {
    if (value == null) {
      return "—";
    }
    if (typeof value === "number") {
      return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value);
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "object" && value !== null && "toString" in value) {
      return value.toString();
    }
    return String(value);
  };

  return (
    <div className="space-y-6 rounded-[40px] border border-white/10 bg-white/5 p-6">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">مقایسه تخصصی روغن موتور</h1>
            <p className="mt-2 text-sm leading-7 text-white/70">
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
                    ? "rounded-full bg-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/30"
                    : "rounded-full border border-white/10 px-4 py-2 text-xs text-white/70 hover:border-white/20 hover:text-white"
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
            className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white outline-none focus:border-purple-400"
          />
          <div className="flex items-center gap-2">
            <select
              value={pendingSelection}
              onChange={(event) => setPendingSelection(event.target.value)}
              className="flex-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white outline-none focus:border-purple-400"
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
              className="rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
            >
              افزودن
            </button>
          </div>
        </div>
        {selectedProducts.length ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            {selectedProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleRemove(product.id)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-white/80 hover:border-red-400/40 hover:text-red-200"
              >
                {product.brand.name} · {product.name}
                <span className="text-[10px]">×</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/50">
            هنوز محصولی انتخاب نشده است. ابتدا از لیست بالا محصول را اضافه کنید.
          </p>
        )}
      </header>

      {selectedProducts.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm text-white/80">
            <thead className="text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-3 text-right">پارامتر</th>
                {selectedProducts.map((product) => (
                  <th key={product.id} className="px-4 py-3 text-right">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-white hover:text-purple-200"
                    >
                      {product.brand.name} · {product.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
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
                  render: (product: ComparisonProduct) => formatNumeric(product.price),
                },
                {
                  key: "averageRating",
                  label: "میانگین امتیاز",
                  render: (product: ComparisonProduct) =>
                    product.averageRating != null ? formatNumeric(product.averageRating) : "—",
                },
                {
                  key: "reviewCount",
                  label: "تعداد بازخورد",
                  render: (product: ComparisonProduct) => formatNumeric(product.reviewCount),
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
                  className={
                    row.key === highlight
                      ? "bg-purple-500/10"
                      : "bg-transparent"
                  }
                >
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/60">
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
        <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-10 text-center text-sm text-white/50">
          ابتدا محصولی را انتخاب کنید تا جدول مقایسه نمایش داده شود.
        </div>
      )}
    </div>
  );
}
