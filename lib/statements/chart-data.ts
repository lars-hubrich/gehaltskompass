import { StatementData } from "@/constants/Interfaces";

export interface StatementChartData {
  sorted: StatementData[];
  categories: string[];
  taxData: number[];
  socialData: number[];
  payoutData: number[];
  totalBrutto: number;
  totalNetto: number;
}

export function buildStatementChartData(
  statements: StatementData[],
): StatementChartData {
  const sorted = [...statements].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );

  const categories = sorted.map(
    (s) => `${String(s.month).padStart(2, "0")}.${s.year}`,
  );

  const bruttoData = sorted.map((s) => s.brutto_tax);
  const payoutNetto = sorted.map((s) => s.payout_netto);

  const taxData = sorted.map(
    (s) =>
      s.deduction_tax_income +
      s.deduction_tax_church +
      s.deduction_tax_solidarity +
      s.deduction_tax_other,
  );

  const socialData = sorted.map(
    (s) => s.social_av + s.social_pv + s.social_rv + s.social_kv,
  );

  const payoutData = sorted.map(
    (s) => s.payout_netto + s.payout_transfer + s.payout_vwl + s.payout_other,
  );

  const totalBrutto = bruttoData.reduce((sum, v) => sum + v, 0);
  const totalNetto = payoutNetto.reduce((sum, v) => sum + v, 0);

  return {
    sorted,
    categories,
    taxData,
    socialData,
    payoutData,
    totalBrutto,
    totalNetto,
  };
}
