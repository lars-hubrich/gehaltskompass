"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { PieChart } from "@mui/x-charts/PieChart";
import { StatementData } from "@/constants/Interfaces";

interface IncomePieChartProps {
  statements: StatementData[];
}

export default function IncomePieChart({
  statements = [],
}: IncomePieChartProps) {
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

  const pieData = lastStatement.incomes.map((income) => ({
    id: income.identifier,
    value: income.value,
    label: income.name,
  }));

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
          Verteilung der Einkommen (letzte Abrechnung)
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
