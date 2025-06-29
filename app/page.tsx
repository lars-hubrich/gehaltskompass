"use client";
import AuthGuard from "@/components/AuthGuard";
import Dashboard from "./components/Dashboard";

export default function Page() {
  return (
    <AuthGuard>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 p-6">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center drop-shadow-sm">
            Willkommen im Dashboard
          </h1>
          <Dashboard />
        </div>
      </main>
    </AuthGuard>
  );
}
