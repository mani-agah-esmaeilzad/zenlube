"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

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

type FlatSuggestion = {
  href: string;
  label: string;
  meta?: string;
};

const RECENT_SEARCHES_KEY = "oilbar:recent-searches";
const MIN_QUERY_LENGTH = 2;

export function SearchAutocompleteForm({
  placeholder = "جستجو برای روغن، فیلتر، برند یا خودرو...",
  quickSuggestions,
}: SearchAutocompleteFormProps) {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SuggestionGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item): item is string => typeof item === "string").slice(0, 6));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      controllerRef.current?.abort();
      setResults(null);
      setLoading(false);
      setError(null);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setResults(null);
          setError("خطا در دریافت پیشنهادها");
          return;
        }
        const data = (await response.json()) as SuggestionGroup;
        setResults(data);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setResults(null);
        setError("جستجو در حال حاضر در دسترس نیست.");
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

  const flatSuggestions = useMemo<FlatSuggestion[]>(() => {
    if (!results) return [];

    return [
      ...results.products.map((item) => ({
        href: `/products/${item.slug}`,
        label: item.name,
        meta: item.brandName,
      })),
      ...results.brands.map((item) => ({
        href: `/products?brand=${item.slug}`,
        label: item.name,
      })),
      ...results.categories.map((item) => ({
        href: `/products?category=${item.slug}`,
        label: item.name,
      })),
      ...results.cars.map((item) => ({
        href: `/products?car=${item.slug}`,
        label: item.name,
      })),
    ];
  }, [results]);

  const recentOrQuickSuggestions = recentSearches.length ? recentSearches : quickSuggestions;
  const activeDescendant = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  const persistRecentSearch = (term: string) => {
    const normalized = term.trim();
    if (!normalized) return;
    const next = [normalized, ...recentSearches.filter((item) => item !== normalized)].slice(0, 6);
    setRecentSearches(next);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSuggestionSelect = (href: string, term = query) => {
    persistRecentSearch(term);
    setOpen(false);
    setActiveIndex(-1);
    router.push(href);
  };

  const handleSubmit = () => {
    persistRecentSearch(query);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!flatSuggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % flatSuggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? flatSuggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const target = flatSuggestions[activeIndex];
      if (target) {
        handleSuggestionSelect(target.href, query);
      }
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <form action="/products" className="relative" onSubmit={handleSubmit} ref={formRef} role="search">
        <SearchIcon className="pointer-events-none absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-label="جستجوی محصول"
          autoComplete="off"
          className="input-zen h-12 rounded-[20px] border-border bg-white pl-11 pr-11 text-sm font-semibold lg:h-[54px]"
          name="search"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          role="combobox"
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label="پاک کردن جستجو"
            className="absolute left-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-soft transition hover:bg-surface-elevated hover:text-text-strong"
            onClick={() => {
              setQuery("");
              setResults(null);
              setError(null);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {open ? (
        <div
          className="panel-zen absolute inset-x-0 top-[calc(100%+10px)] z-50 max-h-[min(70dvh,32rem)] overflow-y-auto rounded-[24px] p-3 sm:p-4"
          id={listboxId}
          role="listbox"
        >
          {query.trim().length < MIN_QUERY_LENGTH ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-text-muted">
                  {recentSearches.length ? "جستجوهای اخیر" : "جستجوهای پیشنهادی"}
                </p>
                {recentSearches.length ? (
                  <button
                    className="text-[11px] font-bold text-primary-accent-strong"
                    onClick={clearRecentSearches}
                    type="button"
                  >
                    پاک کردن
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {recentOrQuickSuggestions.map((item) => (
                  <button
                    key={item}
                    className="chip-zen-muted interactive-lift rounded-full border px-3 py-1.5 text-xs font-semibold text-[#344054]"
                    onClick={() => handleSuggestionSelect(`/products?search=${encodeURIComponent(item)}`, item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          ) : loading ? (
            <p className="text-xs font-bold text-text-muted">در حال جستجو...</p>
          ) : error ? (
            <p className="text-xs font-bold text-danger">{error}</p>
          ) : hasResults && results ? (
            <div className="space-y-4">
              <SuggestionSection
                activeIndex={activeIndex}
                baseIndex={0}
                items={results.products.map((item) => ({ key: item.id, href: `/products/${item.slug}`, label: item.name, meta: item.brandName }))}
                listboxId={listboxId}
                onHover={setActiveIndex}
                onSelect={(href) => handleSuggestionSelect(href)}
                query={query}
                title="محصولات"
              />
              <SuggestionSection
                activeIndex={activeIndex}
                baseIndex={results.products.length}
                items={results.brands.map((item) => ({ key: item.id, href: `/products?brand=${item.slug}`, label: item.name }))}
                listboxId={listboxId}
                onHover={setActiveIndex}
                onSelect={(href) => handleSuggestionSelect(href)}
                query={query}
                title="برندها"
              />
              <SuggestionSection
                activeIndex={activeIndex}
                baseIndex={results.products.length + results.brands.length}
                items={results.categories.map((item) => ({ key: item.id, href: `/products?category=${item.slug}`, label: item.name }))}
                listboxId={listboxId}
                onHover={setActiveIndex}
                onSelect={(href) => handleSuggestionSelect(href)}
                query={query}
                title="دسته‌بندی‌ها"
              />
              <SuggestionSection
                activeIndex={activeIndex}
                baseIndex={results.products.length + results.brands.length + results.categories.length}
                items={results.cars.map((item) => ({ key: item.id, href: `/products?car=${item.slug}`, label: item.name }))}
                listboxId={listboxId}
                onHover={setActiveIndex}
                onSelect={(href) => handleSuggestionSelect(href)}
                query={query}
                title="خودروها"
              />
              <button
                className="btn-outline mt-1 w-full justify-center !min-h-11 text-xs"
                onClick={() => {
                  persistRecentSearch(query);
                  setOpen(false);
                  formRef.current?.requestSubmit();
                }}
                type="button"
              >
                مشاهده همه نتایج برای «{query.trim()}»
              </button>
            </div>
          ) : (
            <p className="text-xs font-bold text-text-muted">نتیجه‌ای پیدا نشد.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SuggestionSection({
  activeIndex,
  baseIndex,
  title,
  items,
  listboxId,
  onHover,
  onSelect,
  query,
}: {
  activeIndex: number;
  baseIndex: number;
  title: string;
  items: Array<{ key: string; href: string; label: string; meta?: string }>;
  listboxId: string;
  onHover: (index: number) => void;
  onSelect: (href: string) => void;
  query: string;
}) {
  if (!items.length) return null;

  return (
    <div>
      <p className="mb-2 text-[11px] font-black text-text-soft">{title}</p>
      <div className="grid gap-2">
        {items.slice(0, 4).map((item, index) => {
          const absoluteIndex = baseIndex + index;
          const isActive = activeIndex === absoluteIndex;

          return (
            <button
              aria-selected={isActive}
              className={cn(
                "min-w-0 rounded-2xl border px-3 py-2 text-right text-xs transition",
                isActive
                  ? "border-[rgba(245,158,11,0.34)] bg-surface-tint text-primary-accent-strong shadow-[0_12px_24px_rgba(245,158,11,0.12)]"
                  : "border-border bg-white text-[#344054] hover:border-[rgba(245,158,11,0.28)] hover:bg-surface-tint hover:text-primary-accent-strong",
              )}
              id={`${listboxId}-option-${absoluteIndex}`}
              key={item.key}
              onClick={() => onSelect(item.href)}
              onMouseEnter={() => onHover(absoluteIndex)}
              role="option"
              type="button"
            >
              <span className="line-clamp-2 block font-bold leading-6">{highlightQuery(item.label, query)}</span>
              {item.meta ? <span className="mt-1 block text-text-soft">{highlightQuery(item.meta, query)}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function highlightQuery(text: string, query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return text;

  const lowerText = text.toLocaleLowerCase("fa");
  const lowerQuery = normalizedQuery.toLocaleLowerCase("fa");
  const startIndex = lowerText.indexOf(lowerQuery);

  if (startIndex < 0) {
    return text;
  }

  const endIndex = startIndex + normalizedQuery.length;

  return (
    <Fragment>
      {text.slice(0, startIndex)}
      <mark className="rounded bg-[#FFF1C7] px-0.5 text-inherit">{text.slice(startIndex, endIndex)}</mark>
      {text.slice(endIndex)}
    </Fragment>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
