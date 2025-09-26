/**
 * Pagination utilities for API endpoints
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor?: string;
  };
}

/**
 * Parse pagination parameters from request
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 1000); // Max 1000 items
  const cursor = searchParams.get('cursor') || undefined;

  const result: PaginationParams = {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
  };

  if (cursor) {
    result.cursor = cursor;
  }

  return result;
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationResult<unknown>['pagination'] {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationResult<T>['pagination'],
): PaginationResult<T> {
  return {
    data,
    pagination,
  };
}

/**
 * Create cursor-based paginated response
 */
export function createCursorPaginatedResponse<T>(
  data: T[],
  limit: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _nextCursor?: string,
): CursorPaginationResult<T> {
  return {
    data,
    pagination: {
      limit,
      hasNext: data.length === limit + 1,
      nextCursor: data.length === limit + 1 ? (data[data.length - 1] as any)?.id : undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: PaginationParams): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (params.page && (params.page < 1 || !Number.isInteger(params.page))) {
    errors.push('Page must be a positive integer');
  }

  if (
    params.limit &&
    (params.limit < 1 || params.limit > 1000 || !Number.isInteger(params.limit))
  ) {
    errors.push('Limit must be between 1 and 1000');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
