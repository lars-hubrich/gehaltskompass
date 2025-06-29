"use client";

import StatementForm from "@/app/components/StatementForm";
import { useParams } from "next/navigation";

export default function StatementPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center drop-shadow-sm">
          {params.id === "new"
            ? "Neue Abrechnung erstellen"
            : "Abrechnung bearbeiten"}
        </h1>
        <StatementForm statementId={params.id} />
      </div>
    </div>
  );
}
