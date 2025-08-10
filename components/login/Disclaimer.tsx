"use client";
import React, { JSX, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from "@mui/material";

/**
 * Disclaimer and privacy policy modal for the public landing page.
 *
 * @returns {JSX.Element} The disclaimer component.
 */
export default function Disclaimer(): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ mt: 4, textAlign: "center", px: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Diese Seite befindet sich noch in der Entwicklung. Deine Daten werden
        durch Vercel, Supabase, die Gemini API sowie zu administrativen Zwecken
        verarbeitet.
        <br />
        <Link
          href="https://www.telekom.de/impressum"
          target="_blank"
          rel="noopener"
        >
          Impressum
        </Link>{" "}
        |{" "}
        <Button onClick={() => setOpen(true)} variant="text" size="small">
          Datenschutzerklärung
        </Button>
      </Typography>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="privacy-policy-title"
      >
        <DialogTitle id="privacy-policy-title">
          Datenschutzerklärung
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Diese Anwendung befindet sich noch in der Entwicklung. Beim Anmelden
            werden deine Daten an Dienste von Vercel, Supabase und der Gemini
            API übermittelt, dort verarbeitet und zu administrativen Zwecken
            gespeichert. Bitte verwende die Anwendung nur, wenn du damit
            einverstanden bist.
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Cookies
          </Typography>
          <Typography variant="body2" gutterBottom>
            Wir verwenden ausschließlich technisch notwendige Cookies, um deine
            Sitzung aufrechtzuerhalten und dich nach dem Login zu
            authentifizieren. Diese Cookies werden nicht zu Analyse- oder
            Marketingzwecken eingesetzt und verfallen automatisch nach dem
            Ausloggen.
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Weitere gespeicherte Daten
          </Typography>
          <Typography variant="body2" gutterBottom>
            Neben den eingegebenen Nutzerdaten werden serverseitig Protokolle
            über Zugriffe gespeichert, um einen sicheren Betrieb zu
            gewährleisten. Diese Logs werden regelmäßig gelöscht.
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Deine Rechte
          </Typography>
          <Typography variant="body2" gutterBottom>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und
            Einschränkung der Verarbeitung deiner Daten. Wende dich hierfür an
            die im verlinkten Impressum genannten Kontaktmöglichkeiten.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
