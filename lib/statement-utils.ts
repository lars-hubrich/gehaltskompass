import { StatementData } from "@/constants/Interfaces";

const NUMERIC_FIELDS: (keyof StatementData)[] = [
  "month",
  "year",
  "brutto_tax",
  "brutto_av",
  "brutto_pv",
  "brutto_rv",
  "brutto_kv",
  "deduction_tax_income",
  "deduction_tax_church",
  "deduction_tax_solidarity",
  "deduction_tax_other",
  "social_av",
  "social_pv",
  "social_rv",
  "social_kv",
  "payout_netto",
  "payout_transfer",
  "payout_vwl",
  "payout_other",
];

export function ensurePositiveStatement(data: StatementData): StatementData {
  const result: StatementData = {
    ...data,
    incomes:
      data.incomes?.map((inc) => ({
        ...inc,
        value: Math.abs(Number(inc.value) || 0),
      })) ?? [],
  };

  for (const field of NUMERIC_FIELDS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result[field] = Math.abs(Number((result as any)[field]) || 0);
  }

  return result;
}

export function ensurePositivePartialStatement<
  T extends Partial<StatementData>,
>(data: T): T {
  const result: T = { ...data };
  for (const field of NUMERIC_FIELDS) {
    if (field in result) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[field] = Math.abs(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Number((result as any)[field]) || 0,
      );
    }
  }
  if ("incomes" in result && result.incomes) {
    result.incomes = result.incomes.map((inc) => ({
      ...inc,
      value: Math.abs(Number(inc.value) || 0),
    }));
  }
  return result;
}
