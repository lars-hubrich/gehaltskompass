"use client";

import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import StatementForm from "@/components/StatementForm";
import { StatementData } from "@/constants/Interfaces";
import { buildStatementChartData } from "@/lib/statements/chart-data";

interface CustomizedBarChartProps {
  statements: StatementData[];
  onRefresh?: () => Promise<void>;
}

/**
 * Displays a stacked bar chart summarizing statement data.
 *
 * @param {CustomizedBarChartProps} props - Component properties.
 * @returns {JSX.Element} Bar chart component.
 */
export default function StatementBarChart({
  statements = [],
  onRefresh,
}: CustomizedBarChartProps) {
  const theme = useTheme();
  const [editId, setEditId] = useState<string | null>(null);

  const {
    sorted,
    categories,
    taxData,
    socialData,
    payoutData,
    totalBrutto,
    totalNetto,
  } = buildStatementChartData(statements);

  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
  ];

  return (
    <>
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
            </Stack>
          </Stack>

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
                id: "tax",
                label: "Steuern",
                data: taxData,
                stack: "stack",
              },
              {
                id: "social",
                label: "Sozialabgaben",
                data: socialData,
                stack: "stack",
              },
              {
                id: "payout",
                label: "Auszahlungen",
                data: payoutData,
                stack: "stack",
              },
            ]}
            height={600}
            margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
            grid={{ horizontal: true }}
            hideLegend={false}
            onItemClick={(_, item) => {
              const statement = sorted[item.dataIndex];
              if (statement?.id) {
                setEditId(statement.id);
              }
            }}
          />
        </CardContent>
      </Card>
      <Dialog
        open={!!editId}
        onClose={() => setEditId(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          {editId && (
            <StatementForm
              statementId={editId}
              onSaved={async () => {
                setEditId(null);
                if (onRefresh) {
                  await onRefresh();
                }
              }}
              onCancel={() => setEditId(null)}
              openChartsOnLoad
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
