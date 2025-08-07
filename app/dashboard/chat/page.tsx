"use client";

import { useState } from "react";

export default function ChatTestPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAnswer(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Unbekannter Fehler");
      }

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Lohnabrechnungs-Chat
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full border rounded p-2 h-24 resize-none"
            placeholder="Stelle hier deine Frage zu deinen Abrechnungsdaten..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || question.trim() === ""}
          >
            {loading ? "Lädt..." : "Frage stellen"}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-red-600 text-center">Fehler: {error}</p>
        )}
        {answer && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h2 className="font-medium mb-2">Antwort:</h2>
            <p className="whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
