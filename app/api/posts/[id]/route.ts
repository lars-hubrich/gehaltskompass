import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const post = await prisma.post.findUnique({
        where: { id: Number(params.id) }
    });
    if (!post) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(post);
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { title, content } = await request.json();
    const post = await prisma.post.update({
        where: { id: Number(params.id) },
        data: { title, content }
    });
    return NextResponse.json(post);
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    await prisma.post.delete({ where: { id: Number(params.id) } });
    return new Response(null, { status: 204 });
}
