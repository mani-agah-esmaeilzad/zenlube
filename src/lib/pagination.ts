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
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.min(Math.floor(rawPageSize), maxPageSize)
      : defaultPageSize;

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
