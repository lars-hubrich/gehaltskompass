import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AssistantIcon from "@mui/icons-material/Assistant";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { usePathname, useRouter } from "next/navigation";

const mainListItems = [
  { text: "Übersicht", icon: <AnalyticsRoundedIcon />, path: "/dashboard" },
  {
    text: "Abrechnungen",
    icon: <AccountBalanceIcon />,
    path: "/statements",
  },
  { text: "AI Insights", icon: <AssistantIcon />, path: "/insights" },
];

const secondaryListItems = [
  { text: "Einstellungen", icon: <SettingsRoundedIcon /> },
  { text: "Über uns", icon: <InfoRoundedIcon /> },
];

export default function MenuContent() {
  const pathname = usePathname();
  const router = useRouter();

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
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
