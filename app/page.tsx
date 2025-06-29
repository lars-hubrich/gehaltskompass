"use client";
import AuthGuard from "@/components/AuthGuard";
import Dashboard from "./components/Dashboard";

export default function Page() {
  return (
    <AuthGuard>
      <main>
        <Dashboard />
      </main>
    </AuthGuard>
  );
}
