import { IClient, TFieldConfig } from "../types";
import { formatClientType, formatDate } from "../utils/mappers";

export const CLIENT_CONFIG: TFieldConfig<IClient> = {
  id: { label: "ID" },
  name: { label: "Имя" },
  lastname: { label: "Фамилия" },
  reserve_phone: { label: "Резервный номер телефона" },
  registration_source: { label: "Источник регистрации" },
  contact_email: { label: "Контактная почта" },
  email: { label: "Почта регистрации" },
  accounts: { label: "Аккаунты" },
  childs: { label: "Дочерние клиенты" },
  contracts: { label: "Договоры" },
  parent_id: { label: "ID родителя" },
  contract_deposit_at: {
    label: "Дата пополнения в сервис",
    format: formatDate,
  },
  ad_account_deposited_at: {
    label: "Дата пополнения в рекламную систему",
    format: formatDate,
  },
  last_activity_date: { label: "Последняя активность", format: formatDate },
  user_type: { label: "Тип клиента", format: formatClientType },
};
