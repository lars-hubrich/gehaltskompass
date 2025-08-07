"use client";
import * as React from "react";
import { SessionProvider } from "next-auth/react";
import AppTheme from "@/theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import {
  chartsCustomizations,
  dataGridCustomizations,
} from "@/theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppTheme themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        {children}
      </AppTheme>
    </SessionProvider>
  );
}
