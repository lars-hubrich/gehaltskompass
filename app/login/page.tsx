"use client";
import * as React from "react";
import Divider from "@mui/material/Divider";
import AppAppBar from "@/components/login/AppAppBar";
import Hero from "@/components/login/Hero";
import Features from "@/components/login/Features";

export default function LoginPage() {
  return (
    <>
      <div id="top" />
      <AppAppBar />
      <Hero />
      <div>
        <div id="features">
          <Features />
        </div>
        <Divider />
      </div>
    </>
  );
}
