export type PageInfo = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export function getPaginationParams(
  params: Record<string, string | string[] | undefined>,
  options: { defaultPageSize?: number; maxPageSize?: number } = {},
) {
  const defaultPageSize = options.defaultPageSize ?? 12;
  const maxPageSize = options.maxPageSize ?? 60;
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const rawPageSize = typeof params.pageSize === "string" ? Number(params.pageSize) : defaultPageSize;
  const normalizedPageSize = Math.floor(rawPageSize);
  const pageSize =
    Number.isFinite(normalizedPageSize) && normalizedPageSize >= 1
      ? Math.min(normalizedPageSize, maxPageSize)
      : defaultPageSize;

  // Keep database offsets in a signed 32-bit range. Malformed URLs must not
  // send zero-sized pages, negative offsets or unbounded offsets to Prisma.
  const normalizedPage = Math.floor(rawPage);
  const maxPage = Math.floor(2_147_483_647 / pageSize) + 1;
  const page = Number.isSafeInteger(normalizedPage) && normalizedPage >= 1 && normalizedPage <= maxPage
    ? normalizedPage
    : 1;

  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function createPageInfo(page: number, pageSize: number, total: number): PageInfo {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);

  return {
    page: normalizedPage,
    pageSize,
    total,
    totalPages,
    hasNextPage: normalizedPage < totalPages,
    hasPreviousPage: normalizedPage > 1,
  };
}
