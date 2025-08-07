"use client";

import * as React from "react";
import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function ChatTestPage() {
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
        mt: 2,
        mb: 4,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Gehaltsabrechnungs-Chat
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          noValidate
        >
          <TextField
            label="Stelle hier deine Frage zu deinen Abrechnungsdaten und erhalte KI-gestützte Antworten."
            multiline
            rows={4}
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || question.trim() === ""}
            sx={{ alignSelf: "center", minWidth: 150 }}
          >
            {loading ? <CircularProgress size={24} /> : "Frage stellen"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Fehler: {error}
          </Alert>
        )}
        {answer && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, borderRadius: 1 }}>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {answer}
            </Typography>
          </Paper>
        )}
      </Paper>
    </Box>
  );
}
