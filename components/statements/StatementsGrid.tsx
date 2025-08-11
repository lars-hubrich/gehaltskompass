"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatementDataGrid from "./StatementDataGrid";
import { StatementOverviewData } from "@/constants/Interfaces";
import ErrorSnackbar from "@/components/ErrorSnackbar";

/**
 * Container displaying the statements grid and handling data loading.
 *
 * @returns {JSX.Element} Statements grid wrapper.
 */
export default function StatementsGrid() {
  const [statements, setStatements] = useState<StatementOverviewData[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads statements from the backend API.
   */
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
    // noinspection JSIgnoredPromiseFromCall
    fetchStatements();
  }, [fetchStatements]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Gehaltsabrechnungen
      </Typography>
      <ErrorSnackbar error={error} onClose={() => setError(null)} />
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <StatementDataGrid
            statements={statements}
            onRefreshAction={fetchStatements}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
