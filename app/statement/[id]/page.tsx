"use client";

import StatementForm from "@/app/components/StatementForm";
import { useParams } from "next/navigation";

export default function StatementPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center drop-shadow-md">
          {params.id === "new"
            ? "Neue Abrechnung erstellen"
            : "Abrechnung bearbeiten"}
        </h1>
        <StatementForm statementId={params.id} />
      </div>
    </div>
  );
}
