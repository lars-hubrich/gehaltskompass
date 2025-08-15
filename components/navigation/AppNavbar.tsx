import * as React from "react";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Stack from "@mui/material/Stack";
import MuiToolbar from "@mui/material/Toolbar";
import { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SideMenuMobile from "./SideMenuMobile";
import MenuButton from "./MenuButton";
import ColorModeIconDropdown from "@/theme/ColorModeIconDropdown";
import { usePathname } from "next/navigation";

const Toolbar = styled(MuiToolbar)({
  width: "100%",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  justifyContent: "center",
  gap: "12px",
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: "8px",
    p: "8px",
    pb: 0,
  },
});

/**
 * Mobile app bar navigation component.
 *
 * @returns {JSX.Element} App navigation bar.
 */
export default function AppNavbar() {
  const [open, setOpen] = React.useState(false);

  const pathname = usePathname();
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

  /**
   * Returns a handler to toggle the mobile side drawer.
   *
   * @param {boolean} newOpen - Desired open state.
   * @returns {() => void} Event handler.
   */
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: "auto", md: "none" },
        boxShadow: 0,
        bgcolor: "background.paper",
        backgroundImage: "none",
        borderBottom: "1px solid",
        borderColor: "divider",
        top: "var(--template-frame-height, 0px)",
      }}
    >
      <Toolbar variant="regular">
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            flexGrow: 1,
            width: "100%",
            gap: 1,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: "text.primary", mr: "auto" }}
          >
            {title}
          </Typography>
          <ColorModeIconDropdown />
          <MenuButton aria-label="Menü" onClick={toggleDrawer(true)}>
            <MenuRoundedIcon />
          </MenuButton>
          <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
