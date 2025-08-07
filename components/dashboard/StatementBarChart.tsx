"use client";

import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import { StatementData } from "@/constants/Interfaces";

export default function StatementBarChart() {
  const theme = useTheme();
  const [statements, setStatements] = useState<StatementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/statement")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: StatementData[]) => {
        setStatements(data);
      })
      .catch((err) => console.error("Error fetching statements:", err))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...statements].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );

  const categories = sorted.map(
    (s) => `${String(s.month).padStart(2, "0")}.${s.year}`,
  );

  const bruttoData = sorted.map((s) => s.brutto_tax);

  const deductionTaxIncome = sorted.map((s) => s.deduction_tax_income);
  const deductionTaxChurch = sorted.map((s) => s.deduction_tax_church);
  const deductionTaxSolidarity = sorted.map((s) => s.deduction_tax_solidarity);
  const deductionTaxOther = sorted.map((s) => s.deduction_tax_other);

  const socialAV = sorted.map((s) => s.social_av);
  const socialPV = sorted.map((s) => s.social_pv);
  const socialRV = sorted.map((s) => s.social_rv);
  const socialKV = sorted.map((s) => s.social_kv);

  const payoutNetto = sorted.map((s) => s.payout_netto);
  const payoutTransfer = sorted.map((s) => s.payout_transfer);
  const payoutVWL = sorted.map((s) => s.payout_vwl);
  const payoutOther = sorted.map((s) => s.payout_other);

  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
  ];

  const totalBrutto = bruttoData.reduce((sum, v) => sum + v, 0);
  const totalNetto = payoutNetto.reduce((sum, v) => sum + v, 0);

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Gehaltsabrechnungen Übersicht
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h5" component="p">
              {`Brutto: ${totalBrutto.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} €`}
            </Typography>
            <Typography variant="h5" component="p">
              {`Netto: ${totalNetto.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} €`}
            </Typography>
            {/*<Chip size="small" color="primary" label="Monatlich" />*/}
          </Stack>
          {/*<Typography variant="caption" sx={{ color: "text.secondary" }}>*/}
          {/*  Steuer-Brutto und Netto-Auszahlung der letzten {categories.length}{" "}*/}
          {/*  Monate*/}
          {/*</Typography>*/}
        </Stack>

        {loading ? (
          <Typography sx={{ mt: 2 }}>Lade Daten...</Typography>
        ) : (
          <BarChart
            borderRadius={8}
            colors={colorPalette}
            xAxis={[
              {
                scaleType: "band",
                categoryGapRatio: 0.5,
                data: categories,
                height: 24,
              },
            ]}
            yAxis={[{ width: 50 }]}
            series={[
              {
                id: "tax_income",
                label: "Einkommensteuer",
                data: deductionTaxIncome,
                stack: "brutto_stack",
              },
              {
                id: "tax_church",
                label: "Kirchensteuer",
                data: deductionTaxChurch,
                stack: "brutto_stack",
              },
              {
                id: "tax_solidarity",
                label: "Solidaritätszuschlag",
                data: deductionTaxSolidarity,
                stack: "brutto_stack",
              },
              {
                id: "tax_other",
                label: "Sonstige Steuern",
                data: deductionTaxOther,
                stack: "brutto_stack",
              },
              {
                id: "social_av",
                label: "Arbeitslosenversicherung",
                data: socialAV,
                stack: "brutto_stack",
              },
              {
                id: "social_pv",
                label: "Pflegeversicherung",
                data: socialPV,
                stack: "brutto_stack",
              },
              {
                id: "social_rv",
                label: "Rentenversicherung",
                data: socialRV,
                stack: "brutto_stack",
              },
              {
                id: "social_kv",
                label: "Krankenversicherung",
                data: socialKV,
                stack: "brutto_stack",
              },
              {
                id: "payout_netto",
                label: "Netto",
                data: payoutNetto,
                stack: "netto_stack",
              },
              {
                id: "payout_transfer",
                label: "Überweisung",
                data: payoutTransfer,
                stack: "netto_stack",
              },
              {
                id: "payout_vwl",
                label: "VWL",
                data: payoutVWL,
                stack: "netto_stack",
              },
              {
                id: "payout_other",
                label: "Sonstige Auszahlungen",
                data: payoutOther,
                stack: "netto_stack",
              },
            ]}
            height={400}
            margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
            grid={{ horizontal: true }}
            hideLegend={false}
          />
        )}
      </CardContent>
    </Card>
  );
}
