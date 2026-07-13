export interface IContractPayload {
  addy_client_id: string;
  contract_id: string;
  contract_date: string;
  contract_num: string;
  contact_face: string;
  company_name: string;
  inn: string;
  kpp: string;
  ogrn: string;
  contract_status: string;
  contract_type: number;
  contragent_status: string;
  contract_name: string;
  reward_method: string;
  pick_up: string;
  vat: string;
  okved: string;
  bank_name: string;
  bik: string;
  checking_account: string;
  correspondent_account: string;
  job_title: string;
  lastname: string;
  firstname: string;
  surname: string;
  email: string;
  phone: string;
  legal_address: string;
  actual_address: string;
  edo_id: string;
}

export interface IContract {
  id: number;
  number: string;
  contract_type: string;
  inn: string;
  balance: number;
  payload: IContractPayload;
  created_at: string;
}
