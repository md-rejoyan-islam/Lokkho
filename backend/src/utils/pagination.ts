// Parses page/limit query params into safe numbers + skip offset.
export function parsePagination(
  query: any,
  defaultLimit = 10,
  maxLimit = 100
): { pageNum: number; limitNum: number; skip: number } {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
}

// Standard pagination envelope.
export function paginated<T>(items: T[], total: number, pageNum: number, limitNum: number) {
  return {
    count: items.length,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
}
