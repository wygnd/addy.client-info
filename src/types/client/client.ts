import { IAccount } from "./account.ts";
import { IContract } from "./contract.ts";
import { IDeposit } from "./deposit.ts";

interface IClientInfo {
  id: number;
  parent_id: null | number;
  name: string;
  lastname: string;
  reserve_phone: string | null;
  registration_source: string;
  contact_email: string;
  email: string;
  user_type: IClientType;
  last_activity_date: string | null;
  contract_deposit_at: string | null;
  ad_account_deposited_at: string | null;
  rewardContracts?: IContract;
  tags: IClientTag[];
  deposit?: IDeposit[];
}

export interface IClient extends IClientInfo {
  contracts: IContract[];
  childs: IClient[];
  accounts: IAccount[];
}

export type IClientType = "AGENCY" | "SIMPLE";

export interface IClientTag {
  id: number;
  name: string;
  code: string;
  type: TClientTagType;
}
export type TClientTagType = "MARKER";
