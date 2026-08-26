export interface IAddyResponseMeta {
  current_page: 1;
  last_page: number;
  current_page_url: string;
  from: number;
  path: string;
  per_page: string;
  to: number;
}

export interface IAddyResponseLinks {
  first: string;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface IAddyListResponse<T = unknown> {
  data: T;
  links: IAddyResponseLinks;
  meta: IAddyResponseMeta;
}
