"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { PieChart } from "@mui/x-charts/PieChart";
import { StatementData } from "@/constants/Interfaces";

interface TaxPieChartProps {
  statements: StatementData[];
}

export default function TaxPieChart({ statements = [] }: TaxPieChartProps) {
  const theme = useTheme();

  const sorted = [...statements].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );
  const lastStatement = sorted[sorted.length - 1];

  if (!lastStatement) {
    return (
      <Card variant="outlined" sx={{ width: "100%" }}>
        <CardContent>
          <Typography>No statement data available.</Typography>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
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

  const colors = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
  ];

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Verteilung der Steuerabgaben (letzte Abrechnung)
        </Typography>
        <Stack alignItems="center">
          <PieChart
            series={[{ data: pieData }]}
            colors={colors}
            width={150}
            height={150}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
