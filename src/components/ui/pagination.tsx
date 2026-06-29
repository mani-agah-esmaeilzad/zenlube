import Link from "next/link";
import type { PageInfo } from "@/lib/pagination";

type PaginationProps = {
  pageInfo: PageInfo;
  pathname: string;
  searchParams?: Record<string, string | string[] | undefined>;
  className?: string;
};

export function Pagination({ pageInfo, pathname, searchParams = {}, className = "" }: PaginationProps) {
  if (pageInfo.totalPages <= 1) return null;

  const pages = getVisiblePages(pageInfo.page, pageInfo.totalPages);
  const hrefFor = (page: number) => ({
    pathname,
    query: normalizeQuery({ ...searchParams, page: String(page), pageSize: String(pageInfo.pageSize) }),
  });

  return (
    <nav className={`mt-8 flex flex-wrap items-center justify-center gap-2 text-sm ${className}`} aria-label="صفحه‌بندی">
      <Link
        className={pageInfo.hasPreviousPage ? "btn-outline" : "pointer-events-none opacity-40 btn-outline"}
        href={hrefFor(Math.max(1, pageInfo.page - 1))}
        aria-disabled={!pageInfo.hasPreviousPage}
      >
        قبلی
      </Link>

      {pages.map((page, index) =>
        page === "gap" ? (
          <span key={`gap-${index}`} className="px-2 font-bold text-[#9CA3AF]">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={hrefFor(page)}
            aria-current={page === pageInfo.page ? "page" : undefined}
            className={
              page === pageInfo.page
                ? "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-[#111827] px-3 font-black text-white"
                : "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3 font-bold text-[#374151] transition hover:border-red-200 hover:text-[#DC2626]"
            }
          >
            {page.toLocaleString("fa-IR")}
          </Link>
        ),
      )}

      <Link
        className={pageInfo.hasNextPage ? "btn-outline" : "pointer-events-none opacity-40 btn-outline"}
        href={hrefFor(Math.min(pageInfo.totalPages, pageInfo.page + 1))}
        aria-disabled={!pageInfo.hasNextPage}
      >
        بعدی
      </Link>
    </nav>
  );
}

function normalizeQuery(params: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === "string" && value.length > 0;
    }),
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "gap"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("gap");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("gap");
  pages.push(totalPages);

  return pages;
}
