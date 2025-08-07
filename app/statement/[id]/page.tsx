"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { Box, Container, Paper } from "@mui/material";
import StatementForm from "@/components/StatementForm";
import AppTheme from "@/theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";

export default function StatementPage() {
  const params = useParams<{ id: string }>();

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 6,
        }}
      >
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <StatementForm statementId={params.id} />
          </Paper>
        </Container>
      </Box>
    </AppTheme>
  );
}
