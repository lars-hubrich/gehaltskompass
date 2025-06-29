"use client";

import { useSession, signIn } from "next-auth/react";
import React, { ReactNode } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl mb-6">Willkommen</h1>
        <p className="mb-4">
          Bitte authentifizieren Sie sich, um fortzufahren.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => signIn("github")}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Mit GitHub einloggen
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
