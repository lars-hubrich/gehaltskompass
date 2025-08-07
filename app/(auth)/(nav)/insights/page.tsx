"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnswer(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const err = await res.json();
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(err.error || "Unbekannter Fehler");
      }

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", md: 800 },
        mx: "auto",
        mt: 4,
        mb: 6,
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{ p: 4, borderRadius: 2, bgcolor: "background.paper" }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Gehaltsabrechnungs-Chat
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              placeholder="Stelle deine Frage zu deinen Abrechnungsdaten..."
              multiline
              rows={5}
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <Box textAlign="center">
              <Button
                type="submit"
                variant="contained"
                disabled={loading || question.trim() === ""}
                sx={{ minWidth: 160, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : "Frage stellen"}
              </Button>
            </Box>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 1 }}>
            Fehler: {error}
          </Alert>
        )}

        {answer && (
          <Paper
            variant="outlined"
            sx={{ mt: 4, p: 3, borderRadius: 1, bgcolor: "grey.50" }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Deine Frage:
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 2, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {question}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              KI-Antwort:
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {answer}
            </Typography>
          </Paper>
        )}
      </Paper>
    </Box>
  );
}
