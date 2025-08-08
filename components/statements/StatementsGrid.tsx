"use client";

import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatementDataGrid from "./StatementDataGrid";
import { useState, useEffect, useCallback } from "react";
import { StatementOverviewData } from "@/constants/Interfaces";

export default function StatementsGrid() {
  const [statements, setStatements] = useState<StatementOverviewData[]>([]);

  const fetchStatements = useCallback(async () => {
    const res = await fetch("/api/statement");
    if (res.ok) {
      const data = await res.json();
      setStatements(data);
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
