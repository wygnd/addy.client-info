import { IAddyMessage } from "../../chat";

interface IAddyMessageResponseMeta {
  current_page: 1;
  current_page_url: string;
  from: number;
  path: string;
  per_page: string;
  to: number;
}

interface IAddyMessageResponseLinks {
  first: string;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface IAddyMessageResponse {
  data: IAddyMessage[];
  links: IAddyMessageResponseLinks;
  meta: IAddyMessageResponseMeta;
}
