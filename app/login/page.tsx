"use client";
import * as React from "react";
import Divider from "@mui/material/Divider";
import AppAppBar from "@/components/login/AppAppBar";
import Hero from "@/components/login/Hero";
import Disclaimer from "@/components/login/Disclaimer";

/**
 * Renders the public landing page with login and feature sections.
 *
 * @returns {JSX.Element} The login page component.
 */
export default function LoginPage() {
  return (
    <>
      <AppAppBar />
      <Hero />
      <Divider />
      <Disclaimer />
    </>
  );
}
