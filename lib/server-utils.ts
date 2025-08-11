import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Ensures a request is made by an authenticated user and returns that user.
 *
 * If no authenticated user is found, a {@link NextResponse} with an error
 * message and appropriate status code is returned instead.
 *
 * @returns {Promise<User | NextResponse>} The authenticated user or an error response.
 */
export async function requireAuthenticatedUser(): Promise<User | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 404 },
    );
  }

  return user;
}

/**
 * Logs an error for a given route and returns a 500 response.
 *
 * @param {unknown} error The error that occurred.
 * @param {string} route The API route where the error occurred.
 * @returns {NextResponse} A JSON response containing the error message.
 */
export function handleError(error: unknown, route: string): NextResponse {
  console.error(`${route} error:`, error);
  const message =
    error instanceof Error ? error.message : "Interner Serverfehler";
  return NextResponse.json({ error: message }, { status: 500 });
}
