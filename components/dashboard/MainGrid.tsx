"use client";

import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HighlightedCard from "./HighlightedCard";
import StatementBarChart from "./StatementBarChart";
import StatCard, { StatCardProps } from "./StatCard";
import { useState, useEffect, useCallback, useMemo } from "react";
import { StatementData } from "@/constants/Interfaces";
import SocialPieChart from "@/components/dashboard/StatementSocialPieChart";
import TaxPieChart from "@/components/dashboard/StatementTaxPieChart";
import IncomePieChart from "@/components/dashboard/StatementIncomePieChart";
import { Stack, Alert } from "@mui/material";
import NoStatementsCard from "./NoStatementsCard";

export default function MainGrid() {
  const [statements, setStatements] = useState<StatementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatements = useCallback(async () => {
    try {
      const res = await fetch("/api/statement");
      if (res.ok) {
        const data = await res.json();
        setStatements(data);
        setError(null);
      } else {
        const err = await res.json();
        setError(err.error || "Fehler beim Laden der Abrechnungen");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // noinspection JSIgnoredPromiseFromCall
    fetchStatements();
  }, [fetchStatements]);

  const sorted = useMemo(
    () =>
      [...statements].sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.month - b.month,
      ),
    [statements],
  );

  const last12 = useMemo(() => sorted.slice(-12), [sorted]);

  const nettoData = useMemo(() => last12.map((s) => s.payout_netto), [last12]);
  const bruttoData = useMemo(() => last12.map((s) => s.brutto_tax), [last12]);
  const abgabenData = useMemo(() => {
    return last12.map((s) => {
      const value =
        ((s.deduction_tax_income +
          s.deduction_tax_church +
          s.deduction_tax_solidarity +
          s.deduction_tax_other +
          s.social_av +
          s.social_pv +
          s.social_rv +
          s.social_kv) /
          s.brutto_tax) *
        100;

      return Number(value.toFixed(2));
    });
  }, [last12]);

  const totalNetto = useMemo(
    () => nettoData.reduce((sum, v) => sum + v, 0),
    [nettoData],
  );
  const totalBrutto = useMemo(
    () => bruttoData.reduce((sum, v) => sum + v, 0),
    [bruttoData],
  );

  const trendOf = (arr: number[]): "up" | "down" | "neutral" => {
    if (arr.length < 2) return "neutral";
    const diff = arr[arr.length - 1] - arr[0];
    return diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
  };

  const formatValue = (num: number, isPercentage = false) => {
    if (isPercentage) {
      return `${num.toFixed(1)}%`;
    }
    return num >= 1000
      ? `${(num / 1000).toFixed(1)}k`
      : num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const cards: StatCardProps[] = [
    {
      title: "Netto",
      value: formatValue(totalNetto),
      interval: "Letztes Jahr",
      trend: trendOf(nettoData),
      data: nettoData,
    },
    {
      title: "Brutto",
      value: formatValue(totalBrutto),
      interval: "Letztes Jahr",
      trend: trendOf(bruttoData),
      data: bruttoData,
    },
    {
      title: "Anteil Abgaben",
      value: formatValue(abgabenData.at(-1) ?? 0, true),
      interval: "Letztes Jahr",
      trend: trendOf(abgabenData),
      data: abgabenData,
    },
  ];
  if (!loading && error) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (!loading && statements.length === 0) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <NoStatementsCard />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Übersicht
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {cards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack>
            <SocialPieChart statements={statements} />
            <TaxPieChart statements={statements} />
            <IncomePieChart statements={statements} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatementBarChart statements={statements} />
        </Grid>
      </Grid>
    </Box>
  );
}
