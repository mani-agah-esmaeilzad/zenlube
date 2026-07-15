"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SuggestionGroup = {
  products: Array<{ id: string; name: string; slug: string; brandName: string }>;
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  cars: Array<{ id: string; name: string; slug: string }>;
};

type SearchAutocompleteFormProps = {
  placeholder?: string;
  quickSuggestions: string[];
};

export function SearchAutocompleteForm({
  placeholder = "جستجو برای روغن، فیلتر، برند یا خودرو...",
  quickSuggestions,
}: SearchAutocompleteFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SuggestionGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      controllerRef.current?.abort();
      setResults(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setResults(null);
          return;
        }
        const data = (await response.json()) as SuggestionGroup;
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const hasResults = useMemo(() => {
    if (!results) return false;
    return Boolean(
      results.products.length ||
      results.brands.length ||
      results.categories.length ||
      results.cars.length,
    );
  }, [results]);

  return (
    <form action="/products" className="group relative">
      <input
        aria-label="جستجوی محصول"
        className="input-zen h-12 rounded-2xl border-[#E7E8EE] bg-white pr-11 text-sm font-medium shadow-[0_8px_24px_rgba(17,24,39,0.03)] lg:h-[52px]"
        name="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
      />
      <div className="invisible absolute inset-x-0 top-[calc(100%+8px)] z-50 rounded-[22px] border border-[#ECEEF2] bg-white p-4 opacity-0 shadow-[0_20px_60px_rgba(17,24,39,0.12)] transition group-focus-within:visible group-focus-within:opacity-100">
        {query.trim().length < 2 ? (
          <>
            <p className="mb-3 text-xs font-bold text-[#667085]">جستجوهای پیشنهادی</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((item) => (
                <Link
                  key={item}
                  className="rounded-full border border-[#E7E8EE] px-3 py-1.5 text-xs font-semibold text-[#344054] transition hover:border-[#F59E0B] hover:bg-[#FFF9EC] hover:text-[#D97706]"
                  href={`/products?search=${encodeURIComponent(item)}`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </>
        ) : loading ? (
          <p className="text-xs font-bold text-[#667085]">در حال جستجو...</p>
        ) : hasResults && results ? (
          <div className="space-y-4">
            <SuggestionSection
              title="محصولات"
              items={results.products.map((item) => ({ key: item.id, href: `/products/${item.slug}`, label: item.name, meta: item.brandName }))}
            />
            <SuggestionSection
              title="برندها"
              items={results.brands.map((item) => ({ key: item.id, href: `/products?brand=${item.slug}`, label: item.name }))}
            />
            <SuggestionSection
              title="دسته‌بندی‌ها"
              items={results.categories.map((item) => ({ key: item.id, href: `/products?category=${item.slug}`, label: item.name }))}
            />
            <SuggestionSection
              title="خودروها"
              items={results.cars.map((item) => ({ key: item.id, href: `/products?car=${item.slug}`, label: item.name }))}
            />
          </div>
        ) : (
          <p className="text-xs font-bold text-[#667085]">نتیجه‌ای پیدا نشد.</p>
        )}
      </div>
    </form>
  );
}

function SuggestionSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; href: string; label: string; meta?: string }>;
}) {
  if (!items.length) return null;

  return (
    <div>
      <p className="mb-2 text-[11px] font-black text-[#98A2B3]">{title}</p>
      <div className="grid gap-2">
        {items.slice(0, 4).map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="rounded-2xl border border-[#E7E8EE] px-3 py-2 text-xs text-[#344054] transition hover:border-[#F59E0B] hover:bg-[#FFF9EC] hover:text-[#D97706]"
          >
            <span className="font-bold">{item.label}</span>
            {item.meta ? <span className="mr-2 text-[#98A2B3]">{item.meta}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
