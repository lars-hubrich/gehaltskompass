"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "@/app/shared-theme/AppTheme";
import AppAppBar from "@/app/components/AppAppBar";
import Hero from "@/app/components/Hero";
import Highlights from "@/app/components/Highlights";
import Features from "@/app/components/Features";

export default function LandingPage() {
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
        <div id="highlights">
          <Highlights />
        </div>
        <Divider />
      </div>
    </AppTheme>
  );
}
