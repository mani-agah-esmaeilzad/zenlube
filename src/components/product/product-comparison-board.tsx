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

const comparisonRows = [
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
      `${new Intl.NumberFormat("fa-IR").format(product.price)} تومان`,
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
    render: (product: ComparisonProduct) => (product.tags.length ? product.tags.join("، ") : "—"),
  },
] as const;

function formatNumeric(value: number | null | string) {
  if (value == null) {
    return "—";
  }
  if (typeof value === "number") {
    return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value);
  }
  return value;
}

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
      const haystack =
        `${product.brand.name} ${product.name} ${product.viscosity ?? ""} ${product.approvals ?? ""}`.toLowerCase();
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

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 text-[#475467] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#171B23] sm:text-xl">محصولات و معیار مقایسه</h2>
            <p className="mt-2 text-sm leading-8 text-[#667085]">
              محصول‌ها را اضافه کنید و معیار مهم‌تر را برای برجسته‌سازی انتخاب کنید.
            </p>
          </div>
          <div className="-mx-4 flex overflow-x-auto border-b border-[#E7E8EE] px-4 scrollbar-none sm:mx-0 sm:px-0">
            {highlightRows.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setHighlight(item.key)}
                className={
                  highlight === item.key
                    ? "min-h-11 shrink-0 border-b-2 border-[#D97706] px-4 py-2 text-xs font-extrabold text-[#171B23] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE7B0] md:min-h-10"
                    : "min-h-11 shrink-0 border-b-2 border-transparent px-4 py-2 text-xs font-bold text-[#667085] transition hover:text-[#D97706] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE7B0] md:min-h-10"
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
            className="input-zen"
          />
          <div className="flex items-end gap-2">
            <select
              value={pendingSelection}
              onChange={(event) => setPendingSelection(event.target.value)}
              className="input-zen min-w-0 flex-1"
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
              className="btn-primary w-fit shrink-0 !min-h-11 px-4 py-2 text-sm"
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
                className="inline-flex min-h-11 items-center gap-1.5 px-1 font-bold text-[#475467] transition hover:text-[#D97706] md:min-h-10"
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
        <>
          <div className="divide-y divide-[#E7E8EE] border-y border-[#E7E8EE] md:hidden">
            {selectedProducts.map((product) => (
              <article
                key={product.id}
                className="py-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 min-h-11 py-2 text-sm font-extrabold leading-7 text-[#171B23] hover:text-[#D97706]"
                    >
                      {product.brand.name} · {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-[#667085]">{product.category.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="inline-flex min-h-11 shrink-0 items-center px-1 text-[11px] font-bold text-[#667085] transition hover:text-[#D97706] md:min-h-10"
                  >
                    حذف
                  </button>
                </div>

                <dl className="mt-4 divide-y divide-[#E7E8EE] border-y border-[#E7E8EE]">
                  {comparisonRows.map((row) => (
                    <div
                      key={row.key}
                      className={`grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 px-2 py-3 ${row.key === highlight ? "bg-[#FFF8E8]" : ""}`}
                    >
                      <dt className="text-[11px] font-bold text-[#667085]">{row.label}</dt>
                      <dd className="min-w-0 break-words text-sm font-semibold leading-7 text-[#171B23]">{row.render(product)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-[#E7E8EE] text-sm text-[#475467]">
              <thead className="text-xs uppercase text-[#667085]">
                <tr>
                  <th className="px-4 py-3 text-right">پارامتر</th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} className="px-4 py-3 text-right">
                      <Link href={`/products/${product.slug}`} className="text-[#D97706] hover:text-[#B45309]">
                        {product.brand.name} · {product.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E8EE]">
                {comparisonRows.map((row) => (
                  <tr
                    key={row.key}
                    className={row.key === highlight ? "bg-[#FFF8E8]" : "bg-transparent"}
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
        </>
      ) : (
        <div className="py-10 text-center text-sm text-[#667085]">
          ابتدا محصولی را انتخاب کنید تا جدول مقایسه نمایش داده شود.
        </div>
      )}
    </div>
  );
}
