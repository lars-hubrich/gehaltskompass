"use client";

import { useSession } from "next-auth/react";
import React, { ReactNode } from "react";
import Login from "@/components/Login";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <Login />;
  }

  return <>{children}</>;
}
