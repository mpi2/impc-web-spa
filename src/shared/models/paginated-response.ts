
export type PaginatedResponse<T> = {
  content: Array<T>;
  totalPages: number;
  totalElements: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}