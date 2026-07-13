import { TDepositMethodType } from "../../../types";

export const formatDepositMethodType = (value: TDepositMethodType): string => {
  switch (value) {
    case "INVOICE":
      return "Выставленный счет";
    case "TRANSFER":
      return "Перевод средств";
    case "QR":
      return "QR-код";
    default:
      return "Не определено";
  }
};
