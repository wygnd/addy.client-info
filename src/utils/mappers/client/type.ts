import { IClientType } from "../../../types";

export const formatClientType = (value: IClientType): string => {
  switch (value) {
    case "AGENCY":
      return "Агентство";

    case "SIMPLE":
      return "Компания";

    default:
      return "Неизвестно";
  }
};
