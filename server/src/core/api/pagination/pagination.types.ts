export interface OffsetPagination {
  top: number;
  skip: number;
  count?: number;
  hasMore: boolean;
}

export interface CursorPagination {
  top: number;
  nextLink?: string;
  hasMore: boolean;
}

export type PaginationParams = OffsetPagination | CursorPagination;

export interface PaginationInput {
  top?: number;
  skip?: number;
  skiptoken?: string;
  count?: boolean;
}
