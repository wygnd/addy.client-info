export interface IApiResponse<T = unknown> {
  message: string;
  resource: T;
}
