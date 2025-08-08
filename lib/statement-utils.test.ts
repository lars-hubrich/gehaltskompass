/**
 * @jest-environment node
 */
import {
  ensurePositivePartialStatement,
  ensurePositiveStatement,
} from "./statement-utils";
import type { StatementData } from "@/constants/Interfaces";

describe("ensurePositiveStatement", () => {
  it("converts numeric fields and incomes to absolute numbers", () => {
    const input: StatementData = {
      month: -1,
      year: -2024,
      incomes: [
        { name: "Salary", identifier: "sal", value: -5000 },
        { name: "Bonus", identifier: "bon", value: -200 },
      ],
      brutto_tax: -1,
      brutto_av: -2,
      brutto_pv: -3,
      brutto_rv: -4,
      brutto_kv: -5,
      deduction_tax_income: -6,
      deduction_tax_church: -7,
      deduction_tax_solidarity: -8,
      deduction_tax_other: -9,
      social_av: -10,
      social_pv: -11,
      social_rv: -12,
      social_kv: -13,
      payout_netto: -14,
      payout_transfer: -15,
      payout_vwl: -16,
      payout_other: -17,
    };

    const result = ensurePositiveStatement(input);

    // verify each numeric field is positive
    expect(result).toMatchObject({
      month: 1,
      year: 2024,
      brutto_tax: 1,
      brutto_av: 2,
      brutto_pv: 3,
      brutto_rv: 4,
      brutto_kv: 5,
      deduction_tax_income: 6,
      deduction_tax_church: 7,
      deduction_tax_solidarity: 8,
      deduction_tax_other: 9,
      social_av: 10,
      social_pv: 11,
      social_rv: 12,
      social_kv: 13,
      payout_netto: 14,
      payout_transfer: 15,
      payout_vwl: 16,
      payout_other: 17,
    });
    expect(result.incomes).toEqual([
      { name: "Salary", identifier: "sal", value: 5000 },
      { name: "Bonus", identifier: "bon", value: 200 },
    ]);
  });

  it("does not mutate the original object", () => {
    const input: StatementData = {
      month: -1,
      year: -2024,
      incomes: [{ name: "Salary", identifier: "sal", value: -1000 }],
      brutto_tax: -1,
      brutto_av: -1,
      brutto_pv: -1,
      brutto_rv: -1,
      brutto_kv: -1,
      deduction_tax_income: -1,
      deduction_tax_church: -1,
      deduction_tax_solidarity: -1,
      deduction_tax_other: -1,
      social_av: -1,
      social_pv: -1,
      social_rv: -1,
      social_kv: -1,
      payout_netto: -1,
      payout_transfer: -1,
      payout_vwl: -1,
      payout_other: -1,
    };

    const copy = JSON.parse(JSON.stringify(input));
    ensurePositiveStatement(input);

    expect(input).toEqual(copy);
    expect(input.incomes[0].value).toBe(-1000);
  });
});

describe("ensurePositivePartialStatement", () => {
  it("converts provided numeric fields to absolute values", () => {
    const input = {
      month: -5,
      payout_netto: -100,
      incomes: [{ name: "Salary", identifier: "sal", value: -300 }],
    } as Partial<StatementData>;

    const result = ensurePositivePartialStatement(input);
    expect(result).toMatchObject({
      month: 5,
      payout_netto: 100,
      incomes: [{ name: "Salary", identifier: "sal", value: 300 }],
    });
  });

  it("leaves unrelated properties untouched", () => {
    const input = { custom: "test", month: -2 } as Partial<StatementData> & {
      custom: string;
    };
    const result = ensurePositivePartialStatement(input);
    expect(result.custom).toBe("test");
    expect(result.month).toBe(2);
  });
});
