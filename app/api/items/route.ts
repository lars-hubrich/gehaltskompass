import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const items = await prisma.item.findMany({
    where: { user: { id: session.user.email } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { content } = await request.json();
  const item = await prisma.item.create({
    data: {
      content,
      user: { connect: { id: session.user.email } },
    },
  });
  return NextResponse.json(item, { status: 201 });
}
