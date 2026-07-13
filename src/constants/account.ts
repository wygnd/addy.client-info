import { IAccount, IAccountPlatformMap } from "../types";

export const ACCOUNT_KEYS_MAP: Partial<Record<keyof IAccount, string>> = {
  id: "ID",
  balance: "Баланс",
  account_name: "Аккаунт",
  login: "Логин",
  platform: "Платформа",
  created_at: "Создан",
  is_archive: 'В архиве',
};

export const ACCOUNT_PLATFORM_MAP: Record<string, IAccountPlatformMap> = {
  YANDEX_DIRECT: {
    name: "Яндекс Директ",
    color: "air-primary-warning",
  },
  VK_ADS: {
    name: "ВКонтакте",
    color: "air-primary",
  },
};
