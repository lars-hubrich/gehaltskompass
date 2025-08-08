/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  statement: { create: jest.fn(), deleteMany: jest.fn() },
}));
jest.mock("@/lib/server-utils", () => ({
  requireAuthenticatedUser: jest.fn(),
  handleError: jest.fn(),
}));

import { POST } from "./route";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError, requireAuthenticatedUser } from "@/lib/server-utils";

const mockRequire = requireAuthenticatedUser as jest.Mock;
const mockHandleError = handleError as jest.Mock;

describe("/api/user/import", () => {
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
    const req = new Request("http://localhost/api/user/import", {
      method: "POST",
      body: JSON.stringify({ statements: [] }),
    });
    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(401);
  });

  it("imports statements and ignores ids", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.create as jest.Mock).mockResolvedValueOnce({ id: "s1" });
    const req = new Request("http://localhost/api/user/import", {
      method: "POST",
      body: JSON.stringify({
        statements: [
          {
            id: "old",
            user_id: "uOld",
            month: 1,
            year: 2024,
            incomes: [
              {
                id: "i1",
                statement_id: "old",
                name: "n",
                identifier: "id",
                value: 5,
              },
            ],
          },
        ],
      }),
    });
    const res = await POST(req as unknown as NextRequest);
    expect(prisma.statement.deleteMany).toHaveBeenCalledWith({
      where: { user_id: "u1" },
    });
    expect(prisma.statement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: "u1",
        month: 1,
        year: 2024,
        incomes: { create: [{ name: "n", identifier: "id", value: 5 }] },
      }),
      include: { incomes: true },
    });
    expect(res.status).toBe(201);
  });
});
