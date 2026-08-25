import { TBitrixPauseDepositType, TDepositType } from "../../../types";

export const formatDepositType = (value: TDepositType): string => {
  switch (value) {
    case "ACCOUNT_DEPOSIT":
      return "Пополнение кабинета";

    case "AD_ACCOUNT_DEPOSIT":
      return "Пополнение рекламной системы";

    case "ACCRUE_REWARD":
      return "Начисление вознаграждения";

    case "TRANSPORT":
      return "Перечисление денег";

    case "WITHDRAWAL":
      return "Вывод средств";

    default:
      return "Не определено";
  }
};

export const formatPauseDepositType = (
  value: TBitrixPauseDepositType,
): string => {
  switch (value) {
    case "days_since_ad_account_funded":
      return "Клиент не пополнял рекламные системы в течение 14 дней";

    case "days_since_addy_funded":
      return "Клиент не пополнял аккаунт в течение 14 дней";

    default:
      return "Не определено";
  }
};
