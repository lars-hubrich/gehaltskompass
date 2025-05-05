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
  const res = await fetch(`/api/posts`, {
    cache: "no-store",
  });
  const posts: Post[] = await res.json();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CRUD-Beispiel</h1>
      <PostForm />
      <PostList initialPosts={posts} />
    </main>
  );
}
