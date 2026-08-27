"use client";

import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { useEffect, useState } from "react";
import { WishlistButton } from "@/components/product/wishlist-button";
import { PriceBlock } from "@/components/ui/price-block";
import type {
  NotebookCompatibleProduct,
  NotebookPage,
  NotebookProductPanel,
} from "@/lib/car-notebook";
import { cn } from "@/lib/utils";

export type { NotebookPage, NotebookProductPanel } from "@/lib/car-notebook";

export type NotebookCover = {
  title: string;
  subtitle?: string;
  meta: Array<{ label: string; value: string }>;
};

type CarNotebookProps = {
  pages: NotebookPage[];
  productPanels?: NotebookProductPanel[];
};

export function CarNotebook({ pages, productPanels = [] }: CarNotebookProps) {
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
  const activePanel = productPanels.find((panel) => panel.pageId === activePage.id);
  const pageCount = pages.length;
  const sheetSurfaceClass =
    "rounded-[30px] border border-slate-200 bg-white p-5 text-slate-700 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.3)] sm:p-6 lg:p-8";

  const handleSelect = (index: number) => {
    if (index === activeNavIndex || isFlipping) {
      return;
    }
    setDirection(index > currentIndex ? "forward" : "backward");
    setPendingIndex(index);
    setIsFlipping(true);
  };

  return (
    <div className="relative space-y-4 rounded-[34px] border border-[#E5E7EB] bg-white p-4 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.28)] sm:p-5 xl:p-6">
      <div className="rounded-[28px] border border-[#E5E7EB] bg-[#F8FAFC] p-2 sm:p-3">
        <div
          role="tablist"
          aria-label="بخش‌های دفترچه خودرو"
          className="scrollbar-none flex gap-2 overflow-x-auto pb-1"
        >
          {pages.map((page, index) => {
            const isActive = index === activeNavIndex;
            return (
              <button
                type="button"
                key={page.id}
                onClick={() => handleSelect(index)}
                role="tab"
                id={`notebook-tab-${page.id}`}
                aria-controls={`notebook-panel-${page.id}`}
                aria-selected={isActive}
                className={cn(
                  "min-h-[64px] min-w-[148px] shrink-0 rounded-[20px] border px-4 py-3 text-right transition sm:min-w-[168px]",
                  isActive
                    ? "border-[#F5C56B] bg-[#FFF8E8] text-[#D97706] shadow-[0_18px_34px_-28px_rgba(245,158,11,0.65)]"
                    : "border-[#E5E7EB] bg-white text-[#667085] hover:border-[#F5C56B]/60 hover:text-[#111827]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={cn("block text-[10px] font-bold tracking-[0.22em]", isActive ? "text-[#D97706]/75" : "text-[#98A2B3]")}>
                      بخش {index + 1}
                    </span>
                    <span className="mt-1 block text-sm font-extrabold leading-6">
                      {page.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                      isActive
                        ? "border-[#F5C56B] bg-white/80 text-[#D97706]"
                        : "border-[#E5E7EB] text-[#98A2B3]",
                    )}
                  >
                    {page.tag ?? "دفترچه"}
                  </span>
                </div>
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
            panelId={`notebook-panel-${activePage.id}`}
            tabId={`notebook-tab-${activePage.id}`}
            className={cn("min-h-[360px] sm:min-h-[430px] xl:min-h-[470px]", sheetSurfaceClass)}
          />
        </div>

        {isFlipping && nextPage ? (
          <div className="pointer-events-none absolute inset-0">
            <NotebookSheet
              page={activePage}
              index={currentIndex}
              pageCount={pageCount}
              panelId={`notebook-panel-${activePage.id}`}
              tabId={`notebook-tab-${activePage.id}`}
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
              panelId={`notebook-panel-${nextPage.id}`}
              tabId={`notebook-tab-${nextPage.id}`}
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

      {activePanel ? <NotebookProductsPanel page={activePage} panel={activePanel} /> : null}
    </div>
  );
}

type NotebookSheetProps = {
  page: NotebookPage;
  index: number | null;
  pageCount: number;
  panelId: string;
  tabId: string;
  className?: string;
};

function NotebookSheet({ page, index, pageCount, panelId, tabId, className }: NotebookSheetProps) {
  const paragraphs = page.description
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const richBlocks = groupNotebookBlocks(paragraphs);

  return (
    <article
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={cn("relative flex h-full flex-col overflow-hidden notebook-sheet", className)}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-b from-[#F5C56B]/75 via-transparent to-[#F5C56B]/75 opacity-60" />
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>
          صفحه {index !== null ? index + 1 : "?"} از {pageCount}
        </span>
        {page.tag && (
          <span className="rounded-full border border-[#E5E7EB] bg-[#FFF8E8] px-3 py-1 text-[11px] font-bold text-[#D97706]">
            {page.tag}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[1.55rem] font-black leading-9 text-slate-900 sm:text-3xl">{page.title}</h3>
      {page.kicker && <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">{page.kicker}</p>}
      {page.highlights?.length ? (
        <div className="mt-5 grid gap-3 min-[390px]:grid-cols-2 xl:grid-cols-4">
          {page.highlights.map((highlight) => (
            <div
              key={`${page.id}-${highlight.label}`}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4"
            >
              <span className="text-[11px] font-bold text-slate-400">{highlight.label}</span>
              <p className="mt-2 text-sm font-extrabold leading-7 text-slate-900">{highlight.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex-1 space-y-4 text-sm leading-7 text-slate-700">
        {richBlocks.length ? (
          richBlocks.map((block, idx) =>
            block.type === "list" ? (
              <ul
                key={`${page.id}-list-${idx}`}
                className="grid gap-2 rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 sm:p-5"
              >
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                    <span className="min-w-0 leading-7 text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            ) : block.type === "heading" ? (
              <h4 key={`${page.id}-heading-${idx}`} className="pt-2 text-base font-extrabold text-slate-900">
                {block.text}
              </h4>
            ) : (
              <p key={`${page.id}-paragraph-${idx}`} className="whitespace-pre-line">
                {block.text}
              </p>
            ),
          )
        ) : (
          <p className="text-slate-400">اطلاعاتی برای این صفحه ثبت نشده است.</p>
        )}
      </div>
      {page.sourceUrl ? (
        <div className="mt-6 border-t border-dashed border-[#E5E7EB] pt-4">
          <a
            href={page.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold text-[#667085] transition hover:border-[#F5C56B] hover:text-[#D97706]"
          >
            مشاهده منبع این بخش
          </a>
        </div>
      ) : null}
    </article>
  );
}

function NotebookProductsPanel({ page, panel }: { page: NotebookPage; panel: NotebookProductPanel }) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#E5E7EB] bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)]">
      <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-4 py-4 sm:px-5 lg:flex-row lg:items-start lg:justify-between lg:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-[#FDE7B0] bg-[#FFF8E8] px-3 py-1 text-[11px] font-extrabold text-[#D97706]">
              محصولات سازگار این بخش
            </span>
            {page.tag ? (
              <span className="inline-flex rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[11px] font-bold text-[#667085]">
                {page.tag}
              </span>
            ) : null}
          </div>
          <h4 className="mt-3 text-lg font-black leading-8 text-[#111827] sm:text-xl">
            پیشنهادهای سازگار برای {page.title}
          </h4>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#667085]">
            {panel.totalProducts > 0
              ? `${panel.totalProducts.toLocaleString("fa-IR")} محصول از همین دسته برای این خودرو در فروشگاه متصل شده است.`
              : panel.emptyDescription}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={panel.browseHref} className="btn-outline w-full sm:w-auto">
            مشاهده دسته‌ی {panel.categoryName}
          </Link>
          {panel.browseHref !== panel.allProductsHref ? (
            <Link href={panel.allProductsHref} className="btn-primary w-full sm:w-auto">
              همه محصولات سازگار
            </Link>
          ) : null}
        </div>
      </div>

      {panel.products.length > 0 ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3 xl:p-6">
          {panel.products.map((product) => (
            <NotebookCompatibleProductCard key={`${panel.pageId}-${product.id}`} product={product} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 sm:px-5 sm:py-7 lg:px-6">
          <div className="rounded-[26px] border border-dashed border-[#E5E7EB] bg-white p-5 text-center sm:p-6">
            <h5 className="text-base font-extrabold text-[#111827]">{panel.emptyTitle}</h5>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-[#667085]">{panel.emptyDescription}</p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <Link href={panel.allProductsHref} className="btn-primary w-full sm:w-auto">
                مشاهده همه محصولات این خودرو
              </Link>
              {panel.hasCatalogCategory ? (
                <Link href={panel.browseHref} className="btn-outline w-full sm:w-auto">
                  باز کردن دسته {panel.categoryName}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function NotebookCompatibleProductCard({ product }: { product: NotebookCompatibleProduct }) {
  const isAvailable = product.stock > 0;
  const specs = [
    product.viscosity,
    product.packagingSizeLit ? `${product.packagingSizeLit.toLocaleString("fa-IR")} لیتر` : null,
    product.oilType,
  ].filter(Boolean);

  return (
    <article className="flex h-full min-w-0 flex-col rounded-[26px] border border-[#E7E8EE] bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.name}
          className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-[#EEF2F6] bg-[#F8FAFC] sm:size-28"
        >
          {product.imageUrl ? (
            <Image
              alt={`تصویر ${product.name}`}
              src={product.imageUrl}
              fill
              sizes="(max-width:640px) 96px, 112px"
              className="object-contain p-3"
            />
          ) : (
            <span className="text-xs font-bold text-[#98A2B3]">بدون تصویر</span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-[#D97706]">{product.brandName}</p>
              <Link
                href={`/products/${product.slug}`}
                className="mt-1 block line-clamp-2 text-sm font-extrabold leading-7 text-[#111827] transition hover:text-[#D97706]"
              >
                {product.name}
              </Link>
            </div>
            <WishlistButton compact productId={product.id} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#667085]">
              {product.categoryName}
            </span>
            {product.isBestseller ? (
              <span className="rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-bold text-white">پرفروش</span>
            ) : null}
            {product.isFeatured ? (
              <span className="rounded-full bg-[#FFF8E8] px-2.5 py-1 text-[10px] font-bold text-[#D97706]">ویژه</span>
            ) : null}
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                isAvailable ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]",
              )}
            >
              {isAvailable ? "موجود" : "ناموجود"}
            </span>
          </div>

          <p className="mt-3 text-xs leading-6 text-[#667085]">
            {specs.length ? specs.join(" • ") : "مشخصات تکمیلی این کالا در صفحه محصول قابل مشاهده است."}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-[#EEF2F6] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <PriceBlock amount={product.price} align="start" size="sm" />
          {product.averageRating != null && product.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFAEB] px-2.5 py-1 text-[11px] font-bold text-[#B54708]">
              <StarIcon className="h-3.5 w-3.5 fill-current" />
              {product.averageRating.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
            </span>
          ) : null}
        </div>

        <div className="mt-3">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-[14px] border border-[#E5E7EB] px-4 text-[13px] font-bold text-[#111827] transition hover:border-[#F5C56B] hover:text-[#D97706]"
          >
            مشاهده جزئیات
          </Link>
        </div>
      </div>
    </article>
  );
}

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="m12 2 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9l6.7-.9L12 2Z" />
    </svg>
  );
}

type NotebookBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

function groupNotebookBlocks(lines: string[]): NotebookBlock[] {
  const blocks: NotebookBlock[] = [];
  let bufferedList: string[] = [];

  const flushList = () => {
    if (!bufferedList.length) return;
    blocks.push({ type: "list", items: bufferedList });
    bufferedList = [];
  };

  lines.forEach((line) => {
    if (line.startsWith("- ")) {
      bufferedList.push(line.replace(/^-+\s*/, "").trim());
      return;
    }

    flushList();

    if (/^[^:]{2,60}:$/.test(line)) {
      blocks.push({ type: "heading", text: line.slice(0, -1).trim() });
      return;
    }

    blocks.push({ type: "paragraph", text: line });
  });

  flushList();

  return blocks;
}
