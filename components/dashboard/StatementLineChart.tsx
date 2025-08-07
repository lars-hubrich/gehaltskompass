"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { LineChart } from "@mui/x-charts/LineChart";
import { StatementData } from "@/constants/Interfaces";

interface StatementLineChartProps {
  statements: StatementData[];
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatementLineChart({
  statements = [],
}: StatementLineChartProps) {
  const theme = useTheme();

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

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  const totalBrutto = bruttoData.reduce((sum, v) => sum + v, 0);
  const totalNetto = payoutNetto.reduce((sum, v) => sum + v, 0);

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Gehaltsabrechnungen Verlauf
        </Typography>
        <Stack sx={{ justifyContent: "space-between", mb: 2 }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
            <Typography variant="h5" component="p">
              {`Brutto gesamt: ${totalBrutto.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} €`}
            </Typography>
            <Typography variant="h5" component="p">
              {`Netto gesamt: ${totalNetto.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} €`}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Verteilung von Steuern, Sozialabgaben und Auszahlungen über die
            letzten {categories.length} Monate
          </Typography>
        </Stack>

        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: "band",
              data: categories,
              categoryGapRatio: 0.5,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: "tax",
              label: "Steuern",
              showMark: false,
              curve: "linear",
              area: true,
              data: taxData,
            },
            {
              id: "social",
              label: "Sozialabgaben",
              showMark: false,
              curve: "linear",
              area: true,
              data: socialData,
            },
            {
              id: "payout",
              label: "Auszahlungen",
              showMark: false,
              curve: "linear",
              area: true,
              data: payoutData,
            },
          ]}
          height={300}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          hideLegend={false}
          sx={{
            "& .MuiAreaElement-series-tax": { fill: "url('#tax')" },
            "& .MuiAreaElement-series-social": { fill: "url('#social')" },
            "& .MuiAreaElement-series-payout": { fill: "url('#payout')" },
          }}
        >
          <AreaGradient color={theme.palette.primary.dark} id="tax" />
          <AreaGradient color={theme.palette.primary.main} id="social" />
          <AreaGradient color={theme.palette.primary.light} id="payout" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
