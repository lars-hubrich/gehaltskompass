import * as React from "react";
import Divider from "@mui/material/Divider";
import AppTheme from "@/theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import AppAppBar from "@/components/login/AppAppBar";
import Hero from "@/components/login/Hero";
import Features from "@/components/login/Features";

export default function Login() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <div id="top" />
      <AppAppBar />
      <Hero />
      <div>
        <div id="features">
          <Features />
        </div>
        <Divider />
      </div>
    </AppTheme>
  );
}
