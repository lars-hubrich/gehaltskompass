"use client";
import { useSession } from "next-auth/react";
import React from "react";
import { redirect } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Layout wrapper ensuring the user is authenticated before rendering children.
 *
 * @param {Readonly<{ children: React.ReactNode }>} param0 React child components.
 * @returns {JSX.Element} The authenticated layout or redirect/loading state.
 */
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
