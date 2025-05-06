import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
  });
  if (!post) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { title, content } = await request.json();
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { title, content },
  });
  return NextResponse.json(post);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.post.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}
