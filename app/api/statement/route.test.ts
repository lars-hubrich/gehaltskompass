/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  statement: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
}));
jest.mock("@/lib/server-utils", () => ({
  requireAuthenticatedUser: jest.fn(),
  handleError: jest.fn(),
}));

import { GET, POST, DELETE } from "./route";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/server-utils";

// Cast mocks to `any` to keep tests simple
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRequire = requireAuthenticatedUser as any;
describe("/api/statement root", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if not authenticated on GET", async () => {
    mockRequire.mockResolvedValueOnce(
      NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 }),
    );
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns statements for authenticated user", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.findMany as any).mockResolvedValueOnce([{ id: "s1" }]);
    const res = await GET();
    expect(prisma.statement.findMany).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: "s1" }]);
  });

  it("creates statement on POST", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.count as jest.Mock).mockResolvedValueOnce(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.create as any).mockResolvedValueOnce({ id: "s1" });
    const req = new Request("http://localhost/api/statement", {
      method: "POST",
      body: JSON.stringify({ month: 1, year: 2024, incomes: [] }),
    });
    const res = await POST(req as NextRequest);
    expect(prisma.statement.create).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  it("returns 403 if user exceeded limit on POST", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    (prisma.statement.count as jest.Mock).mockResolvedValueOnce(20);
    const req = new Request("http://localhost/api/statement", {
      method: "POST",
      body: JSON.stringify({ month: 1, year: 2024, incomes: [] }),
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(403);
  });

  it("returns 400 if no ids on DELETE", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    const req = new Request("http://localhost/api/statement", {
      method: "DELETE",
      body: JSON.stringify({}),
    });
    const res = await DELETE(req as NextRequest);
    expect(res.status).toBe(400);
  });

  it("deletes statements on DELETE", async () => {
    mockRequire.mockResolvedValueOnce({ id: "u1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.statement.deleteMany as any).mockResolvedValueOnce({
      count: 2,
    });
    const req = new Request("http://localhost/api/statement", {
      method: "DELETE",
      body: JSON.stringify({ ids: ["a", "b"] }),
    });
    const res = await DELETE(req as NextRequest);
    expect(prisma.statement.deleteMany).toHaveBeenCalled();
    expect(await res.json()).toEqual({ deletedCount: 2 });
  });
});
