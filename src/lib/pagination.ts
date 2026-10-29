export const CATALOG_PAGE_SIZE = 10;

export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export function paginate<T>(items: T[], requestedPage = 1, pageSize = CATALOG_PAGE_SIZE): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount: items.length,
    totalPages,
  };
}
