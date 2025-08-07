"use client";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect } from "next/navigation";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status } = useSession();

  // TODO fix loading screen
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return <>{children}</>;
}
