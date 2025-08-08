"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Wird geladen...</Typography>
    </Box>
  );
}
