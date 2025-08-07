"use client";

import * as React from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Header from "@/components/dashboard/Header";
import AuthGuard from "@/components/AuthGuard";
import AppNavbar from "@/components/dashboard/AppNavbar";
import SideMenu from "@/components/dashboard/SideMenu";
import AppTheme from "@/theme/AppTheme";
import { usePathname } from "next/navigation";
import {
  chartsCustomizations,
  dataGridCustomizations,
} from "@/theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const title = React.useMemo(() => {
    if (pathname === "/dashboard") {
      return "Dashboard";
    }
    if (pathname.includes("/dashboard/chat")) {
      return "AI Insights";
    }
    return undefined;
  }, [pathname]);

  return (
    <AuthGuard>
      <AppTheme themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: "flex" }}>
          <SideMenu />
          <AppNavbar />
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: "auto",
            })}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: "center",
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              <Header />
              {children}
            </Stack>
          </Box>
        </Box>
      </AppTheme>
    </AuthGuard>
  );
}
