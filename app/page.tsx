"use client";
import { signIn } from "next-auth/react";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";

export interface Post {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export default async function Page() {
  const res = await fetch(
    `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/posts`,
    {
      cache: "no-store",
    },
  );
  const posts: Post[] = await res.json();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CRUD-Beispiel</h1>
      <PostForm />
      <PostList initialPosts={posts} />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl mb-6">Willkommen</h1>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Mit Google einloggen
        </button>
      </div>
    </main>
  );
}
