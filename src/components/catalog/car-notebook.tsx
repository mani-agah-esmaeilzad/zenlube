"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NotebookHighlight = {
  label: string;
  value: string;
};

export type NotebookPage = {
  id: string;
  title: string;
  description: string;
  highlights?: NotebookHighlight[];
  kicker?: string;
  tag?: string;
};

export type NotebookCover = {
  title: string;
  subtitle?: string;
  meta: NotebookHighlight[];
};

type CarNotebookProps = {
  cover: NotebookCover;
  pages: NotebookPage[];
};

export function CarNotebook({ cover, pages }: CarNotebookProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const hasPages = pages.length > 0;

  useEffect(() => {
    if (!isFlipping || pendingIndex === null) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex(pendingIndex);
      setPendingIndex(null);
      setIsFlipping(false);
    }, 650);

    return () => {
      clearTimeout(timer);
    };
  }, [isFlipping, pendingIndex]);

  if (!hasPages) {
    return null;
  }

  const activeNavIndex = pendingIndex ?? currentIndex;
  const activePage = pages[currentIndex] ?? pages[0];
  const nextPage = pendingIndex != null ? pages[pendingIndex] : null;
  const pageCount = pages.length;
  const sheetSurfaceClass =
    "rounded-[34px] border border-slate-200 bg-white p-8 text-slate-700 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.3)]";

  const handleSelect = (index: number) => {
    if (index === activeNavIndex || isFlipping) {
      return;
    }
    setDirection(index > currentIndex ? "forward" : "backward");
    setPendingIndex(index);
    setIsFlipping(true);
  };

  return (
    <div className="relative grid gap-6 rounded-[40px] border border-slate-200 bg-white p-6 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.15)] xl:grid-cols-[220px,1fr]">
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-white p-5 text-center text-slate-600">
          <div className="absolute -right-6 top-0 h-full w-16 rounded-full bg-sky-200/50 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Oilbar</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{cover.title}</h3>
          {cover.subtitle && (
            <p className="mt-2 text-xs leading-6 text-slate-500">{cover.subtitle}</p>
          )}
          <div className="mt-4 space-y-2 text-xs text-slate-500">
            {cover.meta.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-1">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-3">
          {pages.map((page, index) => {
            const isActive = index === activeNavIndex;
            return (
              <button
                type="button"
                key={page.id}
                onClick={() => handleSelect(index)}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-2 text-left transition",
                  isActive
                    ? "bg-sky-50 text-slate-900 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.3)]"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                    صفحه {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{page.title}</span>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px]",
                    isActive ? "border-sky-300 text-sky-600" : "border-slate-200 text-slate-400",
                  )}
                >
                  {page.tag ?? "دفترچه"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative notebook-perspective">
        <div
          className={cn(
            "relative transition-opacity duration-150",
            isFlipping ? "opacity-0" : "opacity-100",
          )}
        >
          <NotebookSheet
            page={activePage}
            index={currentIndex}
            pageCount={pageCount}
            className={cn("min-h-[360px]", sheetSurfaceClass)}
          />
        </div>

        {isFlipping && nextPage ? (
          <div className="pointer-events-none absolute inset-0">
            <NotebookSheet
              page={activePage}
              index={currentIndex}
              pageCount={pageCount}
              className={cn(
                "absolute inset-0 notebook-page-layer",
                sheetSurfaceClass,
                direction === "forward"
                  ? "notebook-flip-out-forward"
                  : "notebook-flip-out-backward",
              )}
            />
            <NotebookSheet
              page={nextPage}
              index={pendingIndex}
              pageCount={pageCount}
              className={cn(
                "absolute inset-0 notebook-page-layer",
                sheetSurfaceClass,
                direction === "forward"
                  ? "notebook-flip-in-forward"
                  : "notebook-flip-in-backward",
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

type NotebookSheetProps = {
  page: NotebookPage;
  index: number | null;
  pageCount: number;
  className?: string;
};

function NotebookSheet({ page, index, pageCount, className }: NotebookSheetProps) {
  const paragraphs = page.description
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className={cn("relative flex h-full flex-col notebook-sheet", className)}>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-b from-sky-200/80 via-transparent to-sky-200/80 opacity-70" />
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          صفحه {index !== null ? index + 1 : "?"} از {pageCount}
        </span>
        {page.tag && (
          <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500">
            {page.tag}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-3xl font-semibold text-slate-900">{page.title}</h3>
      {page.kicker && <p className="mt-2 text-sm text-slate-500">{page.kicker}</p>}
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
        {paragraphs.length ? (
          paragraphs.map((paragraph, idx) => (
            <p key={`${page.id}-paragraph-${idx}`} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-slate-400">اطلاعاتی برای این صفحه ثبت نشده است.</p>
        )}
      </div>
      {page.highlights?.length ? (
        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          {page.highlights.map((highlight) => (
            <div
              key={`${page.id}-${highlight.label}`}
              className="flex items-center justify-between"
            >
              <span className="text-slate-400">{highlight.label}</span>
              <span className="text-slate-900">{highlight.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
