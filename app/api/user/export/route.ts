import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthenticatedUser, handleError } from "@/lib/server-utils";

export async function GET() {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userOrRes.id },
      include: { statements: { include: { incomes: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return handleError(error, "GET /api/user/export");
  }
}

