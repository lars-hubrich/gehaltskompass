/**
 * @jest-environment node
 */
import { validateBruttoFields } from "./validation";
import type { StatementData } from "@/constants/Interfaces";
import { FIELD_DESCRIPTIONS_HUMAN } from "@/constants/fieldDescriptions";

describe("validateBruttoFields", () => {
  it("flags each brutto field individually when it doesn't match incomes", () => {
    const data: StatementData = {
      month: 1,
      year: 2024,
      incomes: [{ name: "Salary", identifier: "sal", value: 1000 }],
      brutto_tax: 1000,
      brutto_av: 900,
      brutto_pv: 1000,
      brutto_rv: 1200,
      brutto_kv: 1000,
      deduction_tax_income: 0,
      deduction_tax_church: 0,
      deduction_tax_solidarity: 0,
      deduction_tax_other: 0,
      social_av: 0,
      social_pv: 0,
      social_rv: 0,
      social_kv: 0,
      payout_netto: 0,
      payout_transfer: 0,
      payout_vwl: 0,
      payout_other: 0,
    };

    const warnings = validateBruttoFields(data);
    expect(Object.keys(warnings).sort()).toEqual(["brutto_av", "brutto_rv"]);
  });

  it("ignores non-numeric brutto fields", () => {
    const data: StatementData = {
      month: 1,
      year: 2024,
      incomes: [{ name: "Salary", identifier: "sal", value: 1000 }],
      brutto_tax: "abc" as unknown as number,
      brutto_av: 1000,
      brutto_pv: 1000,
      brutto_rv: 1000,
      brutto_kv: 1000,
      deduction_tax_income: 0,
      deduction_tax_church: 0,
      deduction_tax_solidarity: 0,
      deduction_tax_other: 0,
      social_av: 0,
      social_pv: 0,
      social_rv: 0,
      social_kv: 0,
      payout_netto: 0,
      payout_transfer: 0,
      payout_vwl: 0,
      payout_other: 0,
    };
    const warnings = validateBruttoFields(data);
    expect(warnings).not.toHaveProperty("brutto_tax");
  });

  it("returns no warnings when sums match", () => {
    const data: StatementData = {
      month: 1,
      year: 2024,
      incomes: [{ name: "Salary", identifier: "sal", value: 1000 }],
      brutto_tax: 1000,
      brutto_av: 1000,
      brutto_pv: 1000,
      brutto_rv: 1000,
      brutto_kv: 1000,
      deduction_tax_income: 0,
      deduction_tax_church: 0,
      deduction_tax_solidarity: 0,
      deduction_tax_other: 0,
      social_av: 0,
      social_pv: 0,
      social_rv: 0,
      social_kv: 0,
      payout_netto: 0,
      payout_transfer: 0,
      payout_vwl: 0,
      payout_other: 0,
    };
    const warnings = validateBruttoFields(data);
    expect(warnings).toEqual({});
  });

  it("falls back to field name if description missing", () => {
    const original = FIELD_DESCRIPTIONS_HUMAN.brutto_av;
    delete FIELD_DESCRIPTIONS_HUMAN.brutto_av;
    const data: StatementData = {
      month: 1,
      year: 2024,
      incomes: [{ name: "Salary", identifier: "sal", value: 1000 }],
      brutto_tax: 1000,
      brutto_av: 900,
      brutto_pv: 1000,
      brutto_rv: 1000,
      brutto_kv: 1000,
      deduction_tax_income: 0,
      deduction_tax_church: 0,
      deduction_tax_solidarity: 0,
      deduction_tax_other: 0,
      social_av: 0,
      social_pv: 0,
      social_rv: 0,
      social_kv: 0,
      payout_netto: 0,
      payout_transfer: 0,
      payout_vwl: 0,
      payout_other: 0,
    };
    const warnings = validateBruttoFields(data);
    expect(warnings.brutto_av).toContain("brutto_av");
    FIELD_DESCRIPTIONS_HUMAN.brutto_av = original;
  });
});
