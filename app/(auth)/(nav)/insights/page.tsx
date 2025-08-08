"use client";

import * as React from "react";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
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

  // noinspection XmlDeprecatedElement
  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Typography variant="h5" align="center">
            KI Insights
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Stelle Fragen zu deinen Abrechnungsdaten und erhalte KI-gestützte
            Antworten.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Deine Frage"
                placeholder="Was möchtest du über deine Abrechnungsdaten wissen?"
                multiline
                minRows={6}
                fullWidth
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
                InputProps={{ sx: { alignItems: "flex-start" } }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || question.trim() === ""}
                sx={{
                  alignSelf: "center",
                  minWidth: 150,
                  "&.Mui-disabled": {
                    backgroundColor: (theme) =>
                      theme.palette.action.disabledBackground,
                    color: (theme) => theme.palette.text.primary,
                  },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Frage stellen"}
              </Button>
            </Stack>
          </Box>
          {error && <Alert severity="error">Fehler: {error}</Alert>}
          {answer && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {answer}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
