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
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

const mockRequire = requireAuthenticatedUser as jest.Mock;
const mockHandleError = handleError as jest.Mock;

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

  it("handles errors on DELETE", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.user.delete as unknown as jest.Mock).mockRejectedValueOnce("fail");
    const res = await DELETE();
    expect(mockHandleError).toHaveBeenCalledWith("fail", "DELETE /api/user");
    expect(res.status).toBe(500);
  });
});
