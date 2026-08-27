"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type {
  ProductCompatibilityItem,
  ProductFaqItem,
  ProductSpecRow,
} from "@/lib/product-detail";
import { cn } from "@/lib/utils";

type ProductDetailSectionsProps = {
  description?: string | null;
  specRows: ProductSpecRow[];
  compatibleCars: ProductCompatibilityItem[];
  importantNotes: string[];
  faqs: ProductFaqItem[];
};

type SectionId = "description" | "specs" | "cars" | "notes" | "faq";

type SectionConfig = {
  id: SectionId;
  title: string;
  visible: boolean;
};

const sectionLabels: Record<SectionId, string> = {
  description: "معرفی محصول",
  specs: "مشخصات فنی",
  cars: "خودروهای سازگار",
  notes: "نکات مهم",
  faq: "سوالات متداول",
};

export function ProductDetailSections({
  description,
  specRows,
  compatibleCars,
  importantNotes,
  faqs,
}: ProductDetailSectionsProps) {
  const sections = useMemo<SectionConfig[]>(
    () => {
      const allSections: SectionConfig[] = [
        { id: "description", title: sectionLabels.description, visible: Boolean(description?.trim()) },
        { id: "specs", title: sectionLabels.specs, visible: specRows.length > 0 },
        { id: "cars", title: sectionLabels.cars, visible: compatibleCars.length > 0 },
        { id: "notes", title: sectionLabels.notes, visible: importantNotes.length > 0 },
        { id: "faq", title: sectionLabels.faq, visible: faqs.length > 0 },
      ];

      return allSections.filter((section) => section.visible);
    },
    [compatibleCars.length, description, faqs.length, importantNotes.length, specRows.length],
  );

  const [activeSection, setActiveSection] = useState<SectionId>(sections[0]?.id ?? "description");

  useEffect(() => {
    if (!sections.some((section) => section.id === activeSection) && sections[0]) {
      setActiveSection(sections[0].id);
    }
  }, [activeSection, sections]);

  if (!sections.length) {
    return null;
  }

  return (
    <section className="bg-transparent md:rounded-2xl md:border md:border-border md:bg-white md:p-5 lg:p-6">
      <div className="hidden border-b border-border md:block">
        <div className="flex flex-wrap items-center gap-6 overflow-x-auto pb-1 scrollbar-none">
          {sections.map((section) => (
            <button
              key={section.id}
              aria-selected={activeSection === section.id}
              className={cn(
                "border-b-2 pb-3 text-sm font-extrabold transition",
                activeSection === section.id
                  ? "border-primary-accent text-text-strong"
                  : "border-transparent text-text-muted hover:text-text-strong",
              )}
              onClick={() => setActiveSection(section.id)}
              role="tab"
              type="button"
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden pt-5 md:block">
        {renderSectionBody(activeSection, { description, specRows, compatibleCars, importantNotes, faqs })}
      </div>

      <div className="space-y-2.5 md:hidden">
        {sections.map((section) => {
          const isOpen = activeSection === section.id;

          return (
            <section key={section.id} className="overflow-hidden rounded-xl border border-border bg-white">
              <button
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right text-sm font-extrabold text-text-strong"
                onClick={() => setActiveSection((current) => (current === section.id ? current : section.id))}
                type="button"
              >
                <span>{section.title}</span>
                <ChevronIcon className={cn("h-4 w-4 text-text-muted transition", isOpen ? "rotate-180" : "")} />
              </button>
              {isOpen ? (
                <div className="border-t border-border px-4 py-4">
                  {renderSectionBody(section.id, { description, specRows, compatibleCars, importantNotes, faqs })}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function renderSectionBody(
  id: SectionId,
  data: ProductDetailSectionsProps,
) {
  switch (id) {
    case "description":
      return data.description ? (
        <div className="space-y-4">
          <SectionText text={data.description} />
        </div>
      ) : null;

    case "specs":
      return <SpecsTable rows={data.specRows} />;

    case "cars":
      return <CompatibleCarsList items={data.compatibleCars} />;

    case "notes":
      return (
        <ul className="space-y-3 text-sm leading-7 text-text-muted">
          {data.importantNotes.map((note) => (
            <li key={note} className="flex gap-3">
              <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-accent shadow-[0_0_0_6px_rgba(245,158,11,0.12)]" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      );

    case "faq":
      return (
        <div className="space-y-3">
          {data.faqs.map((faq) => (
            <details key={faq.question} className="rounded-xl border border-border bg-white px-4 py-4">
              <summary className="cursor-pointer list-none text-sm font-extrabold text-text-strong">{faq.question}</summary>
              <p className="mt-3 text-sm leading-7 text-[#475467]">{faq.answer}</p>
            </details>
          ))}
        </div>
      );

    default:
      return null;
  }
}

function SectionText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-sm leading-8 text-text-muted">
      {blocks.map((block) => (
        <p key={block} className="whitespace-pre-line">
          {block}
        </p>
      ))}
    </div>
  );
}

function SpecsTable({ rows }: { rows: ProductSpecRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className={cn(
            "grid gap-2 px-4 py-3 text-sm sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:px-5",
            index % 2 === 0 ? "bg-white" : "bg-surface-secondary",
          )}
        >
          <span className="font-bold text-text-muted">{row.label}</span>
          <span className="min-w-0 break-words font-semibold text-text-strong">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function CompatibleCarsList({ items }: { items: ProductCompatibilityItem[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const filteredItems = useMemo(() => {
    const needle = query.trim();
    if (!needle) return items;
    return items.filter((item) => `${item.title} ${item.subtitle.join(" ")} ${item.note ?? ""}`.includes(needle));
  }, [items, query]);
  const visibleItems = expanded ? filteredItems : filteredItems.slice(0, 6);

  return (
    <div className="space-y-4">
      {items.length > 6 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="min-w-0 flex-1 text-xs font-bold text-text-muted">
            جستجو در خودروهای سازگار
            <input
              className="input-zen mt-2"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="مثلاً ام جی ۳ یا موتور 1.5"
              type="search"
              value={query}
            />
          </label>
          <span className="text-xs font-bold text-text-muted">
            {filteredItems.length.toLocaleString("fa-IR")} خودرو
          </span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            className="interactive-lift rounded-xl border border-border bg-white p-4"
            href={`/cars/${item.slug}`}
          >
            <p className="text-sm font-extrabold text-text-strong">{item.title}</p>
            {item.subtitle.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.subtitle.map((line) => (
                  <span key={line} className="chip-zen-muted bg-white px-3 py-1 text-[11px] font-bold text-text-muted">
                    {line}
                  </span>
                ))}
              </div>
            ) : null}
            {item.note ? <p className="mt-3 text-xs leading-6 text-[#475467]">{item.note}</p> : null}
          </Link>
        ))}
      </div>

      {filteredItems.length > 6 ? (
        <button
          className="btn-outline inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-text"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded ? "نمایش کمتر" : "نمایش بیشتر"}
        </button>
      ) : null}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
