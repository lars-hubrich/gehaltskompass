'use client';

import useSWR from 'swr';
import { useState, ChangeEvent, FormEvent } from 'react';
import { Post } from '../page';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PostListProps {
    initialPosts: Post[];
}

export default function PostList({ initialPosts }: PostListProps) {
    const { data: posts, mutate } = useSWR<Post[]>('/api/posts', fetcher, {
        fallbackData: initialPosts,
    });

    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<{ title: string; content: string }>({ title: '', content: '' });

    const startEdit = (post: Post) => {
        setEditId(post.id);
        setForm({ title: post.title, content: post.content || '' });
    };

    const handlePatch = async (e: FormEvent) => {
        e.preventDefault();
        if (editId === null) return;
        await fetch(`/api/posts/${editId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        mutate();
        setEditId(null);
    };

    return (
        <ul>
            {posts?.map((post) => (
                <li key={post.id} className="mb-4 border-b pb-2">
                    {editId === post.id ? (
                        <form onSubmit={handlePatch} className="mb-2">
                            <input
                                value={form.title}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
                                className="border p-1 w-full mb-1"
                            />
                            <textarea
                                value={form.content}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, content: e.target.value })}
                                className="border p-1 w-full mb-1"
                            />
                            <button type="submit" className="mr-2">Speichern</button>
                            <button type="button" onClick={() => setEditId(null)}>
                                Abbrechen
                            </button>
                        </form>
                    ) : (
                        <>
                            <h2 className="font-semibold">{post.title}</h2>
                            <p className="text-sm mb-1">{post.content}</p>
                            <button onClick={() => startEdit(post)} className="text-blue-500">
                                Bearbeiten
                            </button>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}
