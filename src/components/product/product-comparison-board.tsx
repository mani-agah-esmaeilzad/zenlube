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
    background: "bg-[#FFF8E8]",
    button:
      "border border-[#F59E0B] bg-[linear-gradient(180deg,#FFB52F_0%,#F59E0B_100%)] text-white shadow-[0_14px_28px_rgba(245,158,11,0.24)] hover:border-[#E78A00] hover:bg-[linear-gradient(180deg,#FFC14A_0%,#E78A00_100%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE7B0]",
  },
  approvals: {
    background: "bg-[#F7F8FA]",
    button:
      "border border-[#E7E8EE] bg-white text-[#171B23] shadow-sm hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE7B0]",
  },
  price: {
    background: "bg-[#FFF8E8]",
    button:
      "border border-[#171B23] bg-[#171B23] text-white shadow-sm hover:bg-[#252C39] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D0D5DD]",
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
    <div className="space-y-6 rounded-[36px] border border-[#E7E8EE] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 text-[#475467] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#171B23]">مقایسه تخصصی روغن موتور</h1>
            <p className="mt-2 text-sm leading-8 text-[#667085]">
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
                    ? `rounded-full px-4 py-2 text-xs font-bold transition ${highlightTokens[item.key].button}`
                    : "rounded-full border border-[#E7E8EE] px-4 py-2 text-xs font-bold text-[#667085] transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE7B0]"
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
            className="input-zen rounded-full"
          />
          <div className="flex items-center gap-2">
            <select
              value={pendingSelection}
              onChange={(event) => setPendingSelection(event.target.value)}
              className="input-zen flex-1 rounded-full"
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
              className="btn-primary !min-h-10 rounded-full px-4 py-2 text-sm"
            >
              افزودن
            </button>
          </div>
        </div>
        {selectedProducts.length ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
            {selectedProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleRemove(product.id)}
                className="inline-flex items-center gap-2 rounded-full border border-[#E7E8EE] bg-[#F7F8FA] px-4 py-2 text-[#475467] transition hover:border-[#F5C56B] hover:bg-[#FFF8E8] hover:text-[#D97706]"
              >
                {product.brand.name} · {product.name}
                <span className="text-[10px]">×</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#667085]">
            هنوز محصولی انتخاب نشده است. ابتدا از لیست بالا محصول را اضافه کنید.
          </p>
        )}
      </header>

      {selectedProducts.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E7E8EE] text-sm text-[#475467]">
            <thead className="text-xs uppercase text-[#667085]">
              <tr>
                <th className="px-4 py-3 text-right">پارامتر</th>
                {selectedProducts.map((product) => (
                  <th key={product.id} className="px-4 py-3 text-right">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-[#D97706] hover:text-[#B45309]"
                    >
                      {product.brand.name} · {product.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E8EE]">
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
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#667085]">
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
        <div className="rounded-[28px] border border-dashed border-[#D0D5DD] bg-[#F7F8FA] p-10 text-center text-sm text-[#667085]">
          ابتدا محصولی را انتخاب کنید تا جدول مقایسه نمایش داده شود.
        </div>
      )}
    </div>
  );
}
