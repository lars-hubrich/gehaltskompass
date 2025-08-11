"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Renders a full-screen loading indicator.
 *
 * @returns {JSX.Element} Loading screen component.
 */
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
