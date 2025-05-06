"use client";
import AuthGuard from "../../components/AuthGuard";
// import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ItemsPage() {
  // const { data: session } = useSession();
  const { data, mutate } = useSWR("/api/items", fetcher);
  const [content, setContent] = useState("");

  const addItem = async () => {
    if (!content.trim()) return;
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setContent("");
    mutate();
  };

  return (
    <AuthGuard>
      <div className="p-4">
        <h1 className="text-2xl mb-4">Deine Liste</h1>
        <ul>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {data?.map((item: any) => <li key={item.id}>{item.content}</li>)}
        </ul>
        <div className="mt-4">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border p-2 mr-2"
          />
          <button
            onClick={addItem}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
