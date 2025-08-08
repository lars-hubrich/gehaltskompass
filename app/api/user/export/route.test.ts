/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  user: { findUnique: jest.fn() },
}));
jest.mock("@/lib/server-utils", () => ({
  requireAuthenticatedUser: jest.fn(),
  handleError: jest.fn(),
}));

import { GET } from "./route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthenticatedUser, handleError } from "@/lib/server-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRequire = requireAuthenticatedUser as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockHandleError = handleError as any;

describe("/api/user/export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleError.mockImplementation((e: unknown) =>
      NextResponse.json({ error: String(e) }, { status: 500 }),
    );
  });

  it("returns 401 if not authenticated", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns user data", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.user.findUnique as unknown as jest.Mock).mockResolvedValueOnce({
      id: "u1",
    });
    const res = await GET();
    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "u1" });
  });
});

