"use client";
import { signIn } from "next-auth/react";

export default function Page() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CRUD-Beispiel</h1>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl mb-6">Willkommen</h1>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Mit Google einloggen
        </button>
        <button
          onClick={() => signIn("github")}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Mit GitHub einloggen
        </button>
      </div>
    </main>
  );
}
