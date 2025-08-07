"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { Box, Container, Paper } from "@mui/material";
import StatementForm from "@/components/StatementForm";
import AppTheme from "@/theme/AppTheme";

export default function StatementPage() {
  const params = useParams<{ id: string }>();

  return (
    <AppTheme>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 6,
          background: "linear-gradient(90deg, #E3F2FD 0%, #E1F5FE 100%)",
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
