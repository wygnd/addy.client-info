import { TB24Color } from "../bitrix";

export interface IAccount {
  id: number;
  is_addy_client: boolean;
  platform: string;
  account_name: string;
  login: string;
  balance: number;
  is_marked: boolean;
  created_at: string;
  is_archive: number;
}

export interface IAccountPlatformMap {
  name: string;
  color: TB24Color;
}
