"use client";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status } = useSession();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return <>{children}</>;
}
