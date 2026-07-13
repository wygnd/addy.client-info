import { TDepositStatus } from "../../../types";

export const formatDepositStatus = (value: TDepositStatus): string => {
  switch (value) {
    case "COMPLETED":
      return "Завершено";

    case "FROZEN":
      return "Средства заморожены";

    case "PENDING":
      return "Ожидание оплаты";

    case "FAIL":
      return "Ошибка";

    default:
      return value;
  }
};
