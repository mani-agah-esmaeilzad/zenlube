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

  const handleSelect = (index: number) => {
    if (index === activeNavIndex || isFlipping) {
      return;
    }
    setDirection(index > currentIndex ? "forward" : "backward");
    setPendingIndex(index);
    setIsFlipping(true);
  };

  return (
    <div className="relative grid gap-6 rounded-[40px] border border-white/10 bg-black/30 p-6 shadow-[0_30px_60px_-45px_rgba(113,63,180,0.6)] xl:grid-cols-[220px,1fr]">
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/30 via-black/70 to-purple-950/40 p-5 text-center text-white/80">
          <div className="absolute -right-6 top-0 h-full w-16 rounded-full bg-purple-500/10 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.35em] text-purple-200/60">Oilbar</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{cover.title}</h3>
          {cover.subtitle && (
            <p className="mt-2 text-xs leading-6 text-white/60">{cover.subtitle}</p>
          )}
          <div className="mt-4 space-y-2 text-xs text-white/60">
            {cover.meta.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-full border border-white/10 bg-black/30 px-3 py-1">
                <span className="text-white/40">{item.label}</span>
                <span className="text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-black/40 p-3">
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
                    ? "bg-purple-500/30 text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.5)]"
                    : "text-white/60 hover:text-white hover:bg-white/10",
                )}
              >
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.3em]">
                    صفحه {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{page.title}</span>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px]",
                    isActive ? "border-purple-300/70 text-purple-100" : "border-white/20",
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
            "relative rounded-[34px] border border-white/10 bg-gradient-to-br from-white/12 via-white/5 to-white/10 p-8 text-white transition-opacity duration-150",
            isFlipping ? "opacity-0" : "opacity-100",
          )}
        >
          <NotebookSheet
            page={activePage}
            index={currentIndex}
            pageCount={pageCount}
            className="min-h-[360px]"
          />
        </div>

        {isFlipping && nextPage ? (
          <div className="pointer-events-none absolute inset-0">
            <NotebookSheet
              page={activePage}
              index={currentIndex}
              pageCount={pageCount}
              className={cn(
                "absolute inset-0 rounded-[34px] border border-white/10 bg-gradient-to-br from-white/12 via-white/5 to-white/10 p-8 text-white notebook-page-layer",
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
                "absolute inset-0 rounded-[34px] border border-white/10 bg-gradient-to-br from-white/12 via-white/5 to-white/10 p-8 text-white notebook-page-layer",
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
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-b from-purple-500/35 via-white/20 to-purple-500/25 opacity-70" />
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>
          صفحه {index !== null ? index + 1 : "?"} از {pageCount}
        </span>
        {page.tag && (
          <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/70">
            {page.tag}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-3xl font-semibold text-white">{page.title}</h3>
      {page.kicker && <p className="mt-2 text-sm text-white/60">{page.kicker}</p>}
      <div className="mt-6 space-y-4 text-sm leading-7 text-white/80">
        {paragraphs.length ? (
          paragraphs.map((paragraph, idx) => (
            <p key={`${page.id}-paragraph-${idx}`} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-white/50">اطلاعاتی برای این صفحه ثبت نشده است.</p>
        )}
      </div>
      {page.highlights?.length ? (
        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 text-xs text-white/70">
          {page.highlights.map((highlight) => (
            <div
              key={`${page.id}-${highlight.label}`}
              className="flex items-center justify-between"
            >
              <span className="text-white/50">{highlight.label}</span>
              <span className="text-white">{highlight.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
