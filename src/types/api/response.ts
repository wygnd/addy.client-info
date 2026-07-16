export interface IApiAddyResponse<T = unknown> {
  message: string;
  resource: T;
}
