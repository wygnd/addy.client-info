import { IMapperOptions, TFieldConfig } from "../../types";
import { DescriptionListItem } from "@bitrix24/b24ui-nuxt";

export const createDescriptionListMapper = <T extends object>(
  config: TFieldConfig<T>,
  options: IMapperOptions = {},
) => {
  const { emptyText = "Не заполнено" } = options;

  return (entry: T): DescriptionListItem[] => {
    const items: DescriptionListItem[] = [];
    for (const key of Object.keys(entry) as (keyof T)[]) {
      const fieldConfig = config[key];

      if (!fieldConfig) {
        continue;
      }

      const value = entry[key];

      if (value === null || value === undefined) {
        items.push({
          label: fieldConfig.label || (key as string),
          description: emptyText,
        });
        continue;
      }

      if (typeof value === "object" || Array.isArray(value)) {
        continue;
      }

      items.push({
        label: fieldConfig.label || (key as string),
        description: (fieldConfig.format
          ? fieldConfig.format(value as NonNullable<T[keyof T]>)
          : value) as string,
      });
    }

    return items;
  };
};
