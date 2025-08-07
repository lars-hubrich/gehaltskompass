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
  Stack,
  Avatar,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        p: { xs: 2, md: 4 },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 600,
          width: "100%",
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <ChatBubbleOutlineIcon />
          </Avatar>
          <Typography variant="h4" component="h1">
            Gehaltsabrechnungs-Chat
          </Typography>
        </Stack>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          noValidate
        >
          <TextField
            label="Frage zu deinen Abrechnungsdaten"
            placeholder="Stelle hier Fragen und erhalte KI-gestützte Antworten"
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
            size="large"
            disabled={loading || question.trim() === ""}
            sx={{ alignSelf: "center", minWidth: 180 }}
          >
            {loading ? <CircularProgress size={28} /> : "Frage stellen"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Fehler: {error}
          </Alert>
        )}

        {answer && (
          <Paper
            variant="outlined"
            sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: "grey.50" }}
          >
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
