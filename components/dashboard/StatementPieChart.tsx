"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { PieChart } from "@mui/x-charts/PieChart";
import { StatementData } from "@/constants/Interfaces";

interface StatementPieChartProps {
  statements: StatementData[];
  variant: "income" | "social" | "tax";
}

/**
 * Renders a pie chart for income, social, or tax distributions.
 *
 * @param {StatementPieChartProps} props - Component properties.
 * @returns {JSX.Element} Pie chart component.
 */
export default function StatementPieChart({
  statements = [],
  variant,
}: StatementPieChartProps) {
  const theme = useTheme();

  const sorted = [...statements].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );
  const lastStatement = sorted[sorted.length - 1];

  if (!lastStatement) {
    return (
      <Card variant="outlined" sx={{ width: "100%" }}>
        <CardContent>
          <Typography>Keine Abrechnungsdaten vorhanden.</Typography>
        </CardContent>
      </Card>
    );
  }

  let pieData: { id: string; value: number; label: string }[] = [];
  let title = "";

  switch (variant) {
    case "income":
      pieData = lastStatement.incomes.map((income) => ({
        id: income.identifier,
        value: income.value,
        label: income.name,
      }));
      title = "Verteilung des Einkommens";
      break;
    case "social":
      pieData = [
        {
          id: "av",
          value: lastStatement.social_av,
          label: "Arbeitslosenversicherung",
        },
        {
          id: "pv",
          value: lastStatement.social_pv,
          label: "Pflegeversicherung",
        },
        {
          id: "rv",
          value: lastStatement.social_rv,
          label: "Rentenversicherung",
        },
        {
          id: "kv",
          value: lastStatement.social_kv,
          label: "Krankenversicherung",
        },
      ];
      title = "Verteilung der Sozialabgaben";
      break;
    case "tax":
      pieData = [
        {
          id: "income",
          value: lastStatement.deduction_tax_income,
          label: "Einkommenssteuer",
        },
        {
          id: "solidarity",
          value: lastStatement.deduction_tax_solidarity,
          label: "Solidaritätszuschlag",
        },
        {
          id: "church",
          value: lastStatement.deduction_tax_church,
          label: "Kirchensteuer",
        },
        {
          id: "other",
          value: lastStatement.deduction_tax_other,
          label: "Andere Steuerabzüge",
        },
      ];
      title = "Verteilung der Steuerabgaben";
      break;
  }

  const baseColors = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
  ];
  const colors = pieData.map(
    (_, index) => baseColors[index % baseColors.length],
  );

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Stack alignItems="center" justifyContent="center">
          <PieChart
            series={[
              {
                data: pieData,
                arcLabel: (item) =>
                  item.value.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }),
                arcLabelMinAngle: 35,
                arcLabelRadius: "60%",
              },
            ]}
            colors={colors}
            width={150}
            height={150}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
