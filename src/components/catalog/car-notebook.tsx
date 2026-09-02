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
    "bg-white py-5 text-slate-700 sm:py-6 lg:py-8";

  const handleSelect = (index: number) => {
    if (index === activeNavIndex || isFlipping) {
      return;
    }
    setDirection(index > currentIndex ? "forward" : "backward");
    setPendingIndex(index);
    setIsFlipping(true);
  };

  return (
    <div className="relative space-y-5 bg-white">
      <div className="border-b border-[#E5E7EB]">
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
                  "min-h-12 min-w-[136px] shrink-0 border-b-2 px-3 py-2 text-right transition sm:min-w-[156px]",
                  isActive
                    ? "border-[#D97706] text-[#D97706]"
                    : "border-transparent text-[#667085] hover:border-[#F5C56B]/60 hover:text-[#111827]",
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
                      "text-[10px] font-bold",
                      isActive
                        ? "text-[#D97706]"
                        : "text-[#98A2B3]",
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
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>
          صفحه {index !== null ? index + 1 : "?"} از {pageCount}
        </span>
        {page.tag && (
          <span className="text-[11px] font-bold text-[#D97706]">
            {page.tag}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[1.55rem] font-black leading-9 text-slate-900 sm:text-3xl">{page.title}</h3>
      {page.kicker && <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">{page.kicker}</p>}
      {page.highlights?.length ? (
        <div className="mt-5 grid border-y border-[#E5E7EB] min-[390px]:grid-cols-2 xl:grid-cols-4">
          {page.highlights.map((highlight) => (
            <div
              key={`${page.id}-${highlight.label}`}
              className="border-b border-[#E5E7EB] px-1 py-4 min-[390px]:border-l min-[390px]:odd:border-l-0 xl:border-b-0 xl:first:border-r-0"
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
                className="grid gap-2 border-r-2 border-[#F59E0B] py-1 pr-4 sm:pr-5"
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
            className="text-link-zen inline-flex min-h-11 items-center gap-2 px-1 text-xs font-bold"
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
    <section className="border-t border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-4 py-4 sm:px-5 lg:flex-row lg:items-start lg:justify-between lg:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-[#D97706]">
              محصولات سازگار این بخش
            </span>
            {page.tag ? (
              <span className="text-[11px] font-bold text-[#667085]">
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
          <Link href={panel.browseHref} className="text-link-zen inline-flex min-h-11 items-center px-2 text-xs font-bold">
            مشاهده دسته‌ی {panel.categoryName}
          </Link>
          {panel.browseHref !== panel.allProductsHref ? (
            <Link href={panel.allProductsHref} className="text-link-zen inline-flex min-h-11 items-center px-2 text-xs font-extrabold">
              همه محصولات سازگار
            </Link>
          ) : null}
        </div>
      </div>

      {panel.products.length > 0 ? (
        <div className="grid gap-x-5 px-4 sm:grid-cols-2 sm:px-5 xl:grid-cols-3 xl:px-6">
          {panel.products.map((product) => (
            <NotebookCompatibleProductCard key={`${panel.pageId}-${product.id}`} product={product} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 sm:px-5 sm:py-7 lg:px-6">
          <div className="py-2 text-center">
            <h5 className="text-base font-extrabold text-[#111827]">{panel.emptyTitle}</h5>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-[#667085]">{panel.emptyDescription}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href={panel.allProductsHref} className="text-link-zen inline-flex min-h-11 items-center px-2 text-xs font-extrabold">
                مشاهده همه محصولات این خودرو
              </Link>
              {panel.hasCatalogCategory ? (
                <Link href={panel.browseHref} className="text-link-zen inline-flex min-h-11 items-center px-2 text-xs font-bold">
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
  const isAvailable = product.stock > 0 && product.price > 0;
  const specs = [
    product.viscosity,
    product.packagingSizeLit ? `${product.packagingSizeLit.toLocaleString("fa-IR")} لیتر` : null,
    product.oilType,
  ].filter(Boolean);

  return (
    <article className="flex h-full min-w-0 flex-col border-t border-[#E7E8EE] bg-white py-4">
      <div className="flex items-start gap-3">
        {product.imageUrl ? (
          <Link
            href={`/products/${product.slug}`}
            aria-label={product.name}
            className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F8FAFC] sm:size-28"
          >
            <Image
              alt={`تصویر ${product.name}`}
              src={product.imageUrl}
              fill
              sizes="(max-width:640px) 96px, 112px"
              className="object-contain p-3"
            />
          </Link>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-[#D97706]">{product.brandName}</p>
              <Link
                href={`/products/${product.slug}`}
                className="mt-1 inline-flex min-h-11 items-center text-sm font-extrabold leading-7 text-[#111827] transition hover:text-[#D97706]"
              >
                {product.name}
              </Link>
            </div>
            <WishlistButton compact productId={product.id} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-[10px] font-bold text-[#667085]">
              {product.categoryName}
            </span>
            {product.isBestseller ? (
              <span className="text-[10px] font-extrabold text-[#111827]">پرفروش</span>
            ) : product.isFeatured ? (
              <span className="text-[10px] font-extrabold text-[#D97706]">ویژه</span>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-bold",
                isAvailable ? "text-[#027A48]" : "text-[#B42318]",
              )}
            >
              <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", isAvailable ? "bg-[#027A48]" : "bg-[#B42318]")} />
              {isAvailable ? "موجود" : "ناموجود"}
            </span>
          </div>

          <p className="mt-3 text-xs leading-6 text-[#667085]">
            {specs.length ? specs.join(" • ") : "مشخصات تکمیلی این کالا در صفحه محصول قابل مشاهده است."}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-[#EEF2F6] pt-3">
        <div className="flex items-center justify-between gap-3">
          {product.averageRating != null && product.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B54708]">
              <StarIcon className="h-3.5 w-3.5 fill-current" />
              {product.averageRating.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
            </span>
          ) : null}
          {isAvailable ? <PriceBlock amount={product.price} align="end" size="sm" /> : null}
        </div>

        <Link href={`/products/${product.slug}`} className="text-link-zen mt-2 inline-flex min-h-11 items-center px-1 text-xs font-bold">
          مشاهده جزئیات
        </Link>
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
