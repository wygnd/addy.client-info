export interface IDeposit {
  id: number;
  contract: number;
  type: TDepositType;
  status: TDepositStatus;
  amount_without_commission: number;
  amount: number;
  method_type: TDepositMethodType;
  payment_time: string;
  created_at: string;
}

export type TDepositStatus = "COMPLETED" | "PENDING" | "FAIL" | "FROZEN";

export type TDepositMethodType = "INVOICE" | "TRANSFER" | "QR" | "CARD";

export type TDepositType =
  | "ACCOUNT_DEPOSIT"
  | "AD_ACCOUNT_DEPOSIT"
  | "ACCRUE_REWARD"
  | "TRANSPORT"
  | "WITHDRAWAL";

export type TBitrixPauseDepositType =
  | "days_since_ad_account_funded"
  | "days_since_addy_funded";

export interface IBitrixPauseDeposit {
  id: number;
  clientExternalId: number;
  depositType: TBitrixPauseDepositType;
  recordedAt: string;
}
