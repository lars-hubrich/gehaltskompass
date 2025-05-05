"use client";

import { useState, FormEvent } from "react";
import { mutate } from "swr";
import { Post } from "../page";

export default function PostForm() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) return;
    const newPost: Post = await res.json();
    mutate<Post[]>("/api/posts", (posts = []) => [newPost, ...posts], false);
    setTitle("");
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div>
        <label htmlFor="title">Titel</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <div className="mt-2">
        <label htmlFor="content">Inhalt</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white">
        Erstellen
      </button>
    </form>
  );
}
