export interface Statement {
  id: string;
  month: number;
  year: number;
  brutto_tax: number;
  payout_netto: number;
}

interface Income {
  id?: number;
  name: string;
  identifier: string;
  value: number;
}

export interface StatementData {
  month: number;
  year: number;
  incomes: Income[];
  brutto_tax: number;
  brutto_av: number;
  brutto_pv: number;
  brutto_rv: number;
  brutto_kv: number;
  deduction_tax_income: number;
  deduction_tax_church: number;
  deduction_tax_solidarity: number;
  deduction_tax_other: number;
  social_av: number;
  social_pv: number;
  social_rv: number;
  social_kv: number;
  payout_netto: number;
  payout_transfer: number;
  payout_vwl: number;
  payout_other: number;
  [key: string]: string | number | Income[];
}
