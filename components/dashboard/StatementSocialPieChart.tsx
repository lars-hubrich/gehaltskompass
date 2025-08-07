"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { PieChart } from "@mui/x-charts/PieChart";
import { StatementData } from "@/constants/Interfaces";

interface SocialPieChartProps {
  statements: StatementData[];
}

export default function SocialPieChart({
  statements = [],
}: SocialPieChartProps) {
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
      id: "av",
      value: lastStatement.social_av,
      label: "Arbeitslosenversicherung",
    },
    { id: "pv", value: lastStatement.social_pv, label: "Pflegeversicherung" },
    { id: "rv", value: lastStatement.social_rv, label: "Rentenversicherung" },
    { id: "kv", value: lastStatement.social_kv, label: "Krankenversicherung" },
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
          Verteilung der Sozialabgaben (letzte Abrechnung)
        </Typography>
        <Stack alignItems="center">
          <PieChart
            series={[{ data: pieData }]}
            colors={colors}
            width={300}
            height={300}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
