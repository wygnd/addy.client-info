import { TDepositType } from "../../../types";

export const formatDepositType = (value: TDepositType): string => {
  switch (value) {
    case "ACCOUNT_DEPOSIT":
      return "Пополнение аккаунта";

    default:
      return "Не определено";
  }
};
