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

/**
 * Normalizes all numeric fields of a full statement and ensures values are positive.
 *
 * @param {StatementData} data The raw statement data.
 * @returns {StatementData} A new statement with absolute numeric values.
 */
export function ensurePositiveStatement(data: StatementData): StatementData {
  const result: StatementData = {
    ...data,
    /* c8 ignore start */
    incomes:
      data.incomes?.map((inc) => ({
        ...inc,
        value: Math.abs(Number(inc.value) || 0),
      })) ?? [],
    /* c8 ignore end */
  };

  for (const field of NUMERIC_FIELDS) {
    result[field] = Math.abs(Number(result[field]) || 0);
  }

  return result;
}

/**
 * Converts numeric fields of a partial statement to absolute values.
 *
 * @template T
 * @param {T} data Partial statement data.
 * @returns {T} The partial statement with positive numbers.
 */
export function ensurePositivePartialStatement<
  T extends Partial<StatementData>,
>(data: T): T {
  const result: T = { ...data };
  for (const field of NUMERIC_FIELDS) {
    if (field in result) {
      const value = result[field as keyof T];
      (result as Record<string, unknown>)[field] = Math.abs(Number(value) || 0);
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
