export type TFieldConfig<T = unknown> = {
  [K in keyof T]?: {
    label: string;
    format?: (val: NonNullable<T[K]>) => string;
  };
};

export interface IMapperOptions {
  emptyText?: string;
}
