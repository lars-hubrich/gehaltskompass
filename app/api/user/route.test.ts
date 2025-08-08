/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  user: { delete: jest.fn() },
}));
jest.mock("@/lib/server-utils", () => ({
  requireAuthenticatedUser: jest.fn(),
  handleError: jest.fn(),
}));

import { DELETE } from "./route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthenticatedUser, handleError } from "@/lib/server-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRequire = requireAuthenticatedUser as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockHandleError = handleError as any;

describe("/api/user", () => {
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
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("deletes user on DELETE", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.user.delete as unknown as jest.Mock).mockResolvedValueOnce({});
    const res = await DELETE();
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
    expect(res.status).toBe(200);
  });
});

