import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

/**
 * Deletes the currently authenticated user and all related data.
 *
 * @returns {Promise<NextResponse>} A success message or an error response.
 */
export async function DELETE() {
  const userOrRes = await requireAuthenticatedUser();
  if (!("id" in userOrRes)) return userOrRes;
  try {
    await prisma.user.delete({ where: { id: userOrRes.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, "DELETE /api/user");
  }
}
