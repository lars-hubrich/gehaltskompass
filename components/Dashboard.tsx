"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Statement {
  id: string;
  month: number;
  year: number;
  brutto_tax: number;
  payout_netto: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [statements, setStatements] = useState<Statement[]>([]);

  useEffect(() => {
    const fetchStatements = async () => {
      const res = await fetch("/api/statement");
      if (res.ok) {
        const data = await res.json();
        setStatements(data);
      }
    };
    fetchStatements();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="flex flex-col w-full max-w-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm text-center sm:text-left">
            Willkommen,{" "}
            <span className="text-green-700">{session?.user?.id}</span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/statement/new")}
              className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition font-semibold text-base focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Neue Abrechnung
            </button>
            <button
              onClick={() => signOut()}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 transition font-semibold text-base focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Ausloggen
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Abrechnungen
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-700 uppercase text-xs leading-normal">
                <tr>
                  <th className="py-3 px-6 text-left">Jahr</th>
                  <th className="py-3 px-6 text-left">Monat</th>
                  <th className="py-3 px-6 text-right">Steuer-Brutto</th>
                  <th className="py-3 px-6 text-right">Netto-Auszahlung</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-medium">
                {statements.map((statement, idx) => (
                  <tr
                    key={statement.id}
                    className={`border-b border-gray-200 hover:bg-green-50 cursor-pointer transition ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                    onClick={() => router.push(`/statement/${statement.id}`)}
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {statement.year}
                    </td>
                    <td className="py-3 px-6 text-left">{statement.month}</td>
                    <td className="py-3 px-6 text-right">
                      {statement.brutto_tax.toFixed(2)} €
                    </td>
                    <td className="py-3 px-6 text-right">
                      {statement.payout_netto.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
