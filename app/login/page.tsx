"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  CheckCircleOutline,
} from "@mui/icons-material";
import { signIn } from "next-auth/react";
import Image from "next/image";

const bulletPoints = [
  "Sofortige Analyse deiner Gehaltsabrechnungen",
  "KI-gestützte Einblicke in deine Finanzen",
  "Sicher und privat - deine Daten gehören dir",
];

// 🌙 Dark mode-freundliches Theme mit Primärfarbe
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

export default function LandingPage() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        }}
      >
        {/* 🧭 Navbar */}
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Image
              src="/images/logo_transparent.png"
              alt="Logo"
              width={200}
              height={200}
            />
          </Toolbar>
        </AppBar>

        {/* 🔐 Login Area */}
        <Container maxWidth="md" sx={{ mt: 10 }}>
          <Paper elevation={3} sx={{ p: 5, borderRadius: 4 }}>
            <Grid
              container
              spacing={4}
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h3" gutterBottom>
                  Analysiere deine Gehaltsabrechnung!
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Erhalte Einblick in deine Gehaltsabrechnungen mit
                  detaillierten Betrachtungen und smarten KI-Zusammenfassungen.
                </Typography>
                <List dense>
                  {bulletPoints.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleOutline color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={point} />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={() => signIn("google")}
                  >
                    Anmelden mit Google
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GitHubIcon />}
                    onClick={() => signIn("github")}
                  >
                    Anmelden mit GitHub
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
