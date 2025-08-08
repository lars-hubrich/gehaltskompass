import * as React from "react";
import { Snackbar, Alert } from "@mui/material";

interface ErrorSnackbarProps {
  error: string | null;
  onClose: () => void;
}

export default function ErrorSnackbar({ error, onClose }: ErrorSnackbarProps) {
  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity="error" sx={{ width: "100%" }}>
        {error}
      </Alert>
    </Snackbar>
  );
}
