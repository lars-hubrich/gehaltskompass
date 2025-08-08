import { FIELD_DESCRIPTIONS_HUMAN } from "@/constants/fieldDescriptions";
import type { StatementData } from "@/constants/Interfaces";

/**
 * Validates that each brutto field matches the sum of incomes.
 *
 * @param {StatementData} value Statement data to validate.
 * @returns {Record<string, string>} Warnings for mismatched brutto fields.
 */
export function validateBruttoFields(
  value: StatementData,
): Record<string, string> {
  const warnings: Record<string, string> = {};
  const totalIncome = value.incomes.reduce((sum, inc) => sum + inc.value, 0);
  const bruttoFields: (keyof StatementData)[] = [
    "brutto_tax",
    "brutto_av",
    "brutto_pv",
    "brutto_rv",
    "brutto_kv",
  ];
  for (const field of bruttoFields) {
    const fieldValue = value[field];
    if (typeof fieldValue !== "number") {
      continue;
    }
    const diff = Math.abs(totalIncome - fieldValue);
    if (diff > 1) {
      const label = FIELD_DESCRIPTIONS_HUMAN[field] || field;
      warnings[field] =
        `Summe der Einnahmen stimmt nicht mit ${label} überein (Differenz: ${diff.toFixed(
          2,
        )} €).`;
    }
  }
  return warnings;
}
