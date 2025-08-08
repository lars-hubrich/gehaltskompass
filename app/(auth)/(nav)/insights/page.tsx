"use client";

import * as React from "react";
import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  Paper,
  Stack,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import ErrorSnackbar from "@/components/ErrorSnackbar";

/**
 * Page component that allows users to ask questions about their statements via AI.
 *
 * @returns {JSX.Element} The insights chat page.
 */
export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    "Wie viel habe ich letzten Monat Netto verdient?",
    "Wie viele Sozialabgaben habe ich letzten Monat gezahlt?",
    "Wie hoch war mein Brutto-Gehalt im letzten Jahr?",
    "Welche Abzüge hatte ich im letzten Monat?",
    "Wie setzt sich mein Gehalt zusammen?",
    "Vergleiche mein Gehalt der letzten 3 Monate.",
  ];

  /**
   * Handles form submission to request an AI-generated answer.
   *
   * @param {React.FormEvent} e Form submission event.
   * @returns {Promise<void>} Resolves when the request finishes.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
    <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Typography variant="h5" align="center">
            AI Insights
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Stelle Fragen zu deinen Abrechnungsdaten und erhalte KI-gestützte
            Antworten.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <TextareaAutosize
                  minRows={3}
                  placeholder="Was möchtest du über deine Abrechnungsdaten wissen?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid",
                    padding: 12,
                    background: "transparent",
                    color: "inherit",
                    outline: "none",
                  }}
                />
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || question.trim() === ""}
                sx={{
                  alignSelf: "center",
                  minWidth: 150,
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Frage stellen"}
              </Button>
            </Stack>
          </Box>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Beispielanfragen:
            </Typography>
            <Grid container spacing={1}>
              {examplePrompts.map((prompt) => (
                <Grid item xs={12} sm={6} key={prompt}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => setQuestion(prompt)}
                  >
                    {prompt}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Stack>
          <ErrorSnackbar error={error} onClose={() => setError(null)} />
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
