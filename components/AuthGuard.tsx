"use client";

import { useSession } from "next-auth/react";
import React, { ReactNode } from "react";
import AppTheme from "@/shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import AppAppBar from "@/components/login/AppAppBar";
import Hero from "@/components/login/Hero";
import Features from "@/components/login/Features";
import Divider from "@mui/material/Divider";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
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

  return <>{children}</>;
}
