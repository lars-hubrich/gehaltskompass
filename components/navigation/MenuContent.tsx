import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AssistantIcon from "@mui/icons-material/Assistant";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const mainListItems = [
  { text: "Übersicht", icon: <AnalyticsRoundedIcon />, path: "/dashboard" },
  {
    text: "Abrechnungen",
    icon: <AccountBalanceIcon />,
    path: "/statements",
  },
  { text: "AI Insights", icon: <AssistantIcon />, path: "/insights" },
];

export default function MenuContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [openSettings, setOpenSettings] = React.useState(false);
  const [openAbout, setOpenAbout] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const secondaryListItems = [
    {
      text: "Einstellungen",
      icon: <SettingsRoundedIcon />,
      action: () => setOpenSettings(true),
    },
    {
      text: "Über uns",
      icon: <InfoRoundedIcon />,
      action: () => setOpenAbout(true),
    },
  ];

  const handleExport = async () => {
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) return;
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gehaltskompass-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore errors
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await fetch("/api/user/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
    } catch {
      // ignore errors
    } finally {
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!confirm("Möchten Sie Ihren Account wirklich löschen?")) return;
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (res.ok) {
        signOut();
      }
    } catch {
      // ignore errors
    }
  };

  const title = React.useMemo(() => {
    if (pathname === "/dashboard") {
      return "Übersicht";
    } else if (pathname === "/statements") {
      return "Abrechnungen";
    } else if (pathname === "/insights") {
      return "AI Insights";
    }
    return undefined;
  }, [pathname]);

  return (
    <Stack sx={{ flexGrow: 1, p: 1 }} spacing={1}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={item.text === title}
              onClick={() => {
                router.push(item.path);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton onClick={item.action}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={openAbout} onClose={() => setOpenAbout(false)}>
        <DialogTitle>Über uns</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            GehaltsKompass hilft dir, deine Gehaltsabrechnungen zu verwalten und
            auszuwerten.
          </Typography>
          <Typography gutterBottom>
            GitHub Repo:{" "}
            <Link
              href="https://github.com/lars-hubrich/gehaltskompass"
              target="_blank"
              rel="noopener"
            >
              github.com/lars-hubrich/gehaltskompass
            </Link>
          </Typography>
          <Typography>
            Entwickelt von Annabelle Schulz, Jan Lieder und Lars Hubrich.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAbout(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSettings} onClose={() => setOpenSettings(false)}>
        <DialogTitle>Einstellungen</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <input
              type="file"
              accept="application/json"
              hidden
              ref={fileInputRef}
              onChange={handleImportFile}
            />
            <Button variant="outlined" onClick={handleExport}>
              Daten exportieren
            </Button>
            <Button variant="outlined" onClick={handleImportClick}>
              Daten importieren
            </Button>
            <Button color="error" variant="outlined" onClick={handleDelete}>
              Account löschen
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
