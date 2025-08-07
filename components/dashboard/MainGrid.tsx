"use client";

import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatementDataGrid from "./StatementDataGrid";
import HighlightedCard from "./HighlightedCard";
import StatementBarChart from "./StatementBarChart";
import SessionsChart from "./SessionsChart";
import StatCard, { StatCardProps } from "./StatCard";
import { useState, useEffect, useCallback, useMemo } from "react";
import { filteredStatement, StatementData } from "@/constants/Interfaces";

export default function MainGrid() {
  const [filteredStatements, setFilteredStatements] = useState<
    filteredStatement[]
  >([]);
  const [statements, setStatements] = useState<StatementData[]>([]);

  const fetchStatements = useCallback(async () => {
    const res = await fetch("/api/statement");
    if (res.ok) {
      const data = await res.json();
      setStatements(data);
      setFilteredStatements(data);
    }
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
  const abgabenData = useMemo(
    () =>
      last12.map(
        (s) =>
          s.deduction_tax_income +
          s.deduction_tax_church +
          s.deduction_tax_solidarity +
          s.deduction_tax_other +
          s.social_av +
          s.social_pv +
          s.social_rv +
          s.social_kv,
      ),
    [last12],
  );

  const totalNetto = useMemo(
    () => nettoData.reduce((sum, v) => sum + v, 0),
    [nettoData],
  );
  const totalBrutto = useMemo(
    () => bruttoData.reduce((sum, v) => sum + v, 0),
    [bruttoData],
  );
  const totalAbgaben = useMemo(
    () => abgabenData.reduce((sum, v) => sum + v, 0),
    [abgabenData],
  );

  const trendOf = (arr: number[]): "up" | "down" | "neutral" => {
    if (arr.length < 2) return "neutral";
    const diff = arr[arr.length - 1] - arr[0];
    return diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
  };

  const formatValue = (num: number) =>
    num >= 1000
      ? `${(num / 1000).toFixed(1)}k`
      : num.toLocaleString(undefined, { maximumFractionDigits: 0 });

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
      value: formatValue(totalAbgaben),
      interval: "Letztes Jahr",
      trend: trendOf(abgabenData),
      data: abgabenData,
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
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
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatementBarChart />
        </Grid>
      </Grid>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <StatementDataGrid
            statements={filteredStatements}
            onRefresh={fetchStatements}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
