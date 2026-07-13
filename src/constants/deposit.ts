import { IDeposit, TFieldConfig } from "../types";
import {
  formatAmount,
  formatDate,
  formatDepositType,
  formatDepositMethodType,
  formatDepositStatus,
} from "../utils/mappers";

export const DEPOSIT_CONFIG: TFieldConfig<IDeposit> = {
  id: { label: "ID" },
  contract: { label: "ID Договора" },
  amount: { label: "Сумма", format: formatAmount },
  created_at: { label: "Дата создания", format: formatDate },
  amount_without_commission: {
    label: "Сумма без комиссии",
    format: formatAmount,
  },
  payment_time: { label: "Дата платежа", format: formatDate },
  type: { label: "Тип", format: formatDepositType },
  status: { label: "Статус", format: formatDepositStatus },
  method_type: { label: "Тип метод", format: formatDepositMethodType },
};
