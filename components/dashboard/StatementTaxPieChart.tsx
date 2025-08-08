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
          <Typography>Keine Abrechnungsdaten vorhanden.</Typography>
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
          Verteilung der Steuerabgaben
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
