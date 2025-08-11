"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { PieChart } from "@mui/x-charts/PieChart";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import { StatementData } from "@/constants/Interfaces";

interface StatementPieChartProps {
  statements: StatementData[];
  variant: "income" | "social" | "tax";
  inDialog?: boolean;
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
  inDialog = false,
}: StatementPieChartProps) {
  const theme = useTheme();

  if (statements.length === 0) {
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
      const incomeMap = new Map<string, { name: string; value: number }>();
      statements.forEach((s) =>
        s.incomes.forEach((inc) => {
          const existing = incomeMap.get(inc.identifier);
          if (existing) {
            existing.value += inc.value;
          } else {
            incomeMap.set(inc.identifier, { name: inc.name, value: inc.value });
          }
        }),
      );
      pieData = Array.from(incomeMap.entries()).map(
        ([id, { name, value }]) => ({
          id,
          value,
          label: name,
        }),
      );
      title = "Verteilung des Einkommens";
      break;
    case "social":
      pieData = [
        {
          id: "av",
          value: statements.reduce((sum, s) => sum + s.social_av, 0),
          label: "Arbeitslosenversicherung",
        },
        {
          id: "pv",
          value: statements.reduce((sum, s) => sum + s.social_pv, 0),
          label: "Pflegeversicherung",
        },
        {
          id: "rv",
          value: statements.reduce((sum, s) => sum + s.social_rv, 0),
          label: "Rentenversicherung",
        },
        {
          id: "kv",
          value: statements.reduce((sum, s) => sum + s.social_kv, 0),
          label: "Krankenversicherung",
        },
      ];
      title = "Verteilung der Sozialabgaben";
      break;
    case "tax":
      pieData = [
        {
          id: "income",
          value: statements.reduce((sum, s) => sum + s.deduction_tax_income, 0),
          label: "Einkommenssteuer",
        },
        {
          id: "solidarity",
          value: statements.reduce(
            (sum, s) => sum + s.deduction_tax_solidarity,
            0,
          ),
          label: "Solidaritätszuschlag",
        },
        {
          id: "church",
          value: statements.reduce((sum, s) => sum + s.deduction_tax_church, 0),
          label: "Kirchensteuer",
        },
        {
          id: "other",
          value: statements.reduce((sum, s) => sum + s.deduction_tax_other, 0),
          label: "Andere Steuerabzüge",
        },
      ];
      title = "Verteilung der Steuerabgaben";
      break;
  }

  if (!inDialog) {
    title += " (Summe aller Abrechnungen)";
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
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
          {inDialog && (
            <List dense>
              {pieData.map((item, index) => (
                <ListItem key={item.id} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 16 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: colors[index],
                        borderRadius: 0.5,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.value.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                    slotProps={{
                      primary: { variant: "body2" },
                      secondary: {
                        variant: "caption",
                        color: "text.secondary",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
