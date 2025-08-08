import * as React from "react";
import { Alert, Snackbar } from "@mui/material";

interface ErrorSnackbarProps {
  error: string | null;
  onClose: () => void;
}

/**
 * Displays an error message inside a snackbar.
 *
 * @param {ErrorSnackbarProps} props - Component properties.
 * @returns {JSX.Element} Rendered snackbar component.
 */
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
