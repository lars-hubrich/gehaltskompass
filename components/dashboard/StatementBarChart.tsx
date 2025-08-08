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
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
  ];

  const totalBrutto = bruttoData.reduce((sum, v) => sum + v, 0);
  const totalNetto = payoutNetto.reduce((sum, v) => sum + v, 0);

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
            height={400}
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
