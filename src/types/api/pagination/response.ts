export interface IApiBitrixPaginationResponse<T = unknown> {
  result: T;
  currentPage: number;
  totalRows: number;
  totalPages: number;
}
