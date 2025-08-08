"use client";

import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatementDataGrid from "./StatementDataGrid";
import { useState, useEffect, useCallback } from "react";
import { StatementOverviewData } from "@/constants/Interfaces";
import { Alert } from "@mui/material";

export default function StatementsGrid() {
  const [statements, setStatements] = useState<StatementOverviewData[]>([]);
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
  }, []);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Gehaltsabrechnungen
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 12 }}>
          {/*TODO fixed height*/}
          <StatementDataGrid
            statements={statements}
            onRefresh={fetchStatements}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
