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
    <section>
      <div className="hidden border-b border-border md:block">
        <div className="flex flex-wrap items-center gap-6 overflow-x-auto pb-1 scrollbar-none">
          {sections.map((section) => (
            <button
              key={section.id}
              aria-selected={activeSection === section.id}
              className={cn(
                "min-h-11 border-b-2 py-2 text-sm font-extrabold transition",
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

      <div className="hidden pt-6 md:block">
        {renderSectionBody(activeSection, { description, specRows, compatibleCars, importantNotes, faqs })}
      </div>

      <div className="divide-y divide-border border-y border-border md:hidden">
        {sections.map((section) => {
          const isOpen = activeSection === section.id;

          return (
            <section key={section.id}>
              <button
                aria-expanded={isOpen}
                className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-right text-sm font-extrabold text-text-strong"
                onClick={() => setActiveSection((current) => (current === section.id ? current : section.id))}
                type="button"
              >
                <span>{section.title}</span>
                <ChevronIcon className={cn("h-4 w-4 text-text-muted transition", isOpen ? "rotate-180" : "")} />
              </button>
              {isOpen ? (
                <div className="pb-5">
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
              <span className="mt-2.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary-accent" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      );

    case "faq":
      return (
        <div className="divide-y divide-border border-y border-border">
          {data.faqs.map((faq) => (
            <details key={faq.question} className="py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-extrabold text-text-strong">{faq.question}</summary>
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
    <dl className="divide-y divide-border border-y border-border">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className="grid gap-2 py-3 text-sm sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center"
        >
          <dt className="font-bold text-text-muted">{row.label}</dt>
          <dd className="min-w-0 break-words font-semibold text-text-strong">{row.value}</dd>
        </div>
      ))}
    </dl>
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

      <div className="divide-y divide-border border-y border-border">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            className="group block py-4"
            href={`/cars/${item.slug}`}
          >
            <p className="text-sm font-extrabold text-text-strong transition group-hover:text-primary-accent-strong">{item.title}</p>
            {item.subtitle.length ? (
              <p className="mt-1 text-xs font-bold leading-6 text-text-muted">{item.subtitle.join(" · ")}</p>
            ) : null}
            {item.note ? <p className="mt-1 text-xs leading-6 text-[#475467]">{item.note}</p> : null}
          </Link>
        ))}
      </div>

      {filteredItems.length > 6 ? (
        <button
          className="inline-flex min-h-11 items-center text-sm font-extrabold text-primary-accent-strong transition hover:text-primary-accent"
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
