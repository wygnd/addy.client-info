import { TBitrixPauseDepositType, TDepositType } from "../../../types";

export const formatDepositType = (value: TDepositType): string => {
  switch (value) {
    case "ACCOUNT_DEPOSIT":
      return "Пополнение аккаунта";

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
