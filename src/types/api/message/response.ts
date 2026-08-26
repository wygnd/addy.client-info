import { IAddyMessage } from "../../chat";
import { IAddyResponseLinks, IAddyResponseMeta } from "../addy/response.ts";

export interface IAddyMessageResponse {
  data: IAddyMessage[];
  links: IAddyResponseLinks;
  meta: IAddyResponseMeta;
}
